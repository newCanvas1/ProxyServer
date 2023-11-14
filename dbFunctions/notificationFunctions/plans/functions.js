const { getDoc, doc } = require("firebase/firestore");
const { addNotification } = require("../../notifications");
const { db } = require("../../../firebaseConfig");

async function categoryBudgetExceeded(info) {
  const { uid, planId, spending, budget } = info; // if any of those is undefined, return

  if (!uid || !planId || !spending || !budget) {
    return;
  }
  const isAlreadyExceeded = spending > budget;

  if (isAlreadyExceeded) {
    return;
  }

  setTimeout(async () => {
    const budgetField = await getField(uid, planId, "budget");
    const spendingField = await getField(uid, planId, "spending");
    const exceeded = spendingField > budgetField;

    if (exceeded) {
      addNotification(uid, planId, {
        message: "You exceeded your budget!",
        type: "warning",
        icon: "wallet",
        isRead: false,
        createdAt: new Date(),
      });
    }
  }, 1000);
}
async function categoryHalfBudgetExceeded(info) {
  const { uid, planId, spending, budget } = info; // if any of those is undefined, return

  if (!uid || !planId || !spending || !budget) {
    return;
  }
  const isAlreadyHalf = spending > budget * 0.5;

  if (isAlreadyHalf) {
    return;
  }

  setTimeout(async () => {
    const budgetField = await getField(uid, planId, "budget");
    const spendingField = await getField(uid, planId, "spending");
    const exceededHalf = budgetField - spendingField < budgetField * 0.5;

    if (exceededHalf) {
      addNotification(uid, planId, {
        message: "You exceeded half your budget!",
        type: "warning",
        icon: "wallet",
        isRead: false,
        createdAt: new Date(),
      });
    }
  }, 1000);
}

async function getField(uid, planId, field) {
  // here we need the user id

  try {
    const docRef = doc(db, "User", uid, "Plans", planId);

    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      // change user state
      if (docSnap.data()[field] == undefined) {
        return false;
      }
      return docSnap.data()[field];
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  categoryHalfBudgetExceeded,
  categoryBudgetExceeded
};
