const { limit, startAfter, query } = require("firebase/firestore");
const {
  collection,
  getDocs,
  doc,
  orderBy,
  db,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
  getDoc,
} = require("../firebaseConfig");

async function deleteExpense(uid, planId, categoryId, expenseId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Expenses", expenseId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function updateExpense(uid, planId, categoryId, expenseId, updateFields) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Expenses", expenseId);
    await updateDoc(ref, {
      ...updateFields,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getRecentExpenses(uid, planId) {
  try {
    let list = [];
    let routinesQuery = collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Expenses"
    );
    routinesQuery = query(
      routinesQuery,
      orderBy("createdAt", "desc"),
      limit(10) // Adjust the limit as per your requirement
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getExpenses(uid, planId, categoryId, order, lastDocument) {
  try {
    let list = [];
    const LIMIT = 7;
    let routinesQuery = collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Expenses"
    );
    if (lastDocument) {
      routinesQuery = query(
        routinesQuery,
        categoryId && where("categoryId", "==", categoryId),
        orderBy("createdAt", order || "desc"),

        startAfter(new Date(lastDocument.createdAt.seconds * 1000)),
        limit(LIMIT) // Adjust the limit as per your requirement
      );
    } else {
      routinesQuery = query(
        routinesQuery,
        categoryId && where("categoryId", "==", categoryId),
        orderBy("createdAt", order || "desc"),

        limit(LIMIT) // Adjust the limit as per your requirement
      );
    }

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getExpensesBetweenDates(uid, planId, categoryId) {
  let list = [];
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2023-04-22");
  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
    where("categoryId", "==", categoryId),

    orderBy("createdAt", "desc"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  return list;
}

async function getExpensesByField(uid, planId, categoryId, field, value) {
  let list = [];

  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
    orderBy("createdAt", "desc"),
    where("categoryId", "==", categoryId),

    where(field, "==", value)
  );
  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  return list;
}
async function addExpense(uid, planId, categoryId, expense) {
  try {
    const ref = collection(db, "User", uid, "Plans", planId, "Expenses");
    const doc = await addDoc(ref, expense);
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getExpenseAmount(uid, planId, categoryId, expenseId) {
  try {
    const routinesQuery = doc(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Expenses",
      expenseId
    );

    const routinesQuerySnapshot = await getDoc(routinesQuery);
    const amount = routinesQuerySnapshot.data().amount;
    return amount;
  } catch (error) {
    console.log(error);
    return false;
  }
}
module.exports = {
  addExpense,
  getExpenses,
  getExpensesBetweenDates,
  getExpensesByField,
  deleteExpense,
  updateExpense,
  getExpenseAmount,
  getRecentExpenses,
};
