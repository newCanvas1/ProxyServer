const express = require("express");
const {
  getExpenses,
  getExpensesBetweenDates,
  getExpensesByField,
  addExpense,
  deleteExpense,
  updateExpense,
  getExpenseAmount,
  getRecentExpenses,
} = require("../dbFunctions/expenses");
const { updateSpending } = require("../dbFunctions/plans");
const expensesRouter = express.Router();
expensesRouter.post("/", async (req, res) => {
  const { uid, planId, categoryId,order, lastDocument } = req.body;
  const expenses = await getExpenses(uid, planId, categoryId,order, lastDocument);

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
  let { name, amount, uid, category, planId, categoryId, icon } = req.body;
  if (name == "" || amount == "") {
    res.status(400).send({ msg: "invalid" });
    return;
  }
  const date = new Date();
  const expense = {
    name,
    amount,
    category: category.name,
    categoryId,
    createdAt: date,
  };
  const response = await addExpense(uid, planId, categoryId, expense);

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

expensesRouter.post("/recent", async (req, res) => {
  const { uid, planId } = req.body;

  const expenses = await getRecentExpenses(uid, planId, 10);
  res.json(expenses);
});

module.exports = expensesRouter;
