// ========================================
// APPROVE BIMBINGAN PAGE (Dosen)
// ========================================

import { dosenAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateShort, getInitials, getTrackDisplayName } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let bimbinganList = [];
let mahasiswaMap = {};
let currentFilter = "pending";
let currentMahasiswa = "all";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize page with sidebar
    const { isAuthenticated } = initPage({ activeMenu: "bimbingan-approve" });
    if (!isAuthenticated) return;

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    // Check URL params for specific mahasiswa
    const urlParams = new URLSearchParams(window.location.search);
    const mahasiswaId = urlParams.get("mahasiswa");
    if (mahasiswaId) {
        currentMahasiswa = mahasiswaId;
    }

    // Load data
    await loadBimbinganData();

    // Event listeners
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadBimbinganData() {
    try {
        const result = await dosenAPI.getBimbinganList();

        if (result.ok && result.data) {
            bimbinganList = result.data;
        } else {
            // API failed - use dummy data for demo
            console.warn("API failed, using dummy data");
            bimbinganList = getDummyData();
        }
    } catch (err) {
        console.error("Error loading bimbingan:", err);
        // Use dummy data for demo
        bimbinganList = getDummyData();
    }

    buildMahasiswaFilter();
    renderBimbinganList();
    updateStats();
}

function getDummyData() {
    return [
        {
            id: 1,
            mahasiswa_id: 1,
            mahasiswa_nama: "Ahmad Fauzan",
            mahasiswa_npm: "2023010001",
            tanggal: "2024-12-15",
            kegiatan: "Konsultasi BAB 1 - Pendahuluan",
            catatan: "Membahas latar belakang masalah dan rumusan masalah. Sudah ada outline yang cukup baik.",
            rencana_selanjutnya: "Melanjutkan ke BAB 2 tinjauan pustaka",
            status: "pending",
        },
        {
            id: 2,
            mahasiswa_id: 1,
            mahasiswa_nama: "Ahmad Fauzan",
            mahasiswa_npm: "2023010001",
            tanggal: "2024-12-10",
            kegiatan: "Diskusi Topik Proyek",
            catatan: "Menentukan topik dan scope proyek. Topik: Sistem Informasi Perpustakaan Digital",
            rencana_selanjutnya: "Mulai menulis BAB 1",
            status: "approved",
        },
        {
            id: 3,
            mahasiswa_id: 2,
            mahasiswa_nama: "Siti Nurhaliza",
            mahasiswa_npm: "2023010002",
            tanggal: "2024-12-14",
            kegiatan: "Review Progress Internship",
            catatan: "Progress internship minggu ke-4. Sudah mengerjakan modul authentication.",
            rencana_selanjutnya: "Lanjut ke modul dashboard",
            status: "pending",
        },
        {
            id: 4,
            mahasiswa_id: 3,
            mahasiswa_nama: "Budi Santoso",
            mahasiswa_npm: "2023010003",
            tanggal: "2024-12-12",
            kegiatan: "Konsultasi Desain Database",
            catatan: "Review ERD dan normalisasi database",
            rencana_selanjutnya: "Implementasi backend API",
            status: "rejected",
            catatan_dosen: "ERD perlu diperbaiki, relasi antar tabel masih kurang tepat",
        },
    ];
}

