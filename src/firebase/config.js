// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Replace with your Firebase config (from Firebase Console → Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyCr4U71mYCW31ZYguPThmBqWl8jOYla6is",
  authDomain: "ccamex-514aa.firebaseapp.com",
  projectId: "ccamex-514aa",
  storageBucket: "ccamex-514aa.firebasestorage.app",
  messagingSenderId: "753973152811",
  appId: "1:753973152811:web:5c11d64377cf4b4fee6e6e",
  measurementId: "G-8MY4HHRHHX",
};

const app = initializeApp(firebaseConfig);

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
