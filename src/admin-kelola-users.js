// ========================================
// ADMIN - KELOLA USERS PAGE
// ========================================

import { adminAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";

// ---------- STATE ----------
let currentTab = "mahasiswa";
let mahasiswaList = [];
let dosenList = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  const { isAuthenticated } = initPage({ activeMenu: "kelola-users" });
  if (!isAuthenticated) return;

  window.closeSidebar = closeSidebar;

  // Tab events
  document.getElementById("tab-mahasiswa").addEventListener("click", () => switchTab("mahasiswa"));
  document.getElementById("tab-dosen").addEventListener("click", () => switchTab("dosen"));

  await loadData();
  renderList();
});

function switchTab(tab) {
  currentTab = tab;

  // Update tab styles
  document.getElementById("tab-mahasiswa").className = tab === "mahasiswa"
    ? "px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary"
    : "px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary";
  document.getElementById("tab-dosen").className = tab === "dosen"
    ? "px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary"
    : "px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary";

  renderList();
}

// ---------- DATA LOADING ----------
async function loadData() {
  try {
    const result = await adminAPI.getAllUsers();
    if (result.ok) {
      mahasiswaList = result.data.mahasiswa || [];
      dosenList = result.data.dosen || [];
    }
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

// ---------- RENDER ----------
function renderList() {
  const container = document.getElementById("user-list");
  const list = currentTab === "mahasiswa" ? mahasiswaList : dosenList;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300">person_off</span>
        <p class="text-text-secondary mt-2">Tidak ada data ${currentTab}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-slate-50 text-text-secondary">
        <tr>
          <th class="px-4 py-3 text-left font-medium">Nama</th>
          <th class="px-4 py-3 text-left font-medium">Email</th>
          <th class="px-4 py-3 text-left font-medium">${currentTab === "mahasiswa" ? "NPM" : "Role"}</th>
          <th class="px-4 py-3 text-center font-medium">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        ${list.map(user => renderRow(user)).join("")}
      </tbody>
    </table>
  `;
}

function renderRow(user) {
  return `
    <tr class="hover:bg-slate-50">
      <td class="px-4 py-3 font-medium text-text-main">${user.nama}</td>
      <td class="px-4 py-3 text-text-secondary">${user.email}</td>
      <td class="px-4 py-3 text-text-secondary">${currentTab === "mahasiswa" ? (user.npm || "-") : (user.roles || "dosen")}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="deleteUser(${user.id}, '${user.nama}')" class="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1 mx-auto">
          <span class="material-symbols-outlined text-[14px]">delete</span>
          Hapus
        </button>
      </td>
    </tr>
  `;
}

// ---------- ACTIONS ----------
window.deleteUser = async function (userId, userName) {
  const confirmed = confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?\n\nTindakan ini tidak dapat dibatalkan!`);
  if (!confirmed) return;

  try {
    const result = await adminAPI.deleteUser(userId, currentTab);
    if (result.ok) {
      await loadData();
      renderList();
      alert("User berhasil dihapus");
    } else {
      alert("Gagal menghapus user: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Terjadi kesalahan saat menghapus user");
  }
};
