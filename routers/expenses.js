const express = require("express");
const {
  getExpenses,
  getExpensesBetweenDates,
  getExpensesByField,
  addExpense,
  deleteExpense,
  updateExpense,
} = require("../dbFunctions/expenses");
const { updateDoc, doc } = require("firebase/firestore");
const { getField } = require("../dbFunctions/plans");
const { db } = require("../firebaseConfig");

const expensesRouter = express.Router();
expensesRouter.post("/", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  const expenses = await getExpenses(uid, planId, categoryId);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/between", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  const expenses = await getExpensesBetweenDates(uid, planId, categoryId);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/field", async (req, res) => {
  const { uid, field, value, planId, categoryId } = req.body;
  const expenses = await getExpensesByField(
    uid,
    planId,
    categoryId,
    field,
    value
  );
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.post("/add", async (req, res) => {
  let { name, amount, uid, category, planId, categoryId } = req.body;
  if (name == "" || amount == "") {
    res.status(400).send({ msg: "invalid" });
    return;
  }
  console.log("Adding");
  const MAX = 5;
  const date = new Date();
  const expense = {
    name,
    amount,
    category,
    createdAt: date,
  };

  const response = await addExpense(uid, planId, categoryId, expense);
  const recentList = await getField(uid, planId, "recentExpenses");
  if (recentList) {
    if (recentList.length == MAX) {
      recentList.shift();
    }
    recentList.push(expense);
    setRecentExpenses(recentList, uid, planId);
  } else {
    setRecentExpenses([expense], uid, planId);
  }
  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId, categoryId } = req.body;
  const response = await deleteExpense(uid, planId, categoryId, expenseId);
  // updateBudget(uid, planId, amount, "increment");
  if (response) {
    res.json({ msg: "deleted" });
  } else {
    res.json({ msg: "invalid" });
  }
});

expensesRouter.post("/update", async (req, res) => {
  const { uid, expenseId, updateFields, planId, categoryId } = req.body;
  if (updateFields.name == "" || updateFields.amount == "") {
    res.json({ msg: "invalid" });
    return;
  }
  const response = await updateExpense(
    uid,
    planId,
    categoryId,
    expenseId,
    updateFields
  );
  if (response) {
    res.json({ msg: "updated" });
  } else {
    res.json({ msg: "invalid" });
  }
});
expensesRouter.post("/add/recent", async (req, res) => {
  const { uid, planId } = req.body;
  const response = setRecentExpenses([1, 2, 3], uid, planId);
  console.log(response);
  res.json(1);
});
function setRecentExpenses(myArray, uid, planId) {
  try {
    const routinesQuery = doc(db, "User", uid, "Plans", planId);

    // Create an array

    // Set the value of the array in Firebase
    updateDoc(routinesQuery, { recentExpenses: myArray })
      .then(function () {
        console.log("Array added to Firebase successfully!");
      })
      .catch(function (error) {
        console.error("Error adding array to Firebase: ", error);
      });
  } catch (error) {
    console.log(error);
  }
}
module.exports = expensesRouter;
