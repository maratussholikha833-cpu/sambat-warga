import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const reportsEl = document.getElementById("reports");
const emptyEl = document.getElementById("emptyState");
const filterEl = document.getElementById("filterStatus");
const staffBadge = document.getElementById("staffBadge");

let allReports = [];
let currentUser = null;
let currentRole = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  currentRole = userSnap.data().role;
  if (currentRole !== "kartar" && currentRole !== "rt") {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  staffBadge.textContent = currentRole === "kartar" ? "🦺 Karang Taruna" : "🏠 RT";
  listenReports();
});

function listenReports() {
  const q = query(collection(db, "laporan"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allReports = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    }));
    render();
  }, (error) => {
    console.error(error);
    reportsEl.innerHTML = `<div class="error-panel">Tidak bisa mengambil data laporan. Periksa Firestore Rules.</div>`;
  });
}

filterEl.addEventListener("change", render);

function render() {
  const filter = filterEl.value;
  const filtered = filter === "Semua"
    ? allReports
    : allReports.filter((item) => item.status === filter);

  document.getElementById("totalCount").textContent = allReports.length;
  document.getElementById("newCount").textContent =
    allReports.filter((x) => x.status === "Belum Diproses").length;
  document.getElementById("workingCount").textContent =
    allReports.filter((x) => x.status === "Sedang Dikerjakan").length;
  document.getElementById("doneCount").textContent =
    allReports.filter((x) => x.status === "Sudah Dikerjakan").length;

  if (!filtered.length) {
    reportsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");

  reportsEl.innerHTML = filtered.map((item) => reportHTML(item)).join("");

  filtered.forEach((item) => {
    const accept = document.querySelector(`[data-accept="${item.id}"]`);
    const reject = document.querySelector(`[data-reject="${item.id}"]`);
    const done = document.querySelector(`[data-done="${item.id}"]`);

    if (accept) accept.addEventListener("click", () => changeStatus(item.id, "Sedang Dikerjakan"));
    if (reject) reject.addEventListener("click", () => changeStatus(item.id, "Belum Diproses", true));
    if (done) done.addEventListener("click", () => changeStatus(item.id, "Sudah Dikerjakan"));
  });
}

function reportHTML(item) {
  const urgencyClass = item.urgensi.toLowerCase();
  const statusClass = item.status === "Sudah Dikerjakan"
    ? "done"
    : item.status === "Sedang Dikerjakan"
      ? "working"
      : "new";

  let actions = "";

  if (item.status === "Belum Diproses") {
    actions = `
      <div class="action-row">
        <button class="accept-btn" data-accept="${item.id}">✓ Terima</button>
        <button class="reject-btn" data-reject="${item.id}">Tolak</button>
      </div>`;
  } else if (item.status === "Sedang Dikerjakan") {
    actions = `
      <div class="action-row">
        <button class="done-btn" data-done="${item.id}">✓ Tandai Sudah Dikerjakan</button>
      </div>`;
  } else {
    actions = `<div class="completed-note">✓ Laporan telah selesai ditangani</div>`;
  }

  return `
    <article class="report">
      <div class="report-main">
        <div class="report-title-row">
          <h3>${escapeHTML(item.keluhan)}</h3>
          <span class="urgency ${urgencyClass}">${escapeHTML(item.urgensi)}</span>
        </div>

        <div class="meta">
          <span>👤 ${escapeHTML(item.nama)}</span>
          <span>📍 ${escapeHTML(item.lokasi)}</span>
        </div>

        <span class="status ${statusClass}">${escapeHTML(item.status)}</span>
      </div>
      ${actions}
    </article>`;
}

async function changeStatus(id, status, rejected = false) {
  try {
    const data = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === "Sedang Dikerjakan") {
      data.assignedTo = currentUser.uid;
      data.assignedRole = currentRole;
    }

    if (rejected) {
      data.assignedTo = null;
      data.assignedRole = null;
    }

    await updateDoc(doc(db, "laporan", id), data);
  } catch (error) {
    console.error(error);
    alert("Status belum berhasil diubah. Periksa koneksi dan Rules Firebase.");
  }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