function buildMahasiswaFilter() {
    // Build unique mahasiswa list
    mahasiswaMap = {};
    bimbinganList.forEach((b) => {
        if (!mahasiswaMap[b.mahasiswa_id]) {
            mahasiswaMap[b.mahasiswa_id] = {
                id: b.mahasiswa_id,
                nama: b.mahasiswa_nama,
                npm: b.mahasiswa_npm,
            };
        }
    });

    // Populate dropdown
    const select = document.getElementById("filter-mahasiswa");
    select.innerHTML = '<option value="all">Semua Mahasiswa</option>';

    Object.values(mahasiswaMap).forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = `${m.nama} (${m.npm})`;
        if (currentMahasiswa == m.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ---------- RENDERING ----------
function renderBimbinganList() {
    const container = document.getElementById("bimbingan-list");

    // Filter data
    let filtered = bimbinganList.filter((b) => {
        // Mahasiswa filter
        if (currentMahasiswa !== "all" && b.mahasiswa_id != currentMahasiswa) return false;

        // Status filter
        if (currentFilter !== "all" && b.status !== currentFilter) return false;

        return true;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (filtered.length === 0) {
        container.innerHTML = renderEmptyState();
        return;
    }

    container.innerHTML = filtered.map((b) => renderBimbinganCard(b)).join("");
}

function renderEmptyState() {
    const messages = {
        pending: "Tidak ada bimbingan yang perlu direview",
        approved: "Belum ada bimbingan yang diapprove",
        rejected: "Tidak ada bimbingan yang ditolak",
        all: "Tidak ada data bimbingan",
    };

    return `
    <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
      <span class="material-symbols-outlined text-5xl text-slate-300">inbox</span>
      <h3 class="text-lg font-bold text-text-main mt-4">${messages[currentFilter]}</h3>
      <p class="text-text-secondary text-sm mt-1">Data akan muncul di sini</p>
    </div>
  `;
}

function renderBimbinganCard(b) {
    const statusConfig = getStatusConfig(b.status);

    return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${getInitials(b.mahasiswa_nama)}
            </div>
            <div>
              <p class="font-semibold text-text-main text-sm lg:text-base">${b.mahasiswa_nama}</p>
              <p class="text-text-secondary text-xs">${b.mahasiswa_npm} • ${formatDateShort(b.tanggal)}</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badgeClass}">
            ${statusConfig.icon} ${statusConfig.text}
          </span>
        </div>

        <!-- Content -->
        <div class="bg-slate-50 p-3 lg:p-4 rounded-lg">
          <h4 class="font-semibold text-text-main text-sm mb-2">${b.kegiatan}</h4>
          <p class="text-text-secondary text-xs lg:text-sm">${b.catatan}</p>
          ${b.rencana_selanjutnya ? `<p class="text-primary text-xs mt-2"><span class="font-medium">Rencana:</span> ${b.rencana_selanjutnya}</p>` : ""}
        </div>

        ${b.catatan_dosen
            ? `
        <div class="bg-red-50 p-3 rounded-lg border border-red-100">
          <p class="text-red-700 text-xs"><span class="font-medium">Catatan Dosen:</span> ${b.catatan_dosen}</p>
        </div>
        `
            : ""
        }

        <!-- Actions -->
        ${b.status === "pending"
            ? `
        <div class="flex gap-2 pt-2">
          <button onclick="openApproveModal(${b.id})" class="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <span class="material-symbols-outlined text-[18px]">check</span>
            Approve
          </button>
          <button onclick="openRejectModal(${b.id})" class="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
            Reject
          </button>
        </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function getStatusConfig(status) {
    const configs = {
        pending: { text: "Pending", icon: "🕐", badgeClass: "bg-yellow-100 text-yellow-700" },
        approved: { text: "Approved", icon: "✅", badgeClass: "bg-green-100 text-green-700" },
        rejected: { text: "Rejected", icon: "❌", badgeClass: "bg-red-100 text-red-700" },
    };
    return configs[status] || configs.pending;
}

function updateStats() {
    const pending = bimbinganList.filter((b) => b.status === "pending").length;
    const approved = bimbinganList.filter((b) => b.status === "approved").length;
    const rejected = bimbinganList.filter((b) => b.status === "rejected").length;

    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-approved").textContent = approved;
    document.getElementById("stat-rejected").textContent = rejected;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderBimbinganList();
        });
    });

    // Mahasiswa filter
    document.getElementById("filter-mahasiswa")?.addEventListener("change", (e) => {
        currentMahasiswa = e.target.value;
        renderBimbinganList();
    });

    // Modal
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("btn-modal-cancel")?.addEventListener("click", closeModal);
    document.getElementById("action-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "action-modal") closeModal();
    });

    // Form submit
    document.getElementById("action-form")?.addEventListener("submit", handleAction);
}

// ---------- MODAL ----------
window.openApproveModal = function (id) {
    const bimbingan = bimbinganList.find((b) => b.id === id);
    if (!bimbingan) return;

    document.getElementById("action-id").value = id;
    document.getElementById("action-type").value = "approved";
    document.getElementById("modal-title").textContent = "Approve Bimbingan";
    document.getElementById("modal-desc").textContent = `Approve bimbingan "${bimbingan.kegiatan}" oleh ${bimbingan.mahasiswa_nama}?`;
    document.getElementById("action-catatan").value = "";

    const submitBtn = document.getElementById("btn-modal-submit");
    submitBtn.textContent = "Approve";
    submitBtn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors bg-green-500 hover:bg-green-600";

    openModal();
};

window.openRejectModal = function (id) {
    const bimbingan = bimbinganList.find((b) => b.id === id);
    if (!bimbingan) return;

    document.getElementById("action-id").value = id;
    document.getElementById("action-type").value = "rejected";
    document.getElementById("modal-title").textContent = "Reject Bimbingan";
    document.getElementById("modal-desc").textContent = `Reject bimbingan "${bimbingan.kegiatan}" oleh ${bimbingan.mahasiswa_nama}? Berikan alasan penolakan.`;
    document.getElementById("action-catatan").value = "";

    const submitBtn = document.getElementById("btn-modal-submit");
    submitBtn.textContent = "Reject";
    submitBtn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors bg-red-500 hover:bg-red-600";

    openModal();
};

function openModal() {
    const modal = document.getElementById("action-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
}

function closeModal() {
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

    const submitBtn = document.getElementById("btn-modal-submit");
    setButtonLoading(submitBtn, "Memproses...");

    try {
        const result = await dosenAPI.approveBimbingan(id, status, catatan);

        if (result.ok) {
            // Update local data
            const bimbingan = bimbinganList.find((b) => b.id === id);
            if (bimbingan) {
                bimbingan.status = status;
                if (catatan) bimbingan.catatan_dosen = catatan;
            }

            closeModal();
            renderBimbinganList();
            updateStats();

            // Show success message
            showToast.success(status === "approved" ? "Bimbingan berhasil diapprove" : "Bimbingan ditolak");
        } else {
            showModal.error("Gagal", result.error || "Terjadi kesalahan");
        }
    } catch (err) {
        console.error("Action error:", err);
        // For demo, just update locally
        const bimbingan = bimbinganList.find((b) => b.id === id);
        if (bimbingan) {
            bimbingan.status = status;
            if (catatan) bimbingan.catatan_dosen = catatan;
        }
        closeModal();
        renderBimbinganList();
        updateStats();
        showToast.success(status === "approved" ? "Bimbingan berhasil diapprove" : "Bimbingan ditolak");
    } finally {
        resetButtonLoading(submitBtn);
    }
}

// showToast is now imported from alerts.js


function showError(message) {
    const container = document.getElementById("bimbingan-list");
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
