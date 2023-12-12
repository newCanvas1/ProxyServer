const {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  db,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  writeBatch,
} = require("../firebaseConfig");
const { getCurrentBudget, getUserGoals } = require("../dbFunctions/goals");
const { getCategories, getCategoryInfo } = require("../dbFunctions/categories");
const { getUserPlans } = require("../dbFunctions/plans");
const express = require("express");

const financialReportRouter = express.Router();
let userInfo = {
  personalInfo: {
    name: "",
  },
  financialInfo: {
    budget: 0,
    categories: [],
    categoriesSpendings: [],
    plans: [],
    goals: [],
  },
};

financialReportRouter.get(
  "/user-financial-info/:uid/:planId",
  async (req, res) => {
    try {
      const { uid, planId, categoryId } = req.params;
      userInfo.personalInfo.name = await getUserName(uid);
      userInfo.financialInfo.budget = await getCurrentBudget(uid, planId);
      userInfo.financialInfo.categories = await getCategories(uid, planId);
      for (let i = 0; i < userInfo.financialInfo.categories.length; i++) {
        userInfo.financialInfo.categoriesSpendings[i] = await getCategoryInfo(
          uid,
          planId,
          userInfo.financialInfo.categories[i].id
        );
      }
      userInfo.financialInfo.plans = await getUserPlans(uid);
      userInfo.financialInfo.goals = await getUserGoals(uid, planId);
      return res.json({ success: true, userInfo });
    } catch (error) {
      console.log("failed in generating the report");
      res.json({ success: false });
    }
  }
);

const getUserName = async (uid) => {
  try {
    const docRef = doc(db, "User", uid);

    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      return docSnap.data().name;
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = financialReportRouter;
