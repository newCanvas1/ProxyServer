const express = require("express");
const {
  getUserGoals,
  addGoal,
  deleteGoal,
  updateGoal,
  getGoalField,
  getCurrentBudget,
} = require("../dbFunctions/goals");
const { getFirstLastExpensesDuration } = require("../dbFunctions/expenses");
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
  let { goalId, goalName, goalCost, goalDate, currentPlan, uid } = req.body;
  console.log("add end point hit, goal is ", {
    goalId,
    goalName,
    goalCost,
    goalDate,
    currentPlan,
    uid,
  });
  const response = await addGoal(uid, currentPlan, {
    goalId,
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

goalsRouter.delete("/delete/:uid/:planId/:goalId", (req, res) => {
  const { uid, planId, goalId } = req.params;
  const response = deleteGoal(uid, planId, goalId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

goalsRouter.put("/update", async (req, res) => {
  const { uid, currentPlan, goalId, updatedGoal } = req.body;
  const response = await updateGoal(uid, currentPlan, goalId, updatedGoal);
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

goalsRouter.get("/goals-total-saving/:uid/:planId", async (req, res) => {
  // first we need to get current budget
  const { uid, planId } = req.params;
  const currentBudget = await getCurrentBudget(uid, planId);
  const durationInHours = await getFirstLastExpensesDuration(uid, planId);
  const savedAmountPerHour = currentBudget / durationInHours;
  res.json({ success: true, savedAmountPerHour });
});
module.exports = goalsRouter;
