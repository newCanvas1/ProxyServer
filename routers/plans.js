const express = require("express");
const { getUserPlans, addPlan, getNumberOfPlans, deletePlan, updatePlan, getField } = require("../dbFunctions/plans");
const { updateUser } = require("../dbFunctions/user");

const plansRouter = express.Router();
plansRouter.post("/", async (req, res) => {
  const { uid } = req.body;
  const plans = await getUserPlans(uid);
  if (plans) {
    res.json(plans);
  } else {
    console.log("Plans get failed")
    res.json({ msg: "invalid" });
  }
});

plansRouter.post("/add", async (req, res) => {
  let { name, budget, uid } = req.body;
  if (name == "" || budget == "") {
    res.json({ msg: "invalid" });
    return;
  }
  const date = new Date();
  const response = await addPlan(uid, {
    name,
    budget,
    createdAt: date,
  });
  if (response) {
    console.log("Response is", response, uid);
    await updateUser(uid, { lastPlan: response }).catch((err) => {
      console.log(err);
    });
    res.json(response);
    console.log(response, "has been added");
  } else {
    console.log("Addition failed");
    res.json({ msg: "invalid" });
  }
});
plansRouter.post("/delete", async (req, res) => {
  const { uid, planId } = req.body;
  const numOfPlans = await getNumberOfPlans(uid);
  if (numOfPlans == 1) {
    // res.json({ msg: "You must have atleast one plan." });
  } else {
    const response = await deletePlan(uid, planId);
    console.log(response);
    if (response) {
      res.json({ msg: "deleted" });
    } else {
      res.json({ msg: "invalid" });
    }
  }
});

plansRouter.post("/update", async (req, res) => {
  const { uid, updateFields, planId } = req.body;
  if (updateFields.name == "" || updateFields.budget == "") {
    res.json({ msg: "invalid" });
    return;
  }
  const response = await updatePlan(uid, updateFields, planId);
  console.log(response,"updated");
  res.json({ msg: "updated" });
});
plansRouter.post("/field", async (req, res) => {
  const { uid, field, planId } = req.body;
  console.log(uid, field, planId);

  const response = await getField(uid, planId, field).catch((err) =>
    console.log(err)
  );
  console.log(response);
  res.json(response);
});

module.exports = plansRouter;
