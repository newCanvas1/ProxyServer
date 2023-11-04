const { limit, startAfter ,query} = require("firebase/firestore");
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
    const ref = doc(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Categories",
      categoryId,
      "Expenses",
      expenseId
    );
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function updateExpense(uid, planId, categoryId, expenseId, updateFields) {
  try {
    const ref = doc(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Categories",
      categoryId,
      "Expenses",
      expenseId
    );
    await updateDoc(ref, {
      ...updateFields,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getExpenses(uid, planId, categoryId, lastDocument) {
  let list = [];
  const LIMIT = 7;
  let routinesQuery = collection(
    db,
    "User",
    uid,
    "Plans",
    planId,
    "Categories",
    categoryId,
    "Expenses"
  );

  if (lastDocument) {
    console.log("Using startAfter:", lastDocument.createdAt.seconds); // Logging the startAfter document

    routinesQuery = query(
      routinesQuery,
      orderBy("createdAt", "desc"),
      startAfter(new Date(lastDocument.createdAt.seconds * 1000)),
      limit(LIMIT) // Adjust the limit as per your requirement
    );
  } else {
    routinesQuery = query(
      routinesQuery,
      orderBy("createdAt", "desc"),
      limit(LIMIT) // Adjust the limit as per your requirement
    );
  }

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  return list;
}
async function getExpensesBetweenDates(uid, planId, categoryId) {
  let list = [];
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2023-04-22");
  const routinesQuery = query(
    collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Categories",
      categoryId,
      "Expenses"
    ),
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
    collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Categories",
      categoryId,
      "Expenses"
    ),
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
async function addExpense(uid, planId, categoryId, expense) {
  try {
    const ref = collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Categories",
      categoryId,
      "Expenses"
    );
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
      "Categories",
      categoryId,
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
};
