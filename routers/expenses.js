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
  getAmountSpentThisWeekPerDay,
  getExpensesPerDay,
} = require("../dbFunctions/expenses");
const { updateSpending } = require("../dbFunctions/plans");
const expensesRouter = express.Router();
expensesRouter.post("/", async (req, res) => {
  const { uid, planId, categoryId, order, lastDocument } = req.body;
  const expenses = await getExpenses(
    uid,
    planId,
    categoryId,
    order,
    lastDocument
  );
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});
expensesRouter.post("/perDay", async (req, res) => {
  const { uid, planId, categoryId, order, lastDocument } = req.body;
  const expenses = await getExpensesPerDay(
    uid,
    planId,
    categoryId,
    order,
    lastDocument
  );
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});
expensesRouter.post("/spending/thisWeek", async (req, res) => {
  const { uid, planId } = req.body;
  const expenses = await getAmountSpentThisWeekPerDay(uid, planId);
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
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
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});
expensesRouter.post("/add", async (req, res) => {
  let { name, amount, uid, category, planId, categoryId, icon } = req.body;
  if (name == "" || amount == "" || isNaN(amount)) {
    res.status(400).send({ success: false });
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
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});
expensesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId, categoryId } = req.body;
  const amount = await getExpenseAmount(uid, planId, categoryId, expenseId);

  if (!amount) {
    res.json({ success: false });
    return;
  }
  updateSpending(uid, planId, parseFloat(amount), "decrement");

  const response = await deleteExpense(uid, planId, categoryId, expenseId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

expensesRouter.post("/update", async (req, res) => {
  const { uid, expenseId, updateFields, planId, categoryId } = req.body;
  if (updateFields.name == "" || updateFields.amount == "") {
    res.json({ success: false });
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
      res.json({ success: false });
      return;
    }
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

expensesRouter.post("/recent", async (req, res) => {
  const { uid, planId } = req.body;

  const expenses = await getRecentExpenses(uid, planId, 10);
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});

module.exports = expensesRouter;
