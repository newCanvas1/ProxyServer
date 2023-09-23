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
async function getExpenses(id, planId) {
  let list = [];
  const routinesQuery = query(
    collection(db, "User", id, "Plans", planId, "Expenses"),
    orderBy("createdAt", "desc")
  );

  const routinesQuerySnapshot = await getDocs(routinesQuery);
  routinesQuerySnapshot.forEach((doc) => {
    list.push({ ...doc.data(), id: doc.id });
  });
  console.log(list);
  return list;
}
async function getExpensesBetweenDates(uid, planId) {
  let list = [];
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2023-04-22");
  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
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

async function getExpensesByField(uid, field, value, planId) {
  let list = [];

  const routinesQuery = query(
    collection(db, "User", uid, "Plans", planId, "Expenses"),
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
async function addExpense(uid, expense, planId) {
  const ref = collection(db, "User", uid, "Plans", planId, "Expenses");
  const doc = await addDoc(ref, expense);
  return doc.id;
}
async function deleteExpense(uid, expenseId, planId) {
  const ref = doc(db, "User", uid, "Plans", planId, "Expenses", expenseId);
  await deleteDoc(ref)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
async function updateExpense(uid, expenseId, updateFields, planId) {
  const ref = doc(db, "User", uid, "Plans", planId, "Expenses", expenseId);
  const request = await updateDoc(ref, {
    ...updateFields,
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
          categorizedDocuments[key].documents[day]=[doc.data()];
        }
        // Add the amount spent to the existing total
        categorizedDocuments[key].totalAmount += amountSpent;
      } else {
        // If the key doesn't exist, create a new array with the document
        categorizedDocuments[key] = {
          documents: {},
          totalAmount: amountSpent,
        };
        categorizedDocuments[key].documents[day]=[doc.data()];
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

      // Create a key using the month and year
      const key = `${month}-${year}`;
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
          average: 0,
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
  categorizeDocumentsByMonth,
  categorizeDocumentsByMonthAmountOnly,
  getAmountSpentPerDayLastWeek,
};
