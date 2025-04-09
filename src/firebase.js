// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnAW4YAZZK-eoxl0mndQh4tP9WehHyGr8",
  authDomain: "tiger-cub-dashboard.firebaseapp.com",
  projectId: "tiger-cub-dashboard",
  storageBucket: "tiger-cub-dashboard.firebasestorage.app",
  messagingSenderId: "462258169211",
  appId: "1:462258169211:web:168f99e26532403cdbc9de",
  measurementId: "G-LEF7DEJ5ST"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);