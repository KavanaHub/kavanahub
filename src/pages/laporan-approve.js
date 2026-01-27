// ========================================
// APPROVE LAPORAN PAGE (Dosen)
// ========================================

import { dosenAPI } from "../api.js";
import { initPage, closeSidebar } from "../utils/pageInit.js";
import { formatDateShort, getInitials, getTrackDisplayName } from "../utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "../utils/formUtils.js";
import { showToast, showModal } from "../utils/alerts.js";

// ---------- STATE ----------
let laporanList = [];
let currentFilter = "pending";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize page with sidebar
  const { isAuthenticated } = initPage({ activeMenu: "laporan-approve" });
  if (!isAuthenticated) return;

  // Setup global closeSidebar
  window.closeSidebar = closeSidebar;

  // Load data
  await loadLaporanData();

  // Event listeners
  setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadLaporanData() {
  try {
    const result = await dosenAPI.getLaporanList();

    if (result.ok && result.data) {
      laporanList = result.data;
    } else {
      // API failed - use dummy data for demo
      console.warn("API failed, using dummy data");
      laporanList = getDummyData();
    }
  } catch (err) {
    console.error("Error loading laporan:", err);
    laporanList = getDummyData();
  }

  renderLaporanList();
  updateStats();
}

function getDummyData() {
  return [
    {
      id: 1,
      mahasiswa_id: 1,
      mahasiswa_nama: "Ahmad Fauzan",
      mahasiswa_npm: "2023010001",
      track: "proyek-1",
      judul: "Sistem Informasi Perpustakaan Digital",
      file_laporan: "https://drive.google.com/file/d/abc123",
      tanggal_submit: "2024-12-15",
      bimbingan_count: 8,
      status: "pending",
    },
    {
      id: 2,
      mahasiswa_id: 2,
      mahasiswa_nama: "Siti Nurhaliza",
      mahasiswa_npm: "2023010002",
      track: "internship-1",
      judul: "Internship Report - PT Teknologi Nusantara",
      file_laporan: "https://drive.google.com/file/d/def456",
      tanggal_submit: "2024-12-14",
      bimbingan_count: 8,
      status: "approved",
      catatan_dosen: "Laporan sudah lengkap dan baik",
    },
    {
      id: 3,
      mahasiswa_id: 3,
      mahasiswa_nama: "Budi Santoso",
      mahasiswa_npm: "2023010003",
      track: "proyek-2",
      judul: "Aplikasi Mobile E-Commerce UMKM",
      file_laporan: "https://drive.google.com/file/d/ghi789",
      tanggal_submit: "2024-12-12",
      bimbingan_count: 8,
      status: "revision",
      catatan_dosen: "Perlu tambahkan analisis hasil testing dan kesimpulan yang lebih detail",
    },
  ];
}

// ---------- RENDERING ----------
function renderLaporanList() {
  const container = document.getElementById("laporan-list");

  // Filter data
  let filtered = laporanList.filter((l) => {
    if (currentFilter === "all") return true;
    // Treat 'submitted' as 'pending' for backward compatibility
    const status = l.status === 'submitted' ? 'pending' : l.status;
    return status === currentFilter;
  });

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.tanggal_submit) - new Date(a.tanggal_submit));

  if (filtered.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = filtered.map((l) => renderLaporanCard(l)).join("");
}

function renderEmptyState() {
  const messages = {
    pending: "Tidak ada laporan yang perlu direview",
    approved: "Belum ada laporan yang diapprove",
    revision: "Tidak ada laporan yang perlu revisi",
    all: "Tidak ada data laporan",
  };

  return `
    <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
      <span class="material-symbols-outlined text-5xl text-slate-300">inbox</span>
      <h3 class="text-lg font-bold text-text-main mt-4">${messages[currentFilter]}</h3>
      <p class="text-text-secondary text-sm mt-1">Data akan muncul di sini</p>
    </div>
  `;
}

