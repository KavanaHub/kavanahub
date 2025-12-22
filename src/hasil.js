// ========================================
// HASIL SIDANG PAGE (Clean Code Refactored)
// Fokus pada hasil sidang tanpa nilai
// ========================================

import { mahasiswaAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateFull, getStatusDisplay, getInitials } from "./utils/formatUtils.js";

// ---------- STATE ----------
let profileData = null;
let bimbinganData = [];
let laporanData = [];
let sidangData = null;

// ---------- HASIL PAGE INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize page with sidebar
    const { isAuthenticated } = initPage({ activeMenu: "nilai" });
    if (!isAuthenticated) return;

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    // Load data
    await loadDataFromAPI();
    loadStatus();
    loadSummary();
    loadPembimbingInfo();
});

// ---------- DATA LOADING ----------
async function loadDataFromAPI() {
    try {
        const [profileResult, bimbinganResult, laporanResult, sidangResult] = await Promise.all([
            mahasiswaAPI.getProfile(),
            mahasiswaAPI.getMyBimbingan(),
            mahasiswaAPI.getMyLaporan(),
            mahasiswaAPI.getMySidang()
        ]);

        if (profileResult.ok) profileData = profileResult.data;
        if (bimbinganResult.ok) bimbinganData = bimbinganResult.data || [];
        if (laporanResult.ok) laporanData = laporanResult.data || [];
        if (sidangResult.ok) sidangData = sidangResult.data?.[0] || null; // Get first sidang
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

// ---------- STATUS DISPLAY ----------
function loadStatus() {
    const statusCard = document.getElementById("status-card");
    const statusBadge = document.getElementById("status-badge");
    const statusTitle = document.getElementById("status-title");
    const statusDesc = document.getElementById("status-desc");
    const statusIcon = document.getElementById("status-icon");

    if (!profileData) {
        renderErrorStatus({ statusBadge, statusTitle, statusDesc, statusIcon });
        return;
    }

    const state = calculateState();
    const statusConfig = getStatusConfig(state);

    // Apply status configuration
    statusCard.className = statusConfig.cardClass;
    statusBadge.textContent = statusConfig.badge;
    statusIcon.textContent = statusConfig.icon;
    statusTitle.textContent = statusConfig.title;
    statusDesc.textContent = statusConfig.desc;

    // Show result section if sidang completed
    if (state.sidangStatus === "completed" || state.sidangStatus === "lulus" || state.sidangStatus === "tidak_lulus") {
        showSidangResult(state.sidangStatus);
    }
}

function calculateState() {
    // Get laporan status from API data
    const latestLaporan = laporanData.length > 0 ? laporanData[0] : null;
    const hasLaporan = latestLaporan && (latestLaporan.status === 'pending' || latestLaporan.status === 'submitted' || latestLaporan.status === 'approved');
    const laporanStatus = latestLaporan?.status || null;

    // Get sidang status from API data
    const sidangStatus = sidangData?.status || null;
    const jadwalSidang = sidangData?.tanggal ? `${sidangData.tanggal} ${sidangData.waktu || ''}` : null;

    return {
        proposalStatus: profileData?.status_proposal,
        approvedBimbingan: bimbinganData.filter((b) => b.status === "approved").length,
        hasLaporan: hasLaporan,
        laporanStatus: laporanStatus,
        sidangStatus: sidangStatus,
        jadwalSidang: jadwalSidang,
    };
}

function getStatusConfig(state) {
    const configs = {
        lulus: {
            cardClass: "bg-gradient-to-r from-green-500 to-green-600 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "LULUS",
            icon: "celebration",
            title: "Selamat! Sidang Berhasil",
            desc: "Anda telah menyelesaikan sidang proyek/internship",
        },
        tidak_lulus: {
            cardClass: "bg-gradient-to-r from-red-500 to-red-600 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "TIDAK LULUS",
            icon: "sentiment_dissatisfied",
            title: "Sidang Tidak Lulus",
            desc: "Silakan konsultasi dengan pembimbing untuk langkah selanjutnya",
        },
        scheduled: {
            cardClass: "bg-gradient-to-r from-blue-500 to-blue-600 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "TERJADWAL",
            icon: "event",
            title: "Sidang Terjadwal",
            desc: state.jadwalSidang ? `Jadwal: ${formatDateFull(state.jadwalSidang)}` : "Persiapkan diri untuk sidang",
        },
    };

    // Determine which config to use
    if (state.sidangStatus === "completed" || state.sidangStatus === "lulus") return configs.lulus;
    if (state.sidangStatus === "tidak_lulus") return configs.tidak_lulus;
    if (state.sidangStatus === "scheduled") return configs.scheduled;

    if (state.proposalStatus === "pending" || !state.proposalStatus) {
        return {
            cardClass: "bg-gradient-to-r from-slate-500 to-slate-600 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "BELUM MULAI",
            icon: "hourglass_empty",
            title: "Proposal Belum Disetujui",
            desc: "Silakan upload proposal dan tunggu persetujuan",
        };
    }

    if (state.proposalStatus === "rejected") {
        return {
            cardClass: "bg-gradient-to-r from-red-400 to-red-500 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "DITOLAK",
            icon: "cancel",
            title: "Proposal Ditolak",
            desc: "Silakan revisi dan submit ulang proposal",
        };
    }

    if (state.approvedBimbingan < 8) {
        return {
            cardClass: "bg-gradient-to-r from-yellow-500 to-orange-500 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "DALAM PROSES",
            icon: "pending",
            title: "Bimbingan Berlangsung",
            desc: `Progress bimbingan: ${state.approvedBimbingan}/8 sesi disetujui`,
        };
    }

    if (!state.hasLaporan) {
        return {
            cardClass: "bg-gradient-to-r from-teal-500 to-teal-600 p-6 lg:p-8 rounded-xl shadow-lg text-white",
            badge: "SIAP SIDANG",
            icon: "task_alt",
            title: "Bimbingan Selesai",
            desc: "Silakan upload laporan sidang untuk melanjutkan",
        };
    }

    return {
        cardClass: "bg-gradient-to-r from-primary to-primary/70 p-6 lg:p-8 rounded-xl shadow-lg text-white",
        badge: "MENUNGGU",
        icon: "schedule",
        title: "Laporan Submitted",
        desc: "Menunggu jadwal sidang dari koordinator",
    };
}

function renderErrorStatus(elements) {
    elements.statusBadge.textContent = "Error";
    elements.statusTitle.textContent = "Gagal Memuat Data";
    elements.statusDesc.textContent = "Silakan refresh halaman";
    elements.statusIcon.textContent = "error";
}

// ---------- SIDANG RESULT ----------
function showSidangResult(result) {
    const resultSection = document.getElementById("sidang-result-section");
    const resultContent = document.getElementById("sidang-result-content");

    resultSection.classList.remove("hidden");

    const isLulus = result === "completed" || result === "lulus";
    resultContent.innerHTML = isLulus ? renderLulusResult() : renderTidakLulusResult();
}

function renderLulusResult() {
    return `
    <div class="flex flex-col items-center gap-4">
      <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl lg:text-5xl icon-fill">verified</span>
      </div>
      <div>
        <h4 class="text-xl lg:text-2xl font-bold text-green-600">LULUS</h4>
        <p class="text-text-secondary text-sm lg:text-base mt-1">Selamat atas kelulusannya!</p>
      </div>
      ${profileData?.tanggal_sidang ? `<p class="text-text-secondary text-xs lg:text-sm">Tanggal Sidang: ${formatDateFull(profileData.tanggal_sidang)}</p>` : ""}
      <div class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 max-w-md">
        <p class="text-green-700 text-sm">
          <span class="font-semibold">Langkah Selanjutnya:</span><br>
          Silakan hubungi bagian akademik untuk proses administrasi kelulusan.
        </p>
      </div>
    </div>
  `;
}

function renderTidakLulusResult() {
    return `
    <div class="flex flex-col items-center gap-4">
      <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl lg:text-5xl">cancel</span>
      </div>
      <div>
        <h4 class="text-xl lg:text-2xl font-bold text-red-600">TIDAK LULUS</h4>
        <p class="text-text-secondary text-sm lg:text-base mt-1">Jangan menyerah, coba lagi!</p>
      </div>
      <div class="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 max-w-md">
        <p class="text-red-700 text-sm">
          <span class="font-semibold">Langkah Selanjutnya:</span><br>
          Konsultasikan dengan dosen pembimbing untuk mengetahui bagian yang perlu diperbaiki.
        </p>
      </div>
    </div>
  `;
}

// ---------- SUMMARY CARDS ----------
function loadSummary() {
    const state = calculateState();

    updateSummaryCard("summary-proposal", "proposal-status", getProposalSummary(state));
    updateSummaryCard("summary-bimbingan", "bimbingan-status", getBimbinganSummary(state));
    updateSummaryCard("summary-laporan", "laporan-status", getLaporanSummary(state));
    updateSummaryCard("summary-sidang", "sidang-status", getSidangSummary(state));
}

function updateSummaryCard(cardId, statusId, config) {
    const card = document.getElementById(cardId);
    const status = document.getElementById(statusId);

    if (!card || !status) return;

    status.innerHTML = config.text;

    if (config.color) {
        const iconDiv = card.querySelector("div:first-child");
        iconDiv.className = `w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-${config.color}-100 text-${config.color}-600 flex items-center justify-center`;
        card.classList.remove("bg-slate-50", "border-slate-100");
        card.classList.add(`bg-${config.color}-50`, `border-${config.color}-200`);
    }
}

function getProposalSummary(state) {
    if (state.proposalStatus === "approved") return { text: "Disetujui ✓", color: "green" };
    if (profileData?.judul_proyek) return { text: "Menunggu Review", color: "yellow" };
    return { text: '<a href="/proposal.html" class="text-primary hover:underline">Upload</a>', color: null };
}

function getBimbinganSummary(state) {
    if (state.approvedBimbingan >= 8) return { text: "8/8 ✓", color: "green" };
    if (state.approvedBimbingan > 0) return { text: `${state.approvedBimbingan}/8 Sesi`, color: "yellow" };
    return { text: "0 / 8 Sesi", color: null };
}

function getLaporanSummary(state) {
    if (state.hasLaporan) return { text: "Disubmit ✓", color: "green" };
    if (state.approvedBimbingan >= 8)
        return { text: '<a href="/laporan.html" class="text-primary hover:underline">Upload</a>', color: null };
    return { text: "Tunggu bimbingan", color: null };
}

function getSidangSummary(state) {
    if (state.sidangStatus === "completed" || state.sidangStatus === "lulus") return { text: "Selesai ✓", color: "green" };
    if (state.sidangStatus === "scheduled") return { text: "Terjadwal", color: "blue" };
    return { text: "Belum dijadwalkan", color: null };
}

// ---------- PEMBIMBING INFO ----------
function loadPembimbingInfo() {
    const container = document.getElementById("pembimbing-card");
    if (!container) return;

    if (!profileData?.dosen_id) {
        container.innerHTML = renderNoPembimbing();
        return;
    }

    const dosenNama = profileData.dosen_nama || "Dosen Pembimbing";
    const dosenWa = profileData.dosen_no_wa || "";

    container.innerHTML = renderPembimbingCard(dosenNama, dosenWa);
}

function renderNoPembimbing() {
    return `
    <div class="text-center py-4">
      <span class="material-symbols-outlined text-3xl text-slate-300">person_off</span>
      <p class="text-text-secondary text-sm mt-2">Belum ada pembimbing yang ditentukan</p>
    </div>
  `;
}

function renderPembimbingCard(nama, wa) {
    return `
    <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
      <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg lg:text-xl shrink-0">
        ${getInitials(nama)}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-text-main text-sm lg:text-base truncate">${nama}</p>
        <p class="text-text-secondary text-xs lg:text-sm">Dosen Pembimbing</p>
        ${wa
            ? `
        <a href="https://wa.me/${wa.replace(/[^0-9]/g, "")}" target="_blank" 
           class="inline-flex items-center gap-1 mt-2 text-green-600 hover:text-green-700 text-xs lg:text-sm">
          <span class="material-symbols-outlined text-[16px]">chat</span>
          WhatsApp: ${wa}
        </a>
        `
            : ""
        }
      </div>
    </div>
  `;
}
