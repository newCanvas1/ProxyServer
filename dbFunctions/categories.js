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
  // console.log("getCategoriesPieChart", params);
  let list = {};
  console.log("getCategoriesPieChart");
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

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  getCategoriesAmount,
  getCategoryInfo,
};
