const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getCategoriesAmount,
  getCategoryInfo
} = require("../dbFunctions/categories");

const categoriesRouter = express.Router();
categoriesRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;

  const categories = await getCategories(uid, planId);

  if (categories) {
    res.json(categories);
  } else {
    console.log("categories get failed");
    res.json({ msg: "invalid" });
  }
});

categoriesRouter.post("/add", async (req, res) => {
  let { name, icon, uid, planId, limit } = req.body;
  console.log("limit", limit);
  if (name == "" || icon == "" || uid == "" || planId == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }

  const date = new Date();

  const response = await addCategory(uid, planId, {
    name,
    icon,
    limit,
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
categoriesRouter.post("/all/amount", async (req, res) => {
  const { uid, planId } = req.body;
  if (uid == "" || planId == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  const response = await getCategoriesAmount(uid, planId);

  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});

categoriesRouter.post("/info", async (req, res) => {
  const { uid, planId ,categoryId} = req.body;
  if (uid == "" || planId == "") {
    res.status(400).json({ msg: "invalid" });
    return;
  }
  const response = await getCategoryInfo(uid, planId,categoryId);

  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});
categoriesRouter.post("/update", async (req, res) => {
  const { uid, categoryId, updateFields, planId } = req.body;
  if (
    uid == "" ||
    planId == "" ||
    categoryId == "" ||
    updateFields.name == "" ||
    isNaN(updateFields.limit) ||
    updateFields.limit == ""
  ) {
    res.status(400).json({ msg: "invalid" });
    return;
  }

  const response = await updateCategory(uid, planId, categoryId, updateFields);

  if (response) {
    res.json({ msg: "updated" });
  } else {
    res.json({ msg: "invalid" });
  }
});

module.exports = categoriesRouter;
