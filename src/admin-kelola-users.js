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
          <th class="px-4 py-3 text-left font-medium">${currentTab === "mahasiswa" ? "NPM" : "Jabatan"}</th>
          <th class="px-4 py-3 text-center font-medium">Status</th>
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
    const isActive = user.is_active !== false;
    const statusBadge = isActive
        ? '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Aktif</span>'
        : '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Non-Aktif</span>';

    return `
    <tr class="hover:bg-slate-50">
      <td class="px-4 py-3 font-medium text-text-main">${user.nama}</td>
      <td class="px-4 py-3 text-text-secondary">${user.email}</td>
      <td class="px-4 py-3 text-text-secondary">${currentTab === "mahasiswa" ? (user.npm || "-") : (user.jabatan || "Dosen")}</td>
      <td class="px-4 py-3 text-center">${statusBadge}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="toggleStatus(${user.id}, ${isActive})" class="text-xs px-2 py-1 rounded ${isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}">
          ${isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </td>
    </tr>
  `;
}

// ---------- ACTIONS ----------
window.toggleStatus = async function (userId, isCurrentlyActive) {
    try {
        const result = await adminAPI.updateUserStatus(userId, currentTab, !isCurrentlyActive);
        if (result.ok) {
            await loadData();
            renderList();
        } else {
            alert("Gagal mengubah status");
        }
    } catch (err) {
        console.error("Error toggling status:", err);
        alert("Terjadi kesalahan");
    }
};
