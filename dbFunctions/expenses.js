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
const { addNotification } = require("./notifications");

async function getAmountSpentThisWeekPerDay(uid, planId) {
  try {
    // get the start date of this week
    // Get the current date
    const currentDate = new Date();

    // Get the current day of the week (0 to 6, where 0 is Sunday)
    const currentDayOfWeek = currentDate.getDay(); // 0-6

    // Calculate the number of days to subtract to get to the previous Sunday
    const daysToSubtract = currentDayOfWeek > 0 ? currentDayOfWeek - 1 : 6; // 1-6

    // Calculate the start of the week (previous Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - daysToSubtract - 1);
    // set as beginning of the day
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setHours(startOfWeek.getHours() + 3); // add 3 hours for UTC+3

    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    // set as end of the day
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setHours(endOfWeek.getHours() + 3); // add 3 hours for UTC+3

    console.log(startOfWeek, endOfWeek);

    // this list should have week days as properties and the value should be the sum of expenses of that day
    let list = {};
    const routinesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      where("createdAt", ">=", startOfWeek),
      where("createdAt", "<=", endOfWeek)
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      console.log(doc.data());
      const date = new Date(doc.data().createdAt.seconds * 1000);
      const day = date.getDay();
      // if the day is already in the list, add the amount to the existing amount
      if (list[day]) {
        list[day] += parseFloat(doc.data().amount);
      } else {
        // else create a new property and set the amount as the value
        list[day] = parseFloat(doc.data().amount);
      }
    });
    //days that does not have any expenses should be set to 0
    for (let i = 0; i < 7; i++) {
      if (!list[i]) {
        list[i] = 0;
      }
    }
    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}
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
    // if order is not desc or asc , then set it as decs
    if (order != "asc" && order != "desc") {
      order = "desc";
    }
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
    const categoryLimitHasBeenExceeded = await catgeoryLimitExceeded(
      uid,
      planId,
      categoryId,
      expense.amount
    );

    if (categoryLimitHasBeenExceeded) {
      const message = {
        message: `You have exceeded the limit of ${expense.category}`,
        importance: "high",
        isRead: false,
        createdAt: new Date(),
      };
      addNotification(uid, planId, message);
    }
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getTotalExpensesOfCategory(uid, planId, categoryId) {
  try {
    const expensesRef = collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Expenses"
    );
    const expensesQuery = query(
      expensesRef,
      where("categoryId", "==", categoryId)
    );
    const expensesQuerySnapshot = await getDocs(expensesQuery);
    let total = 0;
    expensesQuerySnapshot.forEach((doc) => {
      console.log(doc.data());
      total += parseFloat(doc.data().amount);
    });
    return total;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function catgeoryLimitExceeded(uid, planId, categoryId, amount) {
  // get the limit of that category
  const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
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

  // add the new expense amount to that total
  // total += parseFloat(amount);

  // check if the amount is greater than the limit
  if (total > limit) {
    console.log("limit exceeded", total, limit);

    // if yes, return false

    return true;
  } else {
    // else return true

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
  getAmountSpentThisWeekPerDay,
};
