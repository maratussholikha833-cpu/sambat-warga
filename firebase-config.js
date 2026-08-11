import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLZRPl0KBbpEy1xNfXOqUR7_TBD_tp3xs",
  authDomain: "sambat-warga.firebaseapp.com",
  projectId: "sambat-warga",
  storageBucket: "sambat-warga.firebasestorage.app",
  messagingSenderId: "618711429189",
  appId: "1:618711429189:web:eb086328e43dfa43f2732c",
  measurementId: "G-GKDYS2C482"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
