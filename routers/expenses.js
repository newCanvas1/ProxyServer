const express = require("express");
const {
  getExpenses,
  getExpensesBetweenDates,
  getExpensesByField,
  addExpense,
  deleteExpense,
  updateExpense,
  getExpenseAmount,
} = require("../dbFunctions/expenses");
const { updateDoc, doc } = require("firebase/firestore");
const { getField, updateSpending } = require("../dbFunctions/plans");
const { db } = require("../firebaseConfig");

const expensesRouter = express.Router();
expensesRouter.post("/", async (req, res) => {
  const { uid, planId, categoryId, lastDocument } = req.body;
  const expenses = await getExpenses(uid, planId, categoryId, lastDocument);
  console.log(expenses[expenses.length - 1]);
  res.json(expenses);
});
expensesRouter.get("/between", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  const expenses = await getExpensesBetweenDates(uid, planId, categoryId);
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
  res.json(expenses);
});
expensesRouter.post("/add", async (req, res) => {
  let { name, amount, uid, category, planId, categoryId } = req.body;
  if (name == "" || amount == "") {
    res.status(400).send({ msg: "invalid" });
    return;
  }
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
    await updateSpending(uid, planId, amount, "increment");
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId, categoryId } = req.body;
  const amount = await getExpenseAmount(uid, planId, categoryId, expenseId);
  console.log(amount, "Deleted amount");
  if (!amount) {
    res.json({ msg: "invalid" });
    return;
  }
  updateSpending(uid, planId, parseFloat(amount), "decrement");

  const response = await deleteExpense(uid, planId, categoryId, expenseId);
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
  const amount = await getExpenseAmount(uid, planId, categoryId, expenseId);

  const response = await updateExpense(
    uid,
    planId,
    categoryId,
    expenseId,
    updateFields
  );

  if (response) {
    if (amount) {
      if (updateFields.amount < amount) {
        updateSpending(
          uid,
          planId,
          parseFloat(amount) - parseFloat(updateFields.amount),
          "decrement"
        );
      } else {
        updateSpending(
          uid,
          planId,
          parseFloat(updateFields.amount) - parseFloat(amount),
          "increment"
        );
      }
    } else {
      res.json({ msg: "invalid" });
      return;
    }
    res.json({ msg: "updated" });
  } else {
    res.json({ msg: "invalid" });
  }
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
