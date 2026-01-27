// ========================================
// MAHASISWA BIMBINGAN PAGE (Dosen)
// ========================================

import { dosenAPI } from "../api.js";
import { initPage, closeSidebar } from "../utils/pageInit.js";
import { formatDateShort, getStatusDisplay, getInitials, getTrackDisplayName } from "../utils/formatUtils.js";

// ---------- STATE ----------
let mahasiswaList = [];
let currentFilter = "all";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize page with sidebar
  const { isAuthenticated } = initPage({ activeMenu: "mahasiswa-bimbingan" });
  if (!isAuthenticated) return;

  // Setup global closeSidebar
  window.closeSidebar = closeSidebar;

  // Load data
  await loadMahasiswaData();

  // Event listeners
  setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadMahasiswaData() {
  try {
    const result = await dosenAPI.getMahasiswaBimbingan();

    if (result.ok && result.data) {
      mahasiswaList = result.data;
    } else {
      // API failed - use dummy data for demo
      console.warn("API failed, using dummy data");
      mahasiswaList = getDummyData();
    }
  } catch (err) {
    console.error("Error loading mahasiswa:", err);
    // Use dummy data for demo
    mahasiswaList = getDummyData();
  }

  renderMahasiswaList();
  updateStats();
}

function getDummyData() {
  return [
    {
      id: 1,
      nama: "Ahmad Fauzan",
      npm: "2023010001",
      email: "ahmad@student.ac.id",
      track: "proyek-1",
      judul_proyek: "Sistem Informasi Perpustakaan Digital",
      status_proposal: "approved",
      bimbingan_count: 5,
      bimbingan_pending: 1,
      status: "active",
    },
    {
      id: 2,
      nama: "Siti Nurhaliza",
      npm: "2023010002",
      email: "siti@student.ac.id",
      track: "internship-1",
      judul_proyek: "Internship di PT Teknologi Nusantara",
      status_proposal: "approved",
      bimbingan_count: 8,
      bimbingan_pending: 0,
      status: "ready",
    },
    {
      id: 3,
      nama: "Budi Santoso",
      npm: "2023010003",
      email: "budi@student.ac.id",
      track: "proyek-2",
      judul_proyek: "Aplikasi Mobile E-Commerce UMKM",
      status_proposal: "approved",
      bimbingan_count: 3,
      bimbingan_pending: 2,
      status: "active",
    },
    {
      id: 4,
      nama: "Dewi Anggraini",
      npm: "2022010015",
      email: "dewi@student.ac.id",
      track: "proyek-1",
      judul_proyek: "Sistem Monitoring Kesehatan IoT",
      status_proposal: "approved",
      bimbingan_count: 8,
      bimbingan_pending: 0,
      status: "completed",
    },
  ];
}

