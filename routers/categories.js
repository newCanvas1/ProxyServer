const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} = require("../dbFunctions");
const categoriesRouter = express.Router();
categoriesRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;
  const expenses = await getCategories(uid, planId);
  console.log(expenses);
  res.json(expenses);
});

categoriesRouter.post("/add", async (req, res) => {
  let { name, uid, planId } = req.body;
  amount = Math.ceil(Math.random() * 500);
  const rndmMonth = Math.floor(Math.random() * 12);
  const rndmDay = Math.ceil(Math.random() * 29);
  const date = new Date();
  date.setMonth(rndmMonth);
  date.setDate(rndmDay);
  const response = await addCategory(uid, planId, {
    name,
    createdAt: date,
  });
  res.json(response);
});
categoriesRouter.post("/delete", async (req, res) => {
  const { uid, expenseId, planId, categoryId } = req.body;
  const response = await deleteCategory(uid, planId, categoryId, expenseId);
  console.log(response);
  res.json(response);
});

categoriesRouter.post("/update", async (req, res) => {
  const { uid, categoryId, updateFields, planId } = req.body;
  const response = await updateCategory(uid, planId, categoryId, updateFields);
  console.log(response);
  res.json(1);
});

module.exports = categoriesRouter;
