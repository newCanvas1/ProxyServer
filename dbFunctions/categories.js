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
const { checkIfFamilyPlan } = require("./general/functions");
const { updateSpending } = require("./plans");

async function getCategoriesAmount(uid, planId) {
  // go through expenses and add up the amounts for each category
  // return a list of objects with name and amount
  // [{name: "food", amount: 100}, {name: "gas", amount: 50}]
  let list = {};
  try {
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Expenses")
      : collection(db, "User", uid, "Plans", planId, "Expenses");

    const categoriesQuery = query(ref, orderBy("createdAt", "desc"));
    const categoriesQuerySnapshot = await getDocs(categoriesQuery);
    categoriesQuerySnapshot.forEach((doc) => {
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
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Categories")
      : collection(db, "User", uid, "Plans", planId, "Categories");

    const routinesQuery = query(ref, orderBy("createdAt", "desc"));

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
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Categories")
      : collection(db, "User", uid, "Plans", planId, "Categories");
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
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Expenses")
      : collection(db, "User", uid, "Plans", planId, "Expenses");

    const expensesQuery = query(
      ref,
      orderBy("createdAt", "desc"),
      where("categoryId", "==", categoryId)
    );
    const expensesQuerySnapshot = await getDocs(expensesQuery);
    expensesQuerySnapshot.forEach(async (doc) => {
      const amount = doc.data().amount;

      amountOfDeleted += parseFloat(amount);

      const deleted = await deleteDoc(doc.ref).catch((err) => {
        console.log(err);
        return false;
      });
    });

    await decrementSpending(uid, planId, amountOfDeleted);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function deleteCategory(uid, planId, categoryId) {
  try {
    const ref = checkIfFamilyPlan(planId)
      ? doc(db, "family_plans", planId, "Categories", categoryId)
      : doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
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
    const ref = checkIfFamilyPlan(planId)
      ? doc(db, "family_plans", planId, "Categories", categoryId)
      : doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
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
  const ref = checkIfFamilyPlan(planId)
    ? collection(db, "family_plans", planId, "Expenses")
    : collection(db, "User", uid, "Plans", planId, "Expenses");

  const expensesQuery = query(
    ref,
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

async function getAmountSpentThisYearPerMonthOfCategory(
  uid,
  planId,
  categoryId
) {
  try {
    monthList = {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December",
    };
    let list = {};
    const thisYear = new Date().getFullYear();
    const ref = checkIfFamilyPlan(planId)
      ? collection(db, "family_plans", planId, "Expenses")
      : collection(db, "User", uid, "Plans", planId, "Expenses");

    const routinesQuery = query(
      ref,
      categoryId && where("categoryId", "==", categoryId),
      where("createdAt", ">=", new Date(thisYear, 0, 1)),
      where("createdAt", "<=", new Date(thisYear, 11, 31))
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      const date = new Date(doc.data().createdAt.seconds * 1000);
      const month = date.getMonth();
      // if the month is already in the list, add the amount to the existing amount
      if (list[month]) {
        list[month] += parseFloat(doc.data().amount);
      } else {
        // else create a new property and set the amount as the value
        list[month] = parseFloat(doc.data().amount);
      }
    });
    //months that does not have any expenses should be set to 0

    for (let i = 0; i < 12; i++) {
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
  getAmountSpentThisYearPerMonthOfCategory,
};
