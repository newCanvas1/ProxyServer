const {
  doc,
  getDoc,
  collection,
  where,
  getDocs,
  query,
} = require("firebase/firestore");
const { db } = require("../../../firebaseConfig");
const { addNotification } = require("../../notifications");
const { checkIfFamilyPlan } = require("../../general/functions");

async function catgeoryLimitExceeded(info) {
  const { uid, planId, categoryId, updateFields } = info; // if any of those is undefined, return
  if (!uid || !planId || !categoryId || !updateFields) {
    return;
  }

  // get the limit of that category
  const ref = checkIfFamilyPlan(planId)
    ? doc(db, "family_plans", planId, "Categories", categoryId)
    : doc(db, "User", uid, "Plans", planId, "Categories", categoryId);

  const docSnap = await getDoc(ref);
  const limit = docSnap.data().limit;
  if (limit == 0) {
    return false;
  }
  // get total expenses amount of that category
  let total = await getTotalExpensesOfCategory(uid, planId, categoryId);
  if (!total) {
    return false;
  }

  const oldTotal = total - updateFields.amount;
  console.log(oldTotal, total, limit);
  // if the total is already greater than the limit, return true
  if (oldTotal > limit) {
    return false;
  }
  // check if the amount is greater than the limit
  if (total > limit) {
    // if yes, return false
    const message = {
      message: `You have exceeded the limit of ${updateFields.category}`,
      category: updateFields.category,
      importance: "high",
      icon: "chart-line",
      isRead: false,
      type:"categoryLimitExceeded",
      createdAt: new Date(),
    };
    addNotification(uid, planId, message);
    return;
  } else {
    // else return true

    return false;
  }
}

async function getTotalExpensesOfCategory(uid, planId, categoryId) {
  try {
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Expenses")
      : collection(db, "User", uid, "Plans", planId, "Expenses");

    const expensesQuery = query(ref, where("categoryId", "==", categoryId));
    const expensesQuerySnapshot = await getDocs(expensesQuery);
    let total = 0;
    expensesQuerySnapshot.forEach((doc) => {
      total += parseFloat(doc.data().amount);
    });
    return total;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  catgeoryLimitExceeded,
};
