// ========================================
// JADWAL SIDANG PAGE (Koordinator)
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateShort, getInitials, getTrackDisplayName } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let mahasiswaList = [];
let sidangList = [];
let pengujiList = [];
let currentFilter = "eligible";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "jadwal-sidang" });
    if (!isAuthenticated) return;

    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const [mahasiswaResult, sidangResult, pengujiResult] = await Promise.all([
            koordinatorAPI.getAllMahasiswa(),
            koordinatorAPI.getAllSidang(),
            koordinatorAPI.getPengujiList()
        ]);

        if (mahasiswaResult.ok) mahasiswaList = mahasiswaResult.data || [];
        if (sidangResult.ok) sidangList = sidangResult.data || [];
        if (pengujiResult.ok) pengujiList = pengujiResult.data || [];

        renderList();
        updateStats();
        populatePengujiDropdown();
    } catch (err) {
        console.error("Error loading data:", err);
        // Use fallback
        mahasiswaList = [];
        sidangList = [];
        pengujiList = [];
        renderList();
        updateStats();
    }
}

// ---------- RENDERING ----------
function renderList() {
    const container = document.getElementById("sidang-list");

    if (currentFilter === "eligible") {
        renderEligibleList(container);
    } else if (currentFilter === "scheduled") {
        renderScheduledList(container, "scheduled");
    } else if (currentFilter === "completed") {
        renderScheduledList(container, "completed");
    }
}

function renderEligibleList(container) {
    // Get mahasiswa with approved laporan but not yet scheduled
    const scheduledIds = sidangList.map(s => s.mahasiswa_id);

    const eligible = mahasiswaList.filter(m => {
        // Has 8+ approved bimbingan and not yet scheduled
        const bimbinganCount = m.bimbingan_count || 0;
        return bimbinganCount >= 8 && !scheduledIds.includes(m.id);
    });

    if (eligible.length === 0) {
        container.innerHTML = renderEmptyState("Tidak ada mahasiswa yang siap sidang");
        return;
    }

    container.innerHTML = eligible.map(m => renderEligibleCard(m)).join("");
}

function renderScheduledList(container, status) {
    const filtered = sidangList.filter(s => {
        if (status === "scheduled") return !s.status || s.status === "scheduled";
        if (status === "completed") return s.status === "lulus" || s.status === "tidak_lulus";
        return true;
    });

    if (filtered.length === 0) {
        const msg = status === "scheduled" ? "Tidak ada sidang terjadwal" : "Belum ada sidang selesai";
        container.innerHTML = renderEmptyState(msg);
        return;
    }

    container.innerHTML = filtered.map(s => renderSidangCard(s)).join("");
}

function renderEmptyState(message) {
    return `
    <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
      <span class="material-symbols-outlined text-5xl text-slate-300">inbox</span>
      <h3 class="text-lg font-bold text-text-main mt-4">${message}</h3>
      <p class="text-text-secondary text-sm mt-1">Data akan muncul di sini</p>
    </div>
  `;
}

