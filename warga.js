import { db } from "./firebase-config.js";
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const form = document.getElementById("complaintForm");
const modal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const errorBox = document.getElementById("formError");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const nama = document.getElementById("nama").value.trim();
  const keluhan = document.getElementById("keluhan").value.trim();
  const lokasi = document.getElementById("lokasi").value.trim();
  const urgensi = document.getElementById("urgensi").value;

  if (!nama || !keluhan || !lokasi || !urgensi) {
    errorBox.textContent = "Semua data wajib diisi.";
    return;
  }

  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Mengirim...";

  try {
    await addDoc(collection(db, "laporan"), {
      nama,
      keluhan,
      lokasi,
      urgensi,
      status: "Belum Diproses",
      assignedTo: null,
      assignedRole: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    form.reset();
    modal.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    errorBox.textContent = "Laporan belum bisa dikirim. Pastikan Firebase sudah disambungkan.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Kirim Keluhan <span>→</span>";
  }
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});
