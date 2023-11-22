const {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  db,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  where,
} = require("../firebaseConfig");
const { checkIfFamilyPlan } = require("./general/functions");
const {
  checkNotifications,
} = require("./notificationFunctions/notificationFunctions");
const {
  checkPlansNotifications,
} = require("./notificationFunctions/plans/plans");
const { addNotification } = require("./notifications");
async function addPlan(uid, plan) {
  try {
    const ref = collection(db, "User", uid, "Plans");
    const doc = await addDoc(ref, plan);
    return doc.id;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function addFamilyPlan(uid, plan) {
  try {
    // make an id that starts with family_ and then a 10 random characters and numbers
    const id = "family_" + Math.random().toString(36).substr(2, 10);
    const plansRef = doc(db, "User", uid, "Plans", id);
    const familyPlansRef = doc(db, "family_plans", id);
    await setDoc(plansRef, { ...plan, id });
    await setDoc(familyPlansRef, { ...plan, id });
    await sendInviteToMembers(plan.members, id, plan.name);
    return id;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function sendInviteToMembers(members, planId, name) {
  let membersUIDlist = [];
  let membersEmailList = [];

  //   "members": {
  //     "uid": "ACxojNHMcMZPH1QZ3oTESRsDmc42",
  //     "role": "owner"
  // }

  //for members, if the role is not owner, put their email in the emailList
  members.forEach((member) => {
    if (member.role != "owner") {
      //lowercase the email
      membersEmailList.push(member.email.toLowerCase());
    }
  });
  console.log(membersEmailList);
  // get uid of members using their emails
  const ref = collection(db, "User");
  const usersQuery = query(ref);
  const querySnapshot = await getDocs(usersQuery);
  querySnapshot.forEach((doc) => {
    if (doc.data().email == undefined) {
      return;
    }
    if (!membersEmailList.includes(doc.data().email.toLowerCase())) {
      return;
    }
    console.log(doc.data());
    membersUIDlist.push(doc.id);
  });
  console.log(membersUIDlist, "membersUIDlist");
  // send them a notification
  sendInvites(membersUIDlist, planId, name);
}
function sendInvites(membersUIDlist, planId, name) {
  // send them a notification
  console.log(membersUIDlist);
  membersUIDlist.forEach((uid) => {
    console.log(membersUIDlist);
    const invite = {
      type: "invite",
      planId,
      icon: "account-multiple",
      planName: name,
      createdAt: new Date(),
      isRead: false,
    };
    const ref = collection(db, "User", uid, "Invitations");
    addDoc(ref, invite);
  });
}
async function updateSpending(uid, planId, value, type) {
  try {
    const ref = checkIfFamilyPlan(planId)
      ? doc(db, "family_plans", planId)
      : doc(db, "User", uid, "Plans", planId);
    let newSpending = 0;
    const docSnap = await getDoc(ref);
    // if it exists
    if (docSnap.exists()) {
      const spending = docSnap.data().spending;
      const budget = docSnap.data().budget;

      if (type == "decrement") {
        newSpending = parseFloat(spending) - parseFloat(value);
      } else {
        newSpending = parseFloat(spending) + parseFloat(value);
      }

      await updateDoc(ref, { spending: newSpending });
      const info = { uid, planId, spending, budget };
      checkNotifications(info);
      return;
    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.log(error);
  }
  return doc.id;
}
async function deletePlan(uid, planId) {
  try {
    const ref = doc(db, "User", uid, "Plans", planId);

    await deleteDoc(ref)
      .then(async () => {
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
async function getField(uid, planId, field) {
  // here we need the user id

  try {
    const docRef = doc(db, "User", uid, "Plans", planId);

    const docSnap = await getDoc(docRef);
    // if it exists
    if (docSnap.exists()) {
      // change user state
      if (docSnap.data()[field] == undefined) {
        return false;
      }
      return docSnap.data()[field];
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getUserPlans(uid) {
  try {
    let list = [];

    const planIDQuery = query(collection(db, "User", uid, "Plans"));

    const IDQuerySnapshot = await getDocs(planIDQuery);
    if (IDQuerySnapshot) {
      IDQuerySnapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
    } else {
      return false;
    }

    return list;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function updatePlan(uid, updateFields, planId) {
  try {
    const ref = checkIfFamilyPlan(planId)
      ? doc(db, "family_plans", planId)
      : doc(db, "User", uid, "Plans", planId);
    let result = false;
    await updateDoc(ref, {
      ...updateFields,
    })
      .then(() => {
        result = true;
      })
      .catch(() => {
        result = false;
      });
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getNumberOfPlans(id) {
  try {
    const routinesQuery = query(collection(db, "User", id, "Plans"));
    const routinesQuerySnapshot = await getDocs(routinesQuery);
    const numberOfDocs = routinesQuerySnapshot.size;
    return numberOfDocs;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function handleInviteReject(uid, invite) {
  try {
    // delete the invite doc from invitations collection
    const ref = doc(db, "User", uid, "Invitations", invite.id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function handleInviteAccept(uid, invite, email) {
  try {
    // delete the invite doc from invitations collection
    const ref = doc(db, "User", uid, "Invitations", invite.id);
    await deleteDoc(ref);

    // get the plans info
    const planRef = doc(db, "family_plans", invite.planId);
    const planDoc = await getDoc(planRef);
    const plan = planDoc.data();

    // add the plan to the user's plans
    await setDoc(doc(db, "User", uid, "Plans", invite.planId), {
      ...plan,
    });

    const familyPlanRef = doc(db, "family_plans", invite.planId);
    console.log(invite.planId);
    // change the status of the member to accepted
    const docSnap = await getDoc(familyPlanRef);
    let document = docSnap.data();
    let members = document.members;
    // find the member with the email and change their status to accepted
    members.forEach((member) => {
      if (member.role == "owner") {
        return;
      }
      // transform the email to lowercase
      email = email.toLowerCase();
      member.email = member.email.toLowerCase();
      if (member.email == email) {
        member.accepted = true;
        member.uid = uid;
      }
    });
    document.members = members;
    await updateDoc(familyPlanRef, document);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  addPlan,
  deletePlan,
  updatePlan,
  getUserPlans,
  getNumberOfPlans,
  getField,
  updateSpending,
  addFamilyPlan,
  handleInviteAccept,
  handleInviteReject,
};
