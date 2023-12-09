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
const { getFirstLastExpensesDuration, getAllExpenses } = require("./expenses");

async function addGoal(uid, planId, goal) {
  try {
    await setDoc(
      doc(db, "User/" + uid + "/Plans/" + planId + "/Goals", goal.goalId),
      goal
    );
    return true;
  } catch (error) {
    console.error("Error in Adding Goal: ", error);
    return false;
  }
}
function deleteGoal(uid, planId, goalId) {
  const docPath = `User/${uid}/Plans/${planId}/Goals`;
  try {
    deleteDoc(doc(db, docPath, goalId))
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  } catch (error) {
    console.error("Error in deleting goal ", error);
    return false;
  }
}

async function updateGoal(uid, planId, goalId, updatedGoal) {
  try {
    const batch = writeBatch(db);
    const docPath = `User/${uid}/Plans/${planId}/Goals`;
    const ref = doc(db, docPath, goalId);
    batch.update(ref, {
      goalName: updatedGoal.newGoalName,
      goalCost: updatedGoal.newGoalCost,
      goalDate: updatedGoal.newDate,
    });
    await batch.commit();
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getUserGoals(uid, planId) {
  try {
    let list = [];
    const planIDQuery = query(
      collection(db, "User", uid, "Plans", planId, "Goals")
    );

    const IDQuerySnapshot = await getDocs(planIDQuery);
    if (IDQuerySnapshot) {
      IDQuerySnapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
    } else {
      return false;
    }

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getGoalField(uid, planId, goalId, field) {
  // here we need the user id

  try {
    const docRef = doc(db, "User", uid, "Plans", planId, "Goals", goalId);

    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      // change user state
      return docSnap.data()[field];
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
  }
}

const getCurrentBudget = async (uid, planId) => {
  try {
    const budgetRef = doc(db, "User", uid, "Plans", planId);
    const budgetSnap = await getDoc(budgetRef);
    let budget = "";
    if (budgetSnap.exists()) {
      budget = parseInt(budgetSnap.data()["budget"]);
    }
    // get all expenses amount
    const allExpenses = await getAllExpenses(uid, planId);
    let amount = 0;
    allExpenses.map((expense) => {
      amount += parseInt(expense.amount);
    });

    // return current budget
    return budget - amount;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  addGoal,
  deleteGoal,
  updateGoal,
  getUserGoals,
  getGoalField,
  getCurrentBudget,
};
