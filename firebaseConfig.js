// Import the functions you need from the SDKs you need
const {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  addDoc,
  setDoc,
  updateDoc,
} = require("firebase/firestore/lite");
// Authentication methods
const { initializeApp } = require("firebase/app");

// Handling real-time database

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy6Tw4wTaBdn-sFWSdi_L4XIBsGhZORpg",
  authDomain: "boky-20899.firebaseapp.com",
  projectId: "boky-20899",
  storageBucket: "boky-20899.appspot.com",
  messagingSenderId: "448894570744",
  appId: "1:448894570744:web:24ce3b77d860965cc56b0d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// has been inatlized

// reference for Auth service
module.exports = {
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  orderBy,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
};
