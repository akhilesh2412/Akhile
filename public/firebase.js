// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD05Jwxs5XjXD6gD9jZZhOn6wv0IO90p30",
  authDomain: "esportsevents24.firebaseapp.com",
  projectId: "esportsevents24",
  storageBucket: "esportsevents24.firebasestorage.app",
  messagingSenderId: "1079691302554",
  appId: "1:1079691302554:web:1c80730f83e48e7e1f7123",
  measurementId: "G-0C9SHK59GF"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app);
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  collection,
  getDocs,
  updateDoc,
  doc,
  signInWithEmailAndPassword,
  signOut
};
