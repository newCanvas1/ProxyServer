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
} = require("../firebaseConfig");

async function addGoal(uid, planId, goal) {
  try {
    const ref = collection(db, "User", uid, "Plans", planId, "Goals");
    const doc = await addDoc(ref, goal);
    return true;
  } catch (error) {
    console.error("Error in Adding Goal: ", error);
    return false;
  }
}
async function deleteGoal(uid, planId, goalId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Goals", goalId);

    await deleteDoc(ref)
      .then(async () => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
    return true;
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
async function updateGoal(uid, planId, goalId, updateFields) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Goals", goalId);
    let result = false;
    await updateDoc(ref, {
      ...updateFields,
    })
      .then(() => {
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
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
module.exports = {
  addGoal,
  deleteGoal,
  updateGoal,
  getUserGoals,
  getGoalField,
};
