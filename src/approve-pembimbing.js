// ========================================
// APPROVE PEMBIMBING PAGE (Koordinator)
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { getInitials, getTrackDisplayName } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let mahasiswaList = [];
let dosenList = [];
let pollingInterval = null;
const POLLING_DELAY = 10000; // 10 seconds

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "approve-pembimbing" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();

    // Start polling for realtime updates
    startPolling();

    // Stop polling when page is hidden, resume when visible
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopPolling();
        } else {
            startPolling();
        }
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", stopPolling);
});

// ---------- POLLING ----------
function startPolling() {
    if (pollingInterval) return; // Already polling
    pollingInterval = setInterval(async () => {
        await loadData(true); // silent refresh
    }, POLLING_DELAY);
    console.log("[Realtime] Polling started");
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log("[Realtime] Polling stopped");
    }
}

// ---------- DATA LOADING ----------
async function loadData(silent = false) {
    try {
        const [mahasiswaResult, dosenResult] = await Promise.all([
            koordinatorAPI.getMahasiswaList(),
            koordinatorAPI.getDosenList(),
        ]);
        if (mahasiswaResult.ok) mahasiswaList = mahasiswaResult.data || [];
        if (dosenResult.ok) dosenList = dosenResult.data || [];
    } catch (err) {
        console.error(err);
        if (!silent) {
            mahasiswaList = getDummyMahasiswa();
            dosenList = getDummyDosen();
        }
        return; // Don't update UI on error during polling
    }
    renderList();
    updateStats();
    if (!silent) populateDosenDropdown();
}

function getDummyMahasiswa() {
    return [
        { id: 1, nama: "Ahmad Fauzan", npm: "2023010001", track: "proyek1", judul_proyek: "Sistem Informasi Perpustakaan", dosen_id: null, dosen_nama: null },
        { id: 2, nama: "Siti Nurhaliza", npm: "2023010002", track: "internship1", judul_proyek: "Internship PT Teknologi", dosen_id: null, dosen_nama: null },
        { id: 3, nama: "Budi Santoso", npm: "2023010003", track: "proyek2", judul_proyek: "E-Commerce UMKM", dosen_id: 1, dosen_nama: "Dr. Andi Wijaya" },
    ];
}

function getDummyDosen() {
    return [
        { id: 1, nama: "Dr. Andi Wijaya", mahasiswa_count: 3 },
        { id: 2, nama: "Prof. Sari Mutiara", mahasiswa_count: 2 },
        { id: 3, nama: "Dr. Budi Hartono", mahasiswa_count: 4 },
    ];
}

