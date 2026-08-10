import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    errorBox.textContent = "Email atau password salah, atau akun belum dibuat.";
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) {
      errorBox.textContent = "Akun belum memiliki data petugas. Hubungi admin.";
      return;
    }

    const role = userSnap.data().role;
    if (role !== "kartar" && role !== "rt") {
      errorBox.textContent = "Akun ini bukan akun Kartar/RT.";
      return;
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    errorBox.textContent = "Gagal memeriksa akun petugas.";
  }
});
