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

goalsRouter.get("/get-goals/:uid/:currentPlan", async (req, res) => {
  const { uid, currentPlan } = req.params;
  const goals = await getUserGoals(uid, currentPlan);
  console.log("user goals are ", goals);
  if (goals) {
    res.json({ success: true, goals: goals });
  } else {
    res.json({ success: false, msg: "invalid" });
  }
});

goalsRouter.post("/add", async (req, res) => {
  let { goalName, goalCost, goalDate, currentPlan, uid } = req.body;
  console.log("add end point hit, goal is ", {
    goalName,
    goalCost,
    goalDate,
    currentPlan,
    uid,
  });
  const response = await addGoal(uid, currentPlan, {
    goalName,
    goalCost,
    goalDate,
    createdAt: new Date(),
  });

  if (response) {
    res.json({ success: true });
  } else {
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

  const response = await updateGoal(uid, planId, goalId, updateFields);

  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
goalsRouter.post("/field", async (req, res) => {
  const { uid, planId, goalId, field } = req.body;

  const response = await getGoalField(uid, planId, goalId, field);
  if (response) {
    res.json({ success: true, data: response });
  } else {
    res.json({ success: false });
  }
});

module.exports = goalsRouter;
