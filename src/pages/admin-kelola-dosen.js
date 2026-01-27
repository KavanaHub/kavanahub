// ========================================
// ADMIN - KELOLA DOSEN PAGE
// ========================================

import { adminAPI } from "../api.js";
import { initPage, closeSidebar } from "../utils/pageInit.js";

// ---------- STATE ----------
let dosenList = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  const { isAuthenticated } = initPage({ activeMenu: "kelola-dosen" });
  if (!isAuthenticated) return;

  window.closeSidebar = closeSidebar;

  // Form submit
  document.getElementById("add-form").addEventListener("submit", handleSubmit);

  await loadData();
  renderList();
});

// ---------- DATA LOADING ----------
async function loadData() {
  try {
    const result = await adminAPI.getAllDosen();
    if (result.ok) {
      dosenList = result.data || [];
    }
  } catch (err) {
    console.error("Error loading dosen:", err);
  }
}

// ---------- RENDER ----------
function renderList() {
  const container = document.getElementById("dosen-list");

  if (dosenList.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300">person_off</span>
        <p class="text-text-secondary mt-2">Tidak ada data dosen</p>
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
          <th class="px-4 py-3 text-left font-medium">NIDN</th>
          <th class="px-4 py-3 text-left font-medium">Role</th>
          <th class="px-4 py-3 text-center font-medium">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        ${dosenList.map(d => renderRow(d)).join("")}
      </tbody>
    </table>
  `;
}

function renderRow(dosen) {
  return `
    <tr class="hover:bg-slate-50">
      <td class="px-4 py-3 font-medium text-text-main">${dosen.nama}</td>
      <td class="px-4 py-3 text-text-secondary">${dosen.email}</td>
      <td class="px-4 py-3 text-text-secondary">${dosen.nidn || "-"}</td>
      <td class="px-4 py-3 text-text-secondary">${dosen.roles || "dosen"}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="deleteDosen(${dosen.id}, '${dosen.nama}')" class="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">delete</span>
          Hapus
        </button>
      </td>
    </tr>
  `;
}

// ---------- MODAL ----------
window.openAddModal = function () {
  document.getElementById("add-modal").classList.remove("hidden");
};

window.closeAddModal = function () {
  document.getElementById("add-modal").classList.add("hidden");
  document.getElementById("add-form").reset();
};

// ---------- ACTIONS ----------
async function handleSubmit(e) {
  e.preventDefault();

  const data = {
    nama: document.getElementById("input-nama").value,
    email: document.getElementById("input-email").value,
    nidn: document.getElementById("input-nidn").value,
    roles: [document.getElementById("input-jabatan").value], // Now sends roles array
    password: document.getElementById("input-password").value || undefined
  };

  try {
    const result = await adminAPI.createDosen(data);
    if (result.ok) {
      closeAddModal();
      await loadData();
      renderList();
      alert("Dosen berhasil ditambahkan");
    } else {
      alert("Gagal menambahkan dosen: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error creating dosen:", err);
    alert("Terjadi kesalahan");
  }
}

window.deleteDosen = async function (dosenId, dosenName) {
  const confirmed = confirm(`Apakah Anda yakin ingin menghapus dosen "${dosenName}"?\n\nTindakan ini tidak dapat dibatalkan!`);
  if (!confirmed) return;

  try {
    const result = await adminAPI.deleteUser(dosenId, "dosen");
    if (result.ok) {
      await loadData();
      renderList();
      alert("Dosen berhasil dihapus");
    } else {
      alert("Gagal menghapus dosen: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting dosen:", err);
    alert("Terjadi kesalahan");
  }
};
