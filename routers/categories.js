const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getCategoriesAmount,
  getCategoryInfo,
  getAmountSpentThisYearPerMonthOfCategory,
  getCategorySpendingPerUser,
} = require("../dbFunctions/categories");
const { getAmountSpentThisWeekPerDay } = require("../dbFunctions/expenses");

const categoriesRouter = express.Router();
categoriesRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;

  const categories = await getCategories(uid, planId);

  if (categories) {
    res.json({ success: true, data: categories });
  } else {
    console.log("categories get failed");
    res.json({ success: false });
  }
});
categoriesRouter.post("/spending/thisWeek", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  const expenses = await getAmountSpentThisWeekPerDay(uid, planId, categoryId);
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});

categoriesRouter.post("/spending/thisYear", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  const expenses = await getAmountSpentThisYearPerMonthOfCategory(
    uid,
    planId,
    categoryId
  );
  if (expenses) {
    res.json({ success: true, data: expenses });
  } else {
    res.json({ success: false });
  }
});

categoriesRouter.post("/add", async (req, res) => {
  let { name, icon, uid, planId, limit } = req.body;
  if (name == "" || icon == "" || uid == "" || planId == "") {
    res.status(400).json({ success: false });
    return;
  }
  const date = new Date();
  let category = {
    name,
    icon,
    limit,
    createdAt: date,
  };
  const response = await addCategory(uid, planId, category);
  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});
categoriesRouter.post("/delete", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  if (uid == "" || planId == "" || categoryId == "") {
    res.status(400).json({ success: false });
    return;
  }
  const response = await deleteCategory(uid, planId, categoryId);

  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
categoriesRouter.post("/all/amount", async (req, res) => {
  const { uid, planId } = req.body;
  if (uid == "" || planId == "") {
    res.status(400).json({ success: false });
    return;
  }
  const response = await getCategoriesAmount(uid, planId);

  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});
categoriesRouter.post("/info/family", async (req, res) => {
  const { planId, categoryId } = req.body;
  if (planId == "" || categoryId == "") {
    res.status(400).json({ success: false });
    return;
  }
  console.log("planId", planId, "categoryId", categoryId);
  const response = await getCategorySpendingPerUser(planId, categoryId);

  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});

categoriesRouter.post("/info", async (req, res) => {
  const { uid, planId, categoryId } = req.body;
  if (uid == "" || planId == "") {
    res.status(400).json({ success: false });
    return;
  }
  console.log("uid", uid, "planId", planId, "categoryId", categoryId);
  const response = await getCategoryInfo(uid, planId, categoryId);

  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
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
    res.status(400).json({ success: false });
    return;
  }

  const response = await updateCategory(uid, planId, categoryId, updateFields);

  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

module.exports = categoriesRouter;
