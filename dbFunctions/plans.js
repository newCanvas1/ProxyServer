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
async function updateBudget(uid, planId, value, type) {
  const ref = doc(db, "User", uid, "Plans", planId);
  try {
    const docSnap = await getDoc(ref);
    // if it exists
    if (docSnap.exists()) {
      const budget = docSnap.data().budget;
      if (type == "increment") {
        const newBudget = budget + value;
        updateDoc(ref, { budget: newBudget });
        return;
      } else if (type == "decrement") {
        const newBudget = budget - value;
        updateDoc(ref, { budget: newBudget });
        return;
      }
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
        console.log("Plan deleted", planId);
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
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getUserPlans(uid) {
  try {
    let list = [];

    console.log(uid, "getUserPlans");
    const planIDQuery = query(collection(db, "User", uid, "Plans"));

    const IDQuerySnapshot = await getDocs(planIDQuery);
    if (IDQuerySnapshot) {
      IDQuerySnapshot.forEach((doc) => {
        list.push({ name: doc.data().name, id: doc.id });
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
  const ref = doc(db, "User", uid, "Plans", planId);
  const request = await updateDoc(ref, {
    ...updateFields,
  });
  if (request) {
    return true;
  } else {
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
async function getField(uid, planId, field) {
  // here we need the user id

  try {
    const docRef = doc(db, "User", uid, "Plans", planId);

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
  addPlan,
  deletePlan,
  updatePlan,
  getUserPlans,
  getNumberOfPlans,
  getField,
};
