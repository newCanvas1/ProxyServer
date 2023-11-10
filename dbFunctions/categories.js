const {
  collection,
  query,
  getDocs,
  doc,
  orderBy,
  db,
  updateDoc,
  deleteDoc,
  addDoc,
  where,
} = require("../firebaseConfig");
const { updateSpending } = require("./plans");

async function getCategoriesAmount(uid, planId) {
  // go through expenses and add up the amounts for each category
  // return a list of objects with name and amount
  // [{name: "food", amount: 100}, {name: "gas", amount: 50}]
  let list = {};
  try {
    const categoriesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      orderBy("createdAt", "desc")
    );
    const categoriesQuerySnapshot = await getDocs(categoriesQuery);
    categoriesQuerySnapshot.forEach((doc) => {
      console.log(doc.data().category);
      // for the expense category, make a property of that name, and increment the amount by the expense amount
      if (list[doc.data().category]) {
        list[doc.data().category] += parseFloat(doc.data().amount);
      } else {
        list[doc.data().category] = parseFloat(doc.data().amount);
      }
    });

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getCategories(uid, planId) {
  let list = [];
  try {
    const routinesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Categories"),
      orderBy("createdAt", "desc")
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
async function addCategory(uid, planId, category) {
  try {
    const ref = collection(db, "User", uid, "Plans", planId, "Categories");
    const doc = await addDoc(ref, category).catch((err) => {
      console.log(err);
      return false;
    });
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function decrementSpending(uid, planId, amount) {
  await updateSpending(uid, planId, parseFloat(amount), "decrement");
}
async function deleteExpensesOfCategory(uid, planId, categoryId) {
  try {
    let amountOfDeleted = 0;
    const expensesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      orderBy("createdAt", "desc"),
      where("categoryId", "==", categoryId)
    );
    const expensesQuerySnapshot = await getDocs(expensesQuery);
    expensesQuerySnapshot.forEach(async (doc) => {
      const amount = doc.data().amount;
      console.log("amount", amount);
      amountOfDeleted += parseFloat(amount);

      const deleted = await deleteDoc(doc.ref).catch((err) => {
        console.log(err);
        return false;
      });
    });
    console.log("amountOfDeleted", amountOfDeleted);

    await decrementSpending(uid, planId, amountOfDeleted);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function deleteCategory(uid, planId, categoryId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
    // delete all expenses in this category
    const res = await deleteExpensesOfCategory(uid, planId, categoryId);

    if (res) {
      await deleteDoc(ref).catch((err) => {
        console.log(err);
        return false;
      });
    } else {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function updateCategory(uid, planId, categoryId, updateFields) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
    updateDoc(ref, {
      ...updateFields,
    }).catch((err) => {
      console.log(err);
      return false;
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getCategoryInfo(uid, planId, categoryId) {
  let expensesCount = 0;
  let expensesAmount = 0;

  const expensesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
    orderBy("createdAt", "desc"),
    where("categoryId", "==", categoryId)
  );
  const expensesQuerySnapshot = await getDocs(expensesQuery);
  expensesQuerySnapshot.forEach(async (doc) => {
    expensesCount++;
    const amount = doc.data().amount;
    expensesAmount += parseFloat(amount);
  });
  return { expensesCount, expensesAmount };
}

async function getAmountSpentThisWeekPerDayOfCategory(uid, planId, categoryId) {
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
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    // set as end of the day

    endOfWeek.setHours(23, 59, 59, 999);
    console.log(startOfWeek, endOfWeek);

    // this list should have week days as properties and the value should be the sum of expenses of that day
    let list = {};
    const routinesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      where("categoryId", "==", categoryId),
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
module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getCategoriesAmount,
  getCategoryInfo,
  getAmountSpentThisWeekPerDayOfCategory,
};
