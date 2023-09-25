const express = require("express");
const {
  deletePlan,
  addPlan,
  getNumberOfPlans,
  updatePlan,
  getUserPlans,
  updateUser,
  getField,
} = require("../dbFunctions");
const plansRouter = express.Router();
plansRouter.post("/", async (req, res) => {
  const { uid } = req.body;
  const plans = await getUserPlans(uid);
  console.log(plans);
  res.json(plans);
});

plansRouter.post("/add", async (req, res) => {
  let { name, budget, uid } = req.body;
  const date = new Date();
  const response = await addPlan(uid, {
    name,
    budget,
    createdAt: date,
  });
  updateUser(uid, { lastPlan: response });
  res.json(response);
});
plansRouter.post("/delete", async (req, res) => {
  const { uid, planId } = req.body;
  const numOfPlans = await getNumberOfPlans(uid);
  if (numOfPlans == 1) {
    res.json({ msg: "You must have atleast one plan." });
  } else {
    const response = await deletePlan(uid, planId);
    console.log(response);
    res.json(response);
  }
});

plansRouter.post("/update", async (req, res) => {
  const { uid, updateFields, planId } = req.body;
  const response = await updatePlan(uid, updateFields, planId);
  console.log(response);
  res.json(1);
});
plansRouter.post("/field", async (req, res) => {
  const { uid, field, planId } = req.body;
  console.log(uid,field,planId);

  const response = await getField(uid, planId, field);
  console.log(response);
  res.json(response);
});

module.exports = plansRouter;
