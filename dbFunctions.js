const {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  orderBy,
  db,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
} = require("./firebaseConfig");

const testId = "DROsWLcyHiQGdhE8ikDKfmy86pj2";
const testPlanId = "1Tdnorgyf794ErQLCsnp";

async function getNotifications(uid) {
  let list = [];
  const eventsQuery = query(collection(db, "User", uid, "Notifications"));

  const eventsQuerySnapshot = await getDocs(eventsQuery);
  eventsQuerySnapshot.forEach((doc) => {
    list.push(doc.data());
  });

  return list;
}

async function getUserData(id) {
  // here we need the user id
  const docRef = doc(db, "User", id);

  try {
    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      // change user state
      return docSnap.data();
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
  }
}
async function getPlansData(id) {
  let idList = [];
  const planIDQuery = query(collection(db, "User", id, "Plans"));

  const IDQuerySnapshot = await getDocs(planIDQuery);
  IDQuerySnapshot.forEach((doc) => {
    idList.push({ data: doc.data(), id: doc.id });
  });
  return idList;
}
async function getExpenses(id, plan) {
  let list = [];
  const routinesQuery = query(
    collection(db, "User", id, "Expenses"),
    orderBy("createdAt", "desc")
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
  return list;
}
async function getExpensesBetweenDates(id) {
  let list = [];
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2023-09-22");
  const routinesQuery = query(
    collection(db, "User", id, "Expenses"),
    orderBy("createdAt", "desc"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
  return list;
}

async function getExpensesByField(uid, field, value) {
  let list = [];
  const routinesQuery = query(
    collection(db, "User", uid, "Expenses"),
    orderBy("createdAt", "desc"),
    where(field, "==", value)
  );
  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
  return list;
}
async function addExpense(uid, expense) {
  const ref = collection(db, "User", uid, "Expenses");
  const doc = await addDoc(ref, expense);
  return doc.id;
}
async function deleteExpense(uid, expenseId) {
  const ref = doc(db, "User", uid, "Expenses", expenseId);
  await deleteDoc(ref)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
async function updateExpense(uid, expenseId, updateFields) {
  const ref = doc(db, "User", uid, "Expenses", expenseId);
  const request = await updateDoc(ref, {
    ...updateFields,
  });
}
async function testBackendFunctions() {
  console.log(await getUserData(testId));

  console.log(await getPlansData(testId));

  console.log(await getExpenses(testId, testPlanId));
}
// testBackendFunctions();
module.exports = {
  addExpense,
  getNotifications,
  getUserData,
  getPlansData,
  getExpenses,
  deleteExpense,
  updateExpense,
  getExpensesBetweenDates,
  getExpensesByField,
};
