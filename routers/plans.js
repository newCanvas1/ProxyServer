const express = require("express");
const {
  getUserPlans,
  addPlan,
  getNumberOfPlans,
  deletePlan,
  updatePlan,
  getField,
} = require("../dbFunctions/plans");
const { updateUser } = require("../dbFunctions/user");

const plansRouter = express.Router();
plansRouter.post("/", async (req, res) => {
  const { uid } = req.body;
  const plans = await getUserPlans(uid);
  if (plans) {
    res.json(plans);
  } else {
    console.log("Plans get failed");
    res.json({ msg: "invalid" });
  }
});

plansRouter.post("/add", async (req, res) => {
  let { plan, uid } = req.body;
  // if any of plan properties is empty, retun invalid
  const { name, budget, currency } = plan;
  if ((name == "" || budget == "", currency == "")) {
    res.json({ msg: "invalid" });
    return;
  }
  const date = new Date();
  const response = await addPlan(uid, {
    ...plan,
    spending: 0,
    createdAt: date,
  });
  if (response) {
    await updateUser(uid, { lastPlan: response }).catch((err) => {
      console.log(err);
    });
    res.json(response);
  } else {
    console.log("Addition failed");
    res.json({ msg: "invalid" });
  }
});
plansRouter.post("/delete", async (req, res) => {
  const { uid, planId } = req.body;
  const numOfPlans = await getNumberOfPlans(uid);
  if (numOfPlans == 1) {
    res.json({ msg: "invalid" });
  } else {
    const response = await deletePlan(uid, planId);

    if (response) {
      res.json({ msg: "deleted" });
    } else {
      res.json({ msg: "invalid" });
    }
  }
});

plansRouter.post("/update", async (req, res) => {
  const { uid, updateFields, planId } = req.body;

  if (
    updateFields.name == "" ||
    updateFields.budget == "" ||
    updateFields.currency == ""
  ) {
    res.json({ msg: "invalid" });
    return;
  }

  const response = await updatePlan(uid, updateFields, planId);

  res.json({ msg: "updated" });
});
plansRouter.post("/field", async (req, res) => {
  const { uid, field, planId } = req.body;
  if (field == "budget") {
    const budget = await getField(uid, planId, "budget");
    const spending = await getField(uid, planId, "spending");
    const currency = await getField(uid, planId, "currency");

    res.json({ budget, spending, currency });
    return;
  }
  const response = await getField(uid, planId, field);
  if (response) {
    res.json(response);
  } else {
    res.json({ msg: "invalid" });
  }
});

module.exports = plansRouter;
