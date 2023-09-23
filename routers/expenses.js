const express = require("express");
const {
  deleteExpense,
  getExpenses,
  addExpense,
  updateExpense,
  getExpensesBetweenDates,
  getExpensesByField,
  categorizeDocumentsByMonth,
  categorizeDocumentsByMonthAmountOnly,
  getAmountSpentPerDayLastWeek,
} = require("../dbFunctions");
const expensesRouter = express.Router();
expensesRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;
  const expenses = await getExpenses(uid, planId);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/between", async (req, res) => {
  const { uid, planId } = req.body;
  const expenses = await getExpensesBetweenDates(uid, planId);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.get("/field", async (req, res) => {
  const { uid, field, value, planId } = req.body;
  const expenses = await getExpensesByField(uid, field, value, planId);
  console.log(expenses);
  res.json(expenses);
});
expensesRouter.post("/add", async (req, res) => {
  let { name, category, /*amount,*/ uid, planId } = req.body;
   amount = Math.ceil(Math.random() * 500);
  console.log(amount)
  const rndmMonth = Math.floor(Math.random() * 12);
  const rndmDay = Math.ceil(Math.random() * 29);
  const date = new Date();
  date.setMonth(rndmMonth);
  date.setDate(rndmDay);
  const response = await addExpense(
    uid,
    {
      name,
      category,
      amount,
      createdAt: date,
    },
    //      createdAt: new Date(),

    planId
  );
  res.json(response);
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId } = req.body;
  const response = await deleteExpense(uid, expenseId, planId);
  console.log(response);
  res.json(response);
});

expensesRouter.post("/update", async (req, res) => {
  const { uid, expenseId, updateFields, planId } = req.body;
  const response = await updateExpense(uid, expenseId, updateFields, planId);
  console.log(response);
  res.json(1);
});

expensesRouter.post("/perMonth/all", async (req, res) => {
  const { uid, planId } = req.body;
  const response = await categorizeDocumentsByMonth(uid, planId);
  res.json(response);
});
expensesRouter.post("/perMonth/amount", async (req, res) => {
  const { uid, planId } = req.body;
  const response = await categorizeDocumentsByMonthAmountOnly(uid, planId);
  res.json(response);
});
expensesRouter.post("/lastWeek", async (req, res) => {
  const { uid, planId } = req.body;
  const response = await getAmountSpentPerDayLastWeek(uid, planId);
  res.json(response);
});
module.exports = expensesRouter;
