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
  serverTimestamp,
  writeBatch,
} = require("firebase/firestore");
// Authentication methods
const { initializeApp } = require("firebase/app");

// Handling real-time database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-351UQjRQ1YIPSJmr1RA4vym3GRwGFPA",
  authDomain: "boky-final.firebaseapp.com",
  projectId: "boky-final",
  storageBucket: "boky-final.appspot.com",
  messagingSenderId: "20350385307",
  appId: "1:20350385307:web:9d0f70432b807a1ec4da3e"
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
  serverTimestamp,
  writeBatch,
};
