const { getDoc, doc, db, updateDoc } = require("../firebaseConfig");
async function getUserData(uid) {
  // here we need the user id

  try {
    const docRef = doc(db, "User", uid);

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
    return false;
  }
}

async function updateUser(uid, updateFields) {
  try {
    const ref = doc(db, "User", uid);

    const request = await updateDoc(ref, {
      ...updateFields,
    });
    if (request) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  updateUser,
  getUserData,
};
