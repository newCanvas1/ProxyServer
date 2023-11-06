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

goalsRouter.get("/get-goals/:uid/:planId", async (req, res) => {
  const { uid, planId } = req.params;
  const goals = await getUserGoals(uid, planId);
  if (goals) {
    res.json({ goals: goals });
  } else {
    console.log("Plans get failed");
    res.json({ msg: "invalid" });
  }
});

goalsRouter.post("/add", async (req, res) => {
  let { goalID, goalName, goalCoat, desiredDate, uid, planId } = req.body;
  const date = new Date();
  const response = await addGoal(uid, planId, {
    goalID,
    goalName,
    goalCoat,
    desiredDate,
    createdAt: date,
  });
  if (response) {
    res.json(response);
    console.log(response, "has been added");
  } else {
    console.log("goal addition failed");
    res.json({ msg: "invalid" });
  }
});
goalsRouter.post("/delete", async (req, res) => {
  const { uid, planId, goalId } = req.body;
  const response = await deleteGoal(uid, planId, goalId);
  if (response) {
    res.json({ msg: "deleted" });
  } else {
    res.json({ msg: "invalid" });
  }
});

goalsRouter.post("/update", async (req, res) => {
  const { uid, planId, goalId, updateFields } = req.body;
  if (
    updateFields.name == "" ||
    updateFields.amount == "" ||
    updateFields.endDate == ""
  ) {
    res.json({ msg: "invalid" });
    return;
  }
  console.log(uid, planId, goalId, updateFields);
  const response = await updateGoal(uid, planId, goalId, updateFields);
  console.log("HERE is", response);
  if (response) {
    res.json({ msg: "updated" });
  } else {
    res.json({ msg: "invalid" });
  }
});

goalsRouter.post("/field", async (req, res) => {
  const { uid, planId, goalId, field } = req.body;
  console.log(uid, field, planId);

  const response = await getGoalField(uid, planId, goalId, field);
  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});

module.exports = goalsRouter;
