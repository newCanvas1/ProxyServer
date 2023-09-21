const express = require("express");
const {
  deleteExpense,
  getExpenses,
  addExpense,
  updateExpense,
  getExpensesBetweenDates,
  getExpensesByField,
} = require("../dbFunctions");
const expensesRouter = express.Router();
expensesRouter.get("/", async (req, res) => {
  const { uid } = req.body;
  const expenses = await getExpenses(uid);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/between", async (req, res) => {
  const { uid } = req.body;
  const expenses = await getExpensesBetweenDates(uid);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/field", async (req, res) => {
  const { uid, field, value } = req.body;
  const expenses = await getExpensesByField(uid, field, value);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.post("/add", async (req, res) => {
  const { name, category, amount, uid } = req.body;
  const response = await addExpense(uid, {
    name,
    category,
    amount,
    createdAt: new Date(),
  });
  res.json(response);
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId } = req.body;
  const response = await deleteExpense(uid, expenseId);
  console.log(response);
  res.json(response);
});

expensesRouter.post("/update", async (req, res) => {
  const { uid, expenseId, updateFields } = req.body;
  const response = await updateExpense(uid, expenseId, updateFields);
  console.log(response);
  res.json(1);
});
module.exports = expensesRouter;
