const express = require("express");
const {
  getUserGoals,
  addGoal,
  deleteGoal,
  updateGoal,
  getGoalField,
} = require("../dbFunctions/goals");
const { updateDoc } = require("firebase/firestore");
const goalsRouter = express.Router();
goalsRouter.post("/", async (req, res) => {
  const { uid, planId } = req.body;
  const goals = await getUserGoals(uid, planId);
  if (goals) {
    res.json({ success: true, goals: goals });
  } else {
    res.json({ success: false, msg: "invalid" });
  }
});

goalsRouter.post("/add", async (req, res) => {
  let { name, amount, endDate, uid, planId } = req.body;
  if (name == "" || amount == "" || endDate == "") {
    res.json({ success: false });
    return;
  }
  const date = new Date();
  const response = await addGoal(uid, planId, {
    name,
    amount,
    endDate,
    createdAt: date,
  });
  if (response) {
    res.json({ success: true });
  } else {
    console.log("Addition failed");
    res.json({ success: false });
  }
});
goalsRouter.post("/delete", async (req, res) => {
  const { uid, planId, goalId } = req.body;
  const response = await deleteGoal(uid, planId, goalId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

goalsRouter.post("/update", async (req, res) => {
  const { uid, planId, goalId, updateFields } = req.body;
  if (
    updateFields.name == "" ||
    updateFields.amount == "" ||
    updateFields.endDate == ""
  ) {
    res.json({ success: false });
    return;
  }
  console.log(uid, planId, goalId, updateFields);
  const response = await updateGoal(uid, planId, goalId, updateFields);
  console.log("HERE is", response);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
goalsRouter.post("/field", async (req, res) => {
  const { uid, planId, goalId, field } = req.body;
  console.log(uid, field, planId);

  const response = await getGoalField(uid, planId, goalId, field);
  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});

module.exports = goalsRouter;