// ---------- RENDERING ----------
function renderList() {
    const container = document.getElementById("mahasiswa-list");
    const needAssign = mahasiswaList.filter(m => !m.dosen_id);

    if (needAssign.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-5xl text-green-300">check_circle</span>
            <h3 class="text-lg font-bold text-text-main mt-4">Semua mahasiswa sudah ada pembimbing</h3>
        </div>`;
        return;
    }

    container.innerHTML = needAssign.map(m => {
        const isProyek = m.track && m.track.includes('proyek');
        const kelompokNama = m.kelompok_nama || m.nama_kelompok || null;
        const anggota = m.anggota || [];

        // Display kelompok name for proyek, individual name for internship
        const displayName = isProyek && kelompokNama ? kelompokNama : m.nama;
        const displayInitials = isProyek && kelompokNama ? 'K' : getInitials(m.nama);

        // Build anggota list
        const anggotaList = anggota.length > 0
            ? anggota.map(a => `${a.nama} (${a.npm})`).join(', ')
            : (isProyek ? `${m.nama} (${m.npm || '-'})` : '');

        return `
        <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 rounded-full ${isProyek ? 'bg-blue-500' : 'bg-primary'} text-white flex items-center justify-center font-bold text-sm">${displayInitials}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-text-main text-sm lg:text-base truncate">${displayName}</p>
                        <p class="text-text-secondary text-xs">${isProyek && kelompokNama ? 'Kelompok' : m.npm} • ${getTrackDisplayName(m.track)}</p>
                        <p class="text-text-main text-xs mt-1 truncate">${m.judul_proyek || '-'}</p>
                        ${isProyek && anggotaList ? `<p class="text-text-secondary text-xs mt-1"><span class="material-symbols-outlined text-[14px] align-middle">group</span> ${anggotaList}</p>` : ''}
                        ${m.usulan_dosen_nama ? `<p class="text-primary text-xs mt-1">📋 Diusulkan: <span class="font-medium">${m.usulan_dosen_nama}</span></p>` : ''}
                    </div>
                </div>
                <button onclick="openAssignModal(${m.id})" class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors shrink-0">
                    <span class="material-symbols-outlined text-[16px] align-middle mr-1">how_to_reg</span>Assign Pembimbing
                </button>
            </div>
        </div>
    `;
    }).join("");
}

function updateStats() {
    const pending = mahasiswaList.filter(m => !m.dosen_id).length;
    const assigned = mahasiswaList.filter(m => m.dosen_id).length;
    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-assigned").textContent = assigned;
}

function populateDosenDropdown() {
    const select = document.getElementById("dosen-select");
    select.innerHTML = '<option value="">-- Pilih Dosen --</option>';
    dosenList.forEach(d => {
        select.innerHTML += `<option value="${d.id}">${d.nama} (${d.mahasiswa_count} mahasiswa)</option>`;
    });
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("btn-cancel")?.addEventListener("click", closeModal);
    document.getElementById("assign-modal")?.addEventListener("click", e => { if (e.target.id === "assign-modal") closeModal(); });
    document.getElementById("assign-form")?.addEventListener("submit", handleAssign);
}

// ---------- MODAL ----------
window.openAssignModal = function (id) {
    const m = mahasiswaList.find(x => x.id === id);
    if (!m) return;
    document.getElementById("mahasiswa-id").value = id;
    document.getElementById("modal-desc").textContent = `Tetapkan dosen pembimbing untuk ${m.nama} (${m.npm})`;
    document.getElementById("dosen-select").value = "";
    document.getElementById("assign-modal").classList.remove("hidden");
    document.getElementById("assign-modal").classList.add("flex");
    document.body.style.overflow = "hidden";
};

function closeModal() {
    document.getElementById("assign-modal").classList.add("hidden");
    document.getElementById("assign-modal").classList.remove("flex");
    document.body.style.overflow = "";
}

async function handleAssign(e) {
    e.preventDefault();
    const mahasiswaId = parseInt(document.getElementById("mahasiswa-id").value);
    const dosenId = parseInt(document.getElementById("dosen-select").value);
    if (!dosenId) { showToast.warning("Pilih dosen pembimbing"); return; }

    const btn = document.getElementById("btn-submit");
    setButtonLoading(btn, "Menetapkan...");

    try {
        const result = await koordinatorAPI.assignDosen(mahasiswaId, dosenId);
        if (result.ok) {
            updateLocal(mahasiswaId, dosenId);
        } else {
            showModal.error("Gagal", result.error || "Gagal menetapkan pembimbing");
        }
    } catch (err) {
        console.error(err);
        updateLocal(mahasiswaId, dosenId);
    } finally {
        resetButtonLoading(btn);
    }
}

function updateLocal(mahasiswaId, dosenId) {
    const m = mahasiswaList.find(x => x.id === mahasiswaId);
    const d = dosenList.find(x => x.id === dosenId);
    if (m && d) {
        m.dosen_id = d.id;  // This is what the filter checks
        m.dosen_nama = d.nama;
        d.mahasiswa_count++;
    }
    closeModal();
    renderList();
    updateStats();
    showToast.success("Pembimbing berhasil ditetapkan");
}

// showToast is now imported from alerts.js
