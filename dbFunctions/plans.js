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
} = require("../firebaseConfig");
const {
  checkNotifications,
} = require("./notificationFunctions/notificationFunctions");
const {
  checkPlansNotifications,
} = require("./notificationFunctions/plans/plans");
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
async function addFamilyPlan(uid, plan) {
  try {
    // make an id that starts with family_ and then a 10 random characters and numbers
    const id = "family_" + Math.random().toString(36).substr(2, 10);
    const plansRef = doc(db, "User", uid, "Plans", id);
    const familyPlansRef = doc(db, "family_plans", id);
    await setDoc(plansRef, { ...plan, id });
    await setDoc(familyPlansRef, { ...plan, id });
    return id;
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

      await updateDoc(ref, { spending: newSpending });
      const info = { uid, planId, spending, budget };
      checkNotifications(info);
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

module.exports = {
  addPlan,
  deletePlan,
  updatePlan,
  getUserPlans,
  getNumberOfPlans,
  getField,
  updateSpending,
  addFamilyPlan
};
