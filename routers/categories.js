const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} = require("../dbFunctions/categories");

const categoriesRouter = express.Router();
categoriesRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;
  console.log(uid, planId, "categories");
  const categories = await getCategories(uid, planId);

  if (categories) {
    console.log(categories);
    res.json(categories);
  } else {
    console.log("categories get failed");
    res.json({ msg: "invalid" });
  }
});

categoriesRouter.post("/add", async (req, res) => {
  let { name, icon, uid, planId } = req.body;
  if (name == "" || icon == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  console.log(name, icon, uid, planId);

  const date = new Date();

  const response = await addCategory(uid, planId, {
    name,
    icon,
    createdAt: date,
  });
  if (response) {
    res.json(response);
  }
});
categoriesRouter.post("/delete", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  if (uid == "" || planId == "" || categoryId == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  const response = await deleteCategory(uid, planId, categoryId);

  if (response) {
    res.json({ msg: "deleted" });
    console.log("category deleted", categoryId);
  } else {
    res.json({ msg: "invalid" });
  }
});

categoriesRouter.post("/update", async (req, res) => {
  const { uid, categoryId, updateFields, planId } = req.body;
  console.log(uid, categoryId, updateFields, planId);
  if (updateFields.name == ""||updateFields.name == undefined ) {
    res.json({ msg: "invalid" });
    return;
  }
  const response = await updateCategory(uid, planId, categoryId, updateFields);
  console.log(response, "Hello");
  if (response) {
    res.json({ msg: "updated" });
  } else {
    res.json({ msg: "invalid" });
  }
});

module.exports = categoriesRouter;
