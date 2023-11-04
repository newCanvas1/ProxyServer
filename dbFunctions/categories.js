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
} = require("../firebaseConfig");
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
    console.log(list);
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
async function deleteCategory(uid, planId, categoryId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId, "Categories", categoryId);
    await deleteDoc(ref).catch((err) => {
      console.log(err);
      return false;
    });
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

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
};
