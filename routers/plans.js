const express = require("express");
const {
  getUserPlans,
  addPlan,
  getNumberOfPlans,
  deletePlan,
  updatePlan,
  getField,
  addFamilyPlan,
  handleInviteAccept,
  handleInviteReject,
  sendInvitesToNewMembers,
  deletePlanFromDeletedMembers,
  handleFamilyPlanDelete,
} = require("../dbFunctions/plans");
const { updateUser } = require("../dbFunctions/user");
const { updateDoc, doc } = require("firebase/firestore");
const { db } = require("../firebaseConfig");
const { checkIfFamilyPlan } = require("../dbFunctions/general/functions");

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
plansRouter.post("/invite", async (req, res) => {
  const { uid, invite, email, accept, senderName } = req.body;
  let response = false;
  if (accept) {
    response = await handleInviteAccept(uid, invite, email, senderName);
  } else {
    response = await handleInviteReject(uid, invite, senderName);
  }
  res.json({ success: response });
});
plansRouter.post("/add", async (req, res) => {
  let { plan, uid, senderName } = req.body;
  let response = "";
  // if any of plan properties is empty, retun invalid
  const { name, budget, currency } = plan;
  if (name == "" || budget == "" || currency == "") {
    res.json({ success: false });
    return;
  }
  const date = new Date();

  if (plan.isFamilyPlan) {
    response = await addFamilyPlan(
      uid,
      {
        ...plan,
        spending: 0,
        createdAt: date,
      },
      senderName
    );
  } else {
    response = await addPlan(uid, {
      ...plan,
      spending: 0,
      createdAt: date,
    });
  }

  if (response) {
    await updateUser(uid, { lastPlan: response }).catch((err) => {
      console.log(err);
    });
    res.json({ success: true, data: response });
  } else {
    console.log("Addition failed");
    res.json({ success: false });
  }
});
plansRouter.post("/update/members", async (req, res) => {
  const { planId, members, senderName, planName } = req.body;
  // send ivites to new members
  try {
    await sendInvitesToNewMembers(planId, members, senderName, planName);
    await deletePlanFromDeletedMembers(planId, members);
    await updateDoc(doc(db, "family_plans", planId), { members });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});
plansRouter.post("/delete", async (req, res) => {
  const { uid, planId, senderName } = req.body;
  const numOfPlans = await getNumberOfPlans(uid);
  if (numOfPlans == 1) {
    res.json({ success: false });
  } else {
    const response = checkIfFamilyPlan(planId)
      ? await handleFamilyPlanDelete(uid, planId, senderName)
      : await deletePlan(uid, planId);
    if (response) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  }
});

plansRouter.post("/update", async (req, res) => {
  const { uid, updateFields, planId } = req.body;

  if (
    updateFields.name == "" ||
    updateFields.budget == "" ||
    updateFields.currency == "" ||
    updateFields.monthly_income == ""
  ) {
    res.json({ success: false });
    return;
  }

  const response = await updatePlan(uid, updateFields, planId);
  if (response) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
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