// ---------- RENDERING ----------
function renderMahasiswaList() {
  const container = document.getElementById("mahasiswa-list");
  const searchTerm = document.getElementById("search-input")?.value.toLowerCase() || "";

  // Filter data
  let filtered = mahasiswaList.filter((m) => {
    // Search filter
    if (searchTerm) {
      const matchName = m.nama.toLowerCase().includes(searchTerm);
      const matchNpm = m.npm.includes(searchTerm);
      if (!matchName && !matchNpm) return false;
    }

    // Status filter
    if (currentFilter === "active") return m.status === "active";
    if (currentFilter === "pending") return m.bimbingan_pending > 0;
    if (currentFilter === "completed") return m.status === "completed" || m.status === "ready";

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = filtered.map((m) => renderMahasiswaCard(m)).join("");
}

function renderEmptyState() {
  return `
    <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
      <span class="material-symbols-outlined text-5xl text-slate-300">search_off</span>
      <h3 class="text-lg font-bold text-text-main mt-4">Tidak ada data</h3>
      <p class="text-text-secondary text-sm mt-1">Tidak ditemukan mahasiswa dengan filter ini</p>
    </div>
  `;
}

function renderMahasiswaCard(m) {
  const statusConfig = getMahasiswaStatusConfig(m);
  const progressPercent = Math.min((m.bimbingan_count / 8) * 100, 100);

  return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Avatar & Basic Info -->
        <div class="flex items-start gap-4 flex-1 min-w-0">
          <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg lg:text-xl shrink-0">
            ${getInitials(m.nama)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-bold text-text-main text-base lg:text-lg truncate">${m.nama}</h3>
              <span class="px-2 py-0.5 text-[10px] lg:text-xs font-medium rounded-full ${statusConfig.badgeClass}">
                ${statusConfig.text}
              </span>
            </div>
            <p class="text-text-secondary text-xs lg:text-sm">${m.npm} • ${getTrackDisplayName(m.track)}</p>
            <p class="text-text-main text-sm mt-2 line-clamp-1">${m.judul || m.judul_proyek || "Belum ada judul"}</p>
          </div>
        </div>

        <!-- Progress & Actions -->
        <div class="flex flex-col sm:items-end gap-3 shrink-0">
          <!-- Bimbingan Progress -->
          <div class="w-full sm:w-40">
            <div class="flex justify-between text-xs text-text-secondary mb-1">
              <span>Bimbingan</span>
              <span>${m.bimbingan_count}/8</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary transition-all" style="width: ${progressPercent}%"></div>
            </div>
          </div>

          <!-- Pending Badge -->
          ${m.bimbingan_pending > 0
      ? `
          <div class="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg text-xs font-medium">
            <span class="material-symbols-outlined text-[14px]">pending</span>
            ${m.bimbingan_pending} pending
          </div>
          `
      : ""
    }

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button onclick="viewDetail(${m.id})" class="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
              Detail
            </button>
            ${m.bimbingan_pending > 0
      ? `
            <a href="/dosen/bimbingan-approve.html?mahasiswa=${m.id}" class="px-3 py-1.5 text-xs font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Review
            </a>
            `
      : ""
    }
          </div>
        </div>
      </div>
    </div>
  `;
}

function getMahasiswaStatusConfig(m) {
  if (m.status === "completed") {
    return { text: "Lulus", badgeClass: "bg-green-100 text-green-700" };
  }
  if (m.status === "ready" || m.bimbingan_count >= 8) {
    return { text: "Siap Sidang", badgeClass: "bg-blue-100 text-blue-700" };
  }
  if (m.bimbingan_pending > 0) {
    return { text: "Ada Pending", badgeClass: "bg-yellow-100 text-yellow-700" };
  }
  return { text: "Aktif", badgeClass: "bg-slate-100 text-slate-700" };
}

function updateStats() {
  const total = mahasiswaList.length;
  const pending = mahasiswaList.filter((m) => m.bimbingan_pending > 0).length;
  const ready = mahasiswaList.filter((m) => m.status === "ready" || (m.bimbingan_count >= 8 && m.status !== "completed")).length;
  const completed = mahasiswaList.filter((m) => m.status === "completed").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-approved").textContent = ready;
  document.getElementById("stat-completed").textContent = completed;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
  // Search
  document.getElementById("search-input")?.addEventListener("input", () => {
    renderMahasiswaList();
  });

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderMahasiswaList();
    });
  });

  // Modal close
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
  document.getElementById("detail-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "detail-modal") closeModal();
  });
}

// ---------- MODAL ----------
window.viewDetail = function (id) {
  const mahasiswa = mahasiswaList.find((m) => m.id === id);
  if (!mahasiswa) return;

  const modal = document.getElementById("detail-modal");
  const content = document.getElementById("modal-content");

  const statusConfig = getMahasiswaStatusConfig(mahasiswa);

  content.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl">
          ${getInitials(mahasiswa.nama)}
        </div>
        <div>
          <h3 class="font-bold text-text-main text-lg">${mahasiswa.nama}</h3>
          <p class="text-text-secondary text-sm">${mahasiswa.npm}</p>
          <span class="px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.badgeClass} mt-1 inline-block">
            ${statusConfig.text}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-50 p-3 rounded-lg">
          <p class="text-text-secondary text-xs">Track</p>
          <p class="font-semibold text-text-main text-sm">${getTrackDisplayName(mahasiswa.track)}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg">
          <p class="text-text-secondary text-xs">Email</p>
          <p class="font-semibold text-text-main text-sm truncate">${mahasiswa.email}</p>
        </div>
      </div>

      <!-- Project -->
      <div class="bg-slate-50 p-4 rounded-lg">
        <p class="text-text-secondary text-xs mb-1">Judul Proyek/Internship</p>
        <p class="font-semibold text-text-main text-sm">${mahasiswa.judul_proyek || "Belum ada"}</p>
      </div>

      <!-- Progress -->
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-text-secondary">Progress Bimbingan</span>
          <span class="font-semibold text-text-main">${mahasiswa.bimbingan_count}/8 sesi</span>
        </div>
        <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all" style="width: ${Math.min((mahasiswa.bimbingan_count / 8) * 100, 100)}%"></div>
        </div>
        ${mahasiswa.bimbingan_pending > 0
      ? `
        <p class="text-yellow-600 text-xs mt-2 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">pending</span>
          ${mahasiswa.bimbingan_pending} bimbingan menunggu approval
        </p>
        `
      : ""
    }
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        ${mahasiswa.bimbingan_pending > 0
      ? `
        <a href="/dosen/bimbingan-approve.html?mahasiswa=${mahasiswa.id}" class="flex-1 py-2.5 text-center text-sm font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
          Review Bimbingan
        </a>
        `
      : ""
    }
        <a href="mailto:${mahasiswa.email}" class="flex-1 py-2.5 text-center text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
          Hubungi
        </a>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

function closeModal() {
  const modal = document.getElementById("detail-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

function showError(message) {
  const container = document.getElementById("mahasiswa-list");
  container.innerHTML = `
    <div class="text-center py-12 bg-red-50 rounded-xl border border-red-100">
      <span class="material-symbols-outlined text-5xl text-red-300">error</span>
      <h3 class="text-lg font-bold text-red-600 mt-4">Error</h3>
      <p class="text-red-500 text-sm mt-1">${message}</p>
      <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
        Coba Lagi
      </button>
    </div>
  `;
}