function renderLaporanCard(l) {
  const statusConfig = getStatusConfig(l.status);

  // Display Logic: Use Group Name if available
  const displayName = l.kelompok_nama ? `Kelompok: ${l.kelompok_nama}` : l.mahasiswa_nama;
  const displaySub = l.kelompok_nama ? `${l.mahasiswa_nama} (${l.mahasiswa_npm})` : `${l.mahasiswa_npm} • ${getTrackDisplayName(l.track)}`;

  return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${getInitials(displayName)}
            </div>
            <div>
              <p class="font-semibold text-text-main text-sm lg:text-base">${displayName}</p>
              <p class="text-text-secondary text-xs">${displaySub}</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badgeClass}">
            ${statusConfig.icon} ${statusConfig.text}
          </span>
        </div>

        <!-- Content -->
        <div class="bg-slate-50 p-3 lg:p-4 rounded-lg">
          <h4 class="font-semibold text-text-main text-sm mb-2">${l.judul}</h4>
          <div class="flex flex-wrap gap-4 text-xs text-text-secondary">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">calendar_today</span>
              Submit: ${formatDateShort(l.tanggal_submit)}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">chat</span>
              ${l.bimbingan_count}/8 bimbingan
            </span>
            ${l.kelompok_nama ? `
            <span class="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              <span class="material-symbols-outlined text-[16px]">groups</span>
              Group Submission
            </span>
            ` : ''}
          </div>
        </div>

        ${l.catatan_dosen ? `
        <div class="bg-${l.status === 'approved' ? 'green' : 'yellow'}-50 p-3 rounded-lg border border-${l.status === 'approved' ? 'green' : 'yellow'}-100">
          <p class="text-${l.status === 'approved' ? 'green' : 'yellow'}-700 text-xs"><span class="font-medium">Catatan:</span> ${l.catatan_dosen}</p>
        </div>
        ` : ""}

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <a href="${l.file_laporan}" target="_blank" class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[16px]">description</span>
            Lihat Laporan
          </a>
          <button onclick="previewLaporan(${l.id})" class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span class="material-symbols-outlined text-[16px]">visibility</span>
            Detail
          </button>
          ${(l.status === "pending" || l.status === "submitted") ? `
          <button onclick="openApproveModal(${l.id})" class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <span class="material-symbols-outlined text-[16px]">check</span>
            Approve
          </button>
          <button onclick="openRevisionModal(${l.id})" class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
            <span class="material-symbols-outlined text-[16px]">edit</span>
            Revisi
          </button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function getStatusConfig(status) {
  const configs = {
    pending: { text: "Pending", icon: '<span class="material-symbols-outlined text-[14px] align-middle">description</span>', badgeClass: "bg-yellow-100 text-yellow-700" },
    submitted: { text: "Pending", icon: '<span class="material-symbols-outlined text-[14px] align-middle">description</span>', badgeClass: "bg-yellow-100 text-yellow-700" },
    approved: { text: "Approved", icon: '<span class="material-symbols-outlined text-[14px] align-middle">check_circle</span>', badgeClass: "bg-green-100 text-green-700" },
    revision: { text: "Perlu Revisi", icon: '<span class="material-symbols-outlined text-[14px] align-middle">refresh</span>', badgeClass: "bg-orange-100 text-orange-700" },
  };
  return configs[status] || configs.pending;
}

function updateStats() {
  // Include 'submitted' as 'pending' for backward compatibility
  const pending = laporanList.filter((l) => l.status === "pending" || l.status === "submitted").length;
  const approved = laporanList.filter((l) => l.status === "approved").length;
  const revision = laporanList.filter((l) => l.status === "revision").length;

  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-approved").textContent = approved;
  document.getElementById("stat-rejected").textContent = revision;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderLaporanList();
    });
  });

  // Action Modal
  document.getElementById("modal-close")?.addEventListener("click", closeActionModal);
  document.getElementById("btn-modal-cancel")?.addEventListener("click", closeActionModal);
  document.getElementById("action-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "action-modal") closeActionModal();
  });
  document.getElementById("action-form")?.addEventListener("submit", handleAction);

  // Preview Modal
  document.getElementById("preview-close")?.addEventListener("click", closePreviewModal);
  document.getElementById("preview-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "preview-modal") closePreviewModal();
  });
}

// ---------- ACTION MODAL ----------
window.openApproveModal = function (id) {
  const laporan = laporanList.find((l) => l.id === id);
  if (!laporan) return;

  const subjectName = laporan.kelompok_nama ? `Kelompok ${laporan.kelompok_nama}` : laporan.mahasiswa_nama;
  const warningText = laporan.kelompok_nama ? `(Akan meng-approve untuk SELURUH anggota kelompok)` : '';

  document.getElementById("action-id").value = id;
  document.getElementById("action-type").value = "approved";
  document.getElementById("modal-title").textContent = "Approve Laporan";
  document.getElementById("modal-desc").textContent = `Approve laporan "${laporan.judul}" oleh ${subjectName}? ${warningText}`;
  document.getElementById("action-catatan").value = "";
  document.getElementById("error-catatan").classList.add("hidden");

  const submitBtn = document.getElementById("btn-modal-submit");
  submitBtn.textContent = "Approve";
  submitBtn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors bg-green-500 hover:bg-green-600";

  openActionModal();
};

window.openRevisionModal = function (id) {
  const laporan = laporanList.find((l) => l.id === id);
  if (!laporan) return;

  document.getElementById("action-id").value = id;
  document.getElementById("action-type").value = "revision";
  document.getElementById("modal-title").textContent = "Minta Revisi";
  document.getElementById("modal-desc").textContent = `Minta revisi untuk laporan "${laporan.judul}" oleh ${laporan.mahasiswa_nama}? Wajib berikan catatan.`;
  document.getElementById("action-catatan").value = "";
  document.getElementById("error-catatan").classList.add("hidden");

  const submitBtn = document.getElementById("btn-modal-submit");
  submitBtn.textContent = "Minta Revisi";
  submitBtn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors bg-yellow-500 hover:bg-yellow-600";

  openActionModal();
};

function openActionModal() {
  const modal = document.getElementById("action-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeActionModal() {
  const modal = document.getElementById("action-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

async function handleAction(e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("action-id").value);
  const status = document.getElementById("action-type").value;
  const catatan = document.getElementById("action-catatan").value.trim();

  // Validate - catatan wajib untuk revisi
  if (status === "revision" && !catatan) {
    document.getElementById("error-catatan").textContent = "Catatan wajib diisi untuk revisi";
    document.getElementById("error-catatan").classList.remove("hidden");
    return;
  }

  const submitBtn = document.getElementById("btn-modal-submit");
  setButtonLoading(submitBtn, "Memproses...");

  try {
    const result = await dosenAPI.approveLaporan(id, status);

    if (result.ok) {
      updateLocalData(id, status, catatan);
      showSuccessMessage(status);
    } else {
      showModal.error("Gagal", result.error || "Terjadi kesalahan");
    }
  } catch (err) {
    console.error("Action error:", err);
    // For demo, just update locally
    updateLocalData(id, status, catatan);
    showSuccessMessage(status);
  } finally {
    resetButtonLoading(submitBtn);
  }
}

function updateLocalData(id, status, catatan) {
  const laporan = laporanList.find((l) => l.id === id);
  if (laporan) {
    laporan.status = status;
    if (catatan) laporan.catatan_dosen = catatan;
  }
  closeActionModal();
  renderLaporanList();
  updateStats();
}

function showSuccessMessage(status) {
  const messages = {
    approved: "Laporan berhasil diapprove",
    revision: "Permintaan revisi terkirim",
  };
  showToast.success(messages[status] || "Berhasil");
}

// ---------- PREVIEW MODAL ----------
window.previewLaporan = function (id) {
  const laporan = laporanList.find((l) => l.id === id);
  if (!laporan) return;

  const statusConfig = getStatusConfig(laporan.status);
  const content = document.getElementById("preview-content");

  content.innerHTML = `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl">
          ${getInitials(laporan.mahasiswa_nama)}
        </div>
        <div>
          <h3 class="font-bold text-text-main text-lg">${laporan.mahasiswa_nama}</h3>
          <p class="text-text-secondary text-sm">${laporan.mahasiswa_npm} • ${getTrackDisplayName(laporan.track)}</p>
          <span class="px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.badgeClass} mt-1 inline-block">
            ${statusConfig.icon} ${statusConfig.text}
          </span>
        </div>
      </div>

      <!-- Project Title -->
      <div class="bg-slate-50 p-4 rounded-lg">
        <p class="text-text-secondary text-xs mb-1">Judul Laporan</p>
        <p class="font-semibold text-text-main">${laporan.judul}</p>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-50 p-3 rounded-lg">
          <p class="text-text-secondary text-xs">Tanggal Submit</p>
          <p class="font-semibold text-text-main text-sm">${formatDateShort(laporan.tanggal_submit)}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-lg">
          <p class="text-text-secondary text-xs">Bimbingan</p>
          <p class="font-semibold text-text-main text-sm">${laporan.bimbingan_count}/8 sesi</p>
        </div>
      </div>

      ${laporan.catatan_dosen ? `
      <div class="bg-${laporan.status === 'approved' ? 'green' : 'yellow'}-50 p-4 rounded-lg">
        <p class="font-medium text-${laporan.status === 'approved' ? 'green' : 'yellow'}-700 text-sm mb-1">Catatan Dosen:</p>
        <p class="text-${laporan.status === 'approved' ? 'green' : 'yellow'}-600 text-sm">${laporan.catatan_dosen}</p>
      </div>
      ` : ""}

      <!-- Actions -->
      <div class="flex gap-3">
        <a href="${laporan.file_laporan}" target="_blank" class="flex-1 py-2.5 text-center text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
          Buka Laporan
        </a>
        ${laporan.status === "pending" ? `
        <button onclick="closePreviewModal(); openApproveModal(${laporan.id});" class="px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Approve
        </button>
        ` : ""}
      </div>
    </div>
  `;

  const modal = document.getElementById("preview-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
};

window.closePreviewModal = function () {
  const modal = document.getElementById("preview-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
};

// showToast is now imported from alerts.js
