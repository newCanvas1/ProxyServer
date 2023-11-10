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
const { addNotification } = require("./notifications");
async function addPlan(uid, plan) {
  try {
    const ref = collection(db, "User", uid, "Plans");
    const doc = await addDoc(ref, plan);
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function updateSpending(uid, planId, value, type) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId);
    let newSpending = 0;
    const docSnap = await getDoc(ref);
    // if it exists
    if (docSnap.exists()) {
      const spending = docSnap.data().spending;
      const budget = docSnap.data().budget;

      if (type == "decrement") {
        newSpending = parseFloat(spending) - parseFloat(value);
      } else {
        newSpending = parseFloat(spending) + parseFloat(value);
      }

      updateDoc(ref, { spending: newSpending });
      const isHalfReached = spending > budget * 0.5;

      if (!isHalfReached) {
        // if it is not reached, we check if it is now
        checkBudgetAndNotify(uid, planId);
      }
      return;
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
  }
  return doc.id;
}
async function deletePlan(uid, planId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId);

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
async function getUserPlans(uid) {
  try {
    let list = [];

    const planIDQuery = query(collection(db, "User", uid, "Plans"));

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
async function updatePlan(uid, updateFields, planId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId);
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
async function getNumberOfPlans(id) {
  try {
    const routinesQuery = query(collection(db, "User", id, "Plans"));
    const routinesQuerySnapshot = await getDocs(routinesQuery);
    const numberOfDocs = routinesQuerySnapshot.size;
    return numberOfDocs;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function checkBudgetAndNotify(uid, planId) {
  const budget = await getField(uid, planId, "budget");
  const spending = await getField(uid, planId, "spending");
  const exceededHalf = budget - spending < budget * 0.5;
  if (exceededHalf) {
    addNotification(uid, planId, {
      message: "You exceeded half your budget!",
      type: "warning",
      isRead: false,
      createdAt: new Date(),
    });
  }
}

module.exports = {
  addPlan,
  deletePlan,
  updatePlan,
  getUserPlans,
  getNumberOfPlans,
  getField,
  updateSpending,
  checkBudgetAndNotify,
};
