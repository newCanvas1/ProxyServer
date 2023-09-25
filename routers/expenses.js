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
  let { name, category, /*amount,*/ uid, planId, categoryId } = req.body;
  amount = Math.ceil(Math.random() * 500);
  console.log(amount);
  const rndmMonth = Math.floor(Math.random() * 12);
  const rndmDay = Math.ceil(Math.random() * 29);
  const date = new Date();
  date.setMonth(rndmMonth);
  date.setDate(rndmDay);
  const response = await addExpense(uid, planId, categoryId, {
    name,
    category,
    amount,
    createdAt: date,
  });
  res.json(response);
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId, categoryId } = req.body;
  const response = await deleteExpense(uid, planId, categoryId, expenseId);
  console.log(response);
  res.json(response);
});

expensesRouter.post("/update", async (req, res) => {
  const { uid, expenseId, updateFields, planId ,categoryId} = req.body;
  const response = await updateExpense(uid, planId,categoryId, expenseId, updateFields);
  console.log(response);
  res.json(1);
});

// expensesRouter.post("/perMonth/all", async (req, res) => {
//   const { uid, planId } = req.body;
//   const response = await categorizeDocumentsByMonth(uid, planId);
//   res.json(response);
// });
// expensesRouter.post("/perMonth/amount", async (req, res) => {
//   const { uid, planId } = req.body;
//   const response = await categorizeDocumentsByMonthAmountOnly(uid, planId);
//   res.json(response);
// });
// expensesRouter.post("/lastWeek", async (req, res) => {
//   const { uid, planId } = req.body;
//   const response = await getAmountSpentPerDayLastWeek(uid, planId);
//   res.json(response);
// });
module.exports = expensesRouter;
