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
const {
  checkNotifications,
} = require("./notificationFunctions/notificationFunctions");

async function getExpensesCountPerDay(uid, planId) {
  // this function fetches the expenses count per day of this month

  // get the start date of this month
  const startDate = new Date();
  startDate.setDate(1);
  // set as beginning of the day
  startDate.setHours(0, 0, 0, 0);

  // get the end date of this month
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  // set as end of the day
  endDate.setHours(23, 59, 59, 999);

  // this list should have an object for each day of the month and the value should be the count how many expenses were made that day
  let list = [];
  // const list = [
  // { date: "2017-01-02", count: 1 },
  // { date: "2017-01-03", count: 2 },
  // { date: "2017-01-04", count: 3 },
  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);

  routinesQuerySnapshot.forEach((doc) => {
    const date = new Date(doc.data().createdAt.seconds * 1000)
      .toISOString()
      .split("T")[0];
    // if the day is already in the list, add 1 to the existing count
    const index = list.findIndex((item) => item.date == date);
    if (index != -1) {
      list[index].count++;
    } else {
      // else create a new object and set the count as 1
      list.push({ date, count: 1 });
    }
  });
  return list;
}
async function getAmountSpentThisWeekPerDay(uid, planId, categoryId) {
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

    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    // set as end of the day
    endOfWeek.setHours(23, 59, 59, 999);

    // this list should have week days as properties and the value should be the sum of expenses of that day
    let list = {};
    const routinesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      categoryId && where("categoryId", "==", categoryId),
      where("createdAt", ">=", startOfWeek),
      where("createdAt", "<=", endOfWeek)
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
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
    const info = { uid, planId, categoryId, updateFields };
    console.log(info);
    checkNotifications(info);
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
async function getExpensesPerDay(
  uid,
  planId,
  categoryId,
  order,
  lastDocument,
  name
) {
  try {
    const expensesByDate = {};
    const LIMIT = 7;
    let routinesQuery = collection(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Expenses"
    );
    console.log("New request");
    console.log("lastDocument", lastDocument);

    if (lastDocument) {
      routinesQuery = query(
        routinesQuery,
        categoryId && where("categoryId", "==", categoryId),
        orderBy("createdAt", order || "desc"),
        startAfter(new Date(lastDocument.createdAt.seconds * 1000)),
        limit(LIMIT)
      );
    } else {
      routinesQuery = query(
        routinesQuery,
        categoryId && where("categoryId", "==", categoryId),
        orderBy("createdAt", order || "desc"),
        limit(LIMIT)
      );
    }

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.createdAt.seconds * 1000)
        .toISOString()
        .split("T")[0];
      if (!expensesByDate[date]) {
        expensesByDate[date] = [];
      }
      expensesByDate[date].push({ ...data, id: doc.id });
    });
    return expensesByDate;
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

    const info = { uid, planId, categoryId, updateFields: expense };
    checkNotifications(info);
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
  getAmountSpentThisWeekPerDay,
  getExpensesPerDay,
  getExpensesCountPerDay,
};
