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
  console.log(uid, planId, "categories");
  const categories = await getCategories(uid, planId).catch((err) =>
    console.log(err)
  );
  console.log(categories);
  res.json(categories);
});

categoriesRouter.post("/add", async (req, res) => {
  let { name, icon, uid, planId } = req.body;
  if (name == "" || icon == "") {
    res.status(400).send("invalid");
    return;
  }
  console.log(name, icon, uid, planId);

  const date = new Date();

  const response = await addCategory(uid, planId, {
    name,
    icon,
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
