const { collection, query, getDocs, db, addDoc, doc, deleteDoc } = require("../firebaseConfig");
async function getNotifications(uid, planId) {
  try {
    let list = [];
    const eventsQuery = query(
      collection(db, "User", uid, "Plans", planId, "Notifications")
    );

    const eventsQuerySnapshot = await getDocs(eventsQuery);
    eventsQuerySnapshot.forEach((doc) => {
      list.push(doc.data());
    });

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function addNotification(uid, planId, notification) {
  try {
    const ref = collection(db, "User", uid, "Plans", planId, "Notifications");
    const doc = await addDoc(ref, notification);
    console.log(doc.id);
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deleteNotification(uid, planId, notificationId) {
  try {
    const ref = doc(
      db,
      "User",
      uid,
      "Plans",
      planId,
      "Notifications",
      notificationId
    );
    await deleteDoc(ref)
      .then(async () => {
        console.log("Notification deleted", notificationId);
        return true;
      })
      .catch((err) => {
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
  getNotifications,
  addNotification,
  deleteNotification
};
