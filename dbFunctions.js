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

async function getNotifications(uid, planId) {
  let list = [];
  const eventsQuery = query(
    collection(db, "User", uid, "Plans", planId, "Notifications")
  );

  const eventsQuerySnapshot = await getDocs(eventsQuery);
  eventsQuerySnapshot.forEach((doc) => {
    list.push(doc.data());
  });

  return list;
}
async function getField(uid, planId, field) {
  // here we need the user id
  const docRef = doc(db, "User", uid, "Plans", planId);

  try {
    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      // change user state
      console.log(docSnap.data()[field]);
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
  }
}
async function getUserData(uid) {
  // here we need the user id
  const docRef = doc(db, "User", uid);

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
async function getUserPlans(uid) {
  let list = [];
  console.log(uid, "getUserPlans");
  const planIDQuery = query(collection(db, "User", uid, "Plans"));

  const IDQuerySnapshot = await getDocs(planIDQuery);
  IDQuerySnapshot.forEach((doc) => {
    list.push({ name: doc.data().name, id: doc.id });
  });
  return list;
}
async function getExpenses(uid, planId, categoryId) {
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
    orderBy("createdAt", "desc")
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
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
}
async function getCategories(uid, planId) {
  let list = [];
  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Categories"),
    orderBy("createdAt", "desc")
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
  return list;
}
async function addCategory(uid, planId, category) {
  const ref = collection(db, "User", uid, "Plans", planId, "Categories");
  const doc = await addDoc(ref, category).catch((err) => {
    console.log(err);
    return false;
  });
  return doc.id;
}
async function deleteCategory(uid, planId, categoryId) {
  const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
  await deleteDoc(ref)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
async function updateCategory(uid, planId, categoryId, updateFields) {
  const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
  const request = await updateDoc(ref, {
    ...updateFields,
  });
}
async function deleteExpense(uid, planId, categoryId, expenseId) {
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
  await deleteDoc(ref)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
async function addPlan(uid, plan) {
  const ref = collection(db, "User", uid, "Plans");
  const doc = await addDoc(ref, plan);
  return doc.id;
}
async function deletePlan(uid, planId) {
  const ref = doc(db, "User", uid, "Plans", planId);
  await deleteDoc(ref)
    .then(async () => {
      const routinesQuery = query(
        collection(db, "User", uid, "Plans"),
        orderBy("createdAt", "desc")
      );

      return docs[0].id;
    })
    .catch(() => {
      return false;
    });
}
async function updateExpense(uid, planId, categoryId, expenseId, updateFields) {
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
  const request = await updateDoc(ref, {
    ...updateFields,
  });
}
async function updatePlan(uid, updateFields, planId) {
  const ref = doc(db, "User", uid, "Plans", planId);
  const request = await updateDoc(ref, {
    ...updateFields,
  });
}
async function updateUser(uid, updateFields) {
  const ref = doc(db, "User", uid);

  const request = await updateDoc(ref, {
    ...updateFields,
  })
    .then(() => {
      console.log("Field successfully updated!");
    })
    .catch((error) => {
      console.error("Error updating field:", error);
    });
}
async function categorizeDocumentsByMonth(id, planId) {
  try {
    // Get the collection reference
    const routinesQuery = query(
      collection(db, "User", id, "Plans", planId, "Expenses"),
      orderBy("createdAt", "desc")
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    // Retrieve all documents from the collection

    // Create an object to hold the categorized documents
    const categorizedDocuments = {};

    // Loop through each document
    routinesQuerySnapshot.forEach((doc) => {
      // Get the timestamp field from the document
      const timestamp = doc.data().createdAt;
      const date = timestamp.toDate();
      // Convert the timestamp to a JavaScript Date object
      console.log(date);

      // Get the month and year from the date
      const month = date.getMonth();
      const year = date.getFullYear();
      const day = date.getDate();

      // Create a key using the month and year
      const key = `${month}-${year}`;
      const amountSpent = doc.data().amount;

      // Check if the key exists in the categorizedDocuments object
      if (categorizedDocuments[key]) {
        // If the key already exists, push the document to the existing array
        if (categorizedDocuments[key].documents[day]) {
          categorizedDocuments[key].documents[day].push(doc.data());
        } else {
          categorizedDocuments[key].documents[day] = [doc.data()];
        }
        // Add the amount spent to the existing total
        categorizedDocuments[key].totalAmount += amountSpent;
      } else {
        // If the key doesn't exist, create a new array with the document
        categorizedDocuments[key] = {
          documents: {},
          totalAmount: amountSpent,
        };
        categorizedDocuments[key].documents[day] = [doc.data()];
      }
    });

    // Return the categorized documents
    return categorizedDocuments;
  } catch (error) {
    console.error("Error categorizing documents:", error);
    throw error;
  }
}

async function categorizeDocumentsByMonthAmountOnly(id, planId) {
  try {
    // Get the collection reference
    const routinesQuery = query(
      collection(db, "User", id, "Plans", planId, "Expenses"),
      orderBy("createdAt", "desc")
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    // Retrieve all documents from the collection

    // Create an object to hold the categorized documents
    const categorizedDocuments = {};

    // Loop through each document
    routinesQuerySnapshot.forEach((doc) => {
      // Get the timestamp field from the document
      const timestamp = doc.data().createdAt;
      const date = timestamp.toDate();
      // Get the month and year from the date
      const month = date.getMonth();
      const year = date.getFullYear();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      // Create a key using the month and year
      const key = `${months[month]}-${year}`;
      const amountSpent = doc.data().amount;
      const numOfExpenses = 1;

      // Check if the key exists in the categorizedDocuments object
      if (categorizedDocuments[key]) {
        // If the key already exists, push the document to the existing array
        // Add the amount spent to the existing total
        categorizedDocuments[key].totalAmount += amountSpent;
        categorizedDocuments[key].numOfExpenses += 1;
        const average =
          categorizedDocuments[key].totalAmount /
          categorizedDocuments[key].numOfExpenses;

        categorizedDocuments[key].average = average.toFixed(2);
      } else {
        // If the key doesn't exist, create a new array with the document
        categorizedDocuments[key] = {
          totalAmount: amountSpent,
          numOfExpenses: numOfExpenses,
          average: amountSpent / numOfExpenses,
        };
      }
    });

    // Return the categorized documents
    return categorizedDocuments;
  } catch (error) {
    console.error("Error categorizing documents:", error);
    throw error;
  }
}
async function getAmountSpentPerDayLastWeek(uid, planId) {
  try {
    // Get the collection reference
    const categorizedDocuments = {};

    // Get the current date
    const currentDate = new Date();

    // Create an array to hold the amount spent for each day
    // Loop for the last 7 days

    // Calculate the date for the current iteration
    const date = new Date();
    const now = new Date();
    date.setDate(currentDate.getDate() - 7);
    console.log(date.toDateString());
    const routinesQuery = query(
      collection(db, "User", uid, "Plans", planId, "Expenses"),
      where("createdAt", ">=", date),
      where("createdAt", "<=", now)
    );

    const routinesQuerySnapshot = await getDocs(routinesQuery);
    routinesQuerySnapshot.forEach((doc) => {
      // Get the timestamp field from the document
      const timestamp = doc.data().createdAt;
      const date = timestamp.toDate();
      // Get the month and year from the date
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      // Create a key using the month and year
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const key = `${year},${months[month]},${day}`;
      const amountSpent = doc.data().amount;

      // Check if the key exists in the categorizedDocuments object
      if (categorizedDocuments[key]) {
        // If the key already exists, push the document to the existing array
        // Add the amount spent to the existing total
        categorizedDocuments[key].totalAmount += amountSpent;
      } else {
        // If the key doesn't exist, create a new array with the document
        categorizedDocuments[key] = {
          totalAmount: amountSpent,
        };
      }
    });

    // Return the amount spent per day for the last 7 days
    return categorizedDocuments;
  } catch (error) {
    console.error("Error getting amount spent per day:", error);
    throw error;
  }
}
async function getNumberOfPlans(id) {
  const routinesQuery = query(collection(db, "User", id, "Plans"));
  const routinesQuerySnapshot = await getDocs(routinesQuery);
  const numberOfDocs = routinesQuerySnapshot.size;
  return numberOfDocs;
}

function setRecentExpenses(myArray, uid, planId) {
  const routinesQuery = doc(db, "User", uid, "Plans", planId);

  // Create an array

  // Set the value of the array in Firebase
  routinesQuery;
  updateDoc(routinesQuery, { recentExpenses: myArray })
    .then(function () {
      console.log("Array added to Firebase successfully!");
    })
    .catch(function (error) {
      console.error("Error adding array to Firebase: ", error);
    });
}
module.exports = {
  setRecentExpenses,
  getNumberOfPlans,
  addExpense,
  getNotifications,
  getUserData,
  getUserPlans,
  getExpenses,
  deleteExpense,
  updateExpense,
  getExpensesBetweenDates,
  getExpensesByField,
  categorizeDocumentsByMonth,
  categorizeDocumentsByMonthAmountOnly,
  getAmountSpentPerDayLastWeek,
  deletePlan,
  addPlan,
  updatePlan,
  updateUser,
  getField,
  deleteCategory,
  updateCategory,
  addCategory,
  getCategories,
};
