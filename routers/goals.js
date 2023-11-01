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
  const plans = await getUserGoals(uid, planId);
  if (plans) {
    res.json(plans);
  } else {
    console.log("Plans get failed");
    res.json({ msg: "invalid" });
  }
});

goalsRouter.post("/add", async (req, res) => {
  let { name, amount, endDate, uid, planId } = req.body;
  if (name == "" || amount == "" || endDate == "") {
    res.json({ msg: "invalid" });
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
    console.log("Response is", response, uid);

    res.json(response);
    console.log(response, "has been added");
  } else {
    console.log("Addition failed");
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
  console.log(uid, planId, goalId, updateFields)
  const response = await updateGoal(uid, planId, goalId, updateFields);
  console.log("HERE is",response)
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