function renderEligibleCard(m) {
    return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            ${getInitials(m.nama)}
          </div>
          <div>
            <p class="font-semibold text-text-main text-sm lg:text-base">${m.nama}</p>
            <p class="text-text-secondary text-xs">${m.npm} • ${getTrackDisplayName(m.track)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            ✅ ${m.bimbingan_count || 0}/8 Bimbingan
          </span>
          <button onclick="openScheduleModal(${m.id}, '${m.nama}')" 
                  class="px-4 py-2 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">event</span>
            Jadwalkan
          </button>
        </div>
      </div>
      ${m.judul_proyek ? `
      <div class="mt-3 p-3 bg-slate-50 rounded-lg">
        <p class="text-xs text-text-secondary mb-1">Judul Proyek:</p>
        <p class="text-sm text-text-main font-medium">${m.judul_proyek}</p>
      </div>
      ` : ""}
    </div>
  `;
}

function renderSidangCard(s) {
    const statusConfig = getStatusConfig(s.status);

    return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${getInitials(s.mahasiswa_nama)}
            </div>
            <div>
              <p class="font-semibold text-text-main text-sm lg:text-base">${s.mahasiswa_nama}</p>
              <p class="text-text-secondary text-xs">${s.npm}</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badgeClass}">
            ${statusConfig.icon} ${statusConfig.text}
          </span>
        </div>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div class="bg-slate-50 p-2 rounded-lg">
            <p class="text-text-secondary">Tanggal</p>
            <p class="font-semibold text-text-main">${formatDateShort(s.tanggal)}</p>
          </div>
          <div class="bg-slate-50 p-2 rounded-lg">
            <p class="text-text-secondary">Waktu</p>
            <p class="font-semibold text-text-main">${s.waktu || '-'}</p>
          </div>
          <div class="bg-slate-50 p-2 rounded-lg">
            <p class="text-text-secondary">Ruangan</p>
            <p class="font-semibold text-text-main">${s.ruangan || '-'}</p>
          </div>
          <div class="bg-slate-50 p-2 rounded-lg">
            <p class="text-text-secondary">Penguji</p>
            <p class="font-semibold text-text-main">${s.penguji_nama || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStatusConfig(status) {
    const configs = {
        scheduled: { text: "Terjadwal", icon: "📅", badgeClass: "bg-blue-100 text-blue-700" },
        lulus: { text: "Lulus", icon: "✅", badgeClass: "bg-green-100 text-green-700" },
        tidak_lulus: { text: "Tidak Lulus", icon: "❌", badgeClass: "bg-red-100 text-red-700" },
    };
    return configs[status] || configs.scheduled;
}

function updateStats() {
    const scheduledIds = sidangList.map(s => s.mahasiswa_id);

    const eligible = mahasiswaList.filter(m => {
        const bimbinganCount = m.bimbingan_count || 0;
        return bimbinganCount >= 8 && !scheduledIds.includes(m.id);
    }).length;

    const scheduled = sidangList.filter(s => !s.status || s.status === "scheduled").length;
    const completed = sidangList.filter(s => s.status === "lulus" || s.status === "tidak_lulus").length;

    document.getElementById("stat-eligible").textContent = eligible;
    document.getElementById("stat-scheduled").textContent = scheduled;
    document.getElementById("stat-completed").textContent = completed;
    document.getElementById("stat-total").textContent = sidangList.length;
}

function populatePengujiDropdown() {
    const select = document.getElementById("penguji-id");
    select.innerHTML = '<option value="">Pilih Penguji</option>';

    pengujiList.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nama}</option>`;
    });
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderList();
        });
    });

    // Modal
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("btn-cancel")?.addEventListener("click", closeModal);
    document.getElementById("schedule-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "schedule-modal") closeModal();
    });
    document.getElementById("schedule-form")?.addEventListener("submit", handleSchedule);
}

// ---------- MODAL ----------
window.openScheduleModal = function (mahasiswaId, nama) {
    document.getElementById("mahasiswa-id").value = mahasiswaId;
    document.getElementById("mahasiswa-nama").textContent = nama;

    // Reset form
    document.getElementById("tanggal").value = "";
    document.getElementById("waktu").value = "";
    document.getElementById("ruangan").value = "";
    document.getElementById("penguji-id").value = "";

    const modal = document.getElementById("schedule-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
};

function closeModal() {
    const modal = document.getElementById("schedule-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
}

async function handleSchedule(e) {
    e.preventDefault();

    const mahasiswa_id = parseInt(document.getElementById("mahasiswa-id").value);
    const tanggal = document.getElementById("tanggal").value;
    const waktu = document.getElementById("waktu").value;
    const ruangan = document.getElementById("ruangan").value;
    const penguji_id = parseInt(document.getElementById("penguji-id").value);

    if (!mahasiswa_id || !tanggal || !waktu || !ruangan || !penguji_id) {
        showToast.error("Semua field wajib diisi");
        return;
    }

    const submitBtn = document.getElementById("btn-submit");
    setButtonLoading(submitBtn, "Menjadwalkan...");

    try {
        const result = await koordinatorAPI.scheduleSidang({
            mahasiswa_id,
            tanggal,
            waktu,
            ruangan,
            penguji_id
        });

        if (result.ok) {
            closeModal();
            showToast.success("Sidang berhasil dijadwalkan!");
            await loadData();
        } else {
            showModal.error("Gagal", result.error || "Terjadi kesalahan");
        }
    } catch (err) {
        console.error("Schedule error:", err);
        showModal.error("Error", "Terjadi kesalahan saat menjadwalkan sidang");
    } finally {
        resetButtonLoading(submitBtn);
    }
}
