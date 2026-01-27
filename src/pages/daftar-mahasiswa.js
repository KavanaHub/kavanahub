// ========================================
// DAFTAR MAHASISWA PAGE (Koordinator)
// ========================================

import { koordinatorAPI } from "../api.js";
import { initPage, closeSidebar } from "../utils/pageInit.js";
import { getInitials, getTrackDisplayName } from "../utils/formatUtils.js";

// ---------- STATE ----------
let mahasiswaList = [];
let currentFilter = "all";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "daftar-mahasiswa" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const result = await koordinatorAPI.getMahasiswaList();
        if (result.ok) mahasiswaList = result.data || [];
        else mahasiswaList = getDummyData();
    } catch (err) {
        console.error(err);
        mahasiswaList = getDummyData();
    }
    renderList();
    updateStats();
}

function getDummyData() {
    return [
        { id: 1, nama: "Ahmad Fauzan", npm: "2023010001", track: "proyek1", judul_proyek: "Sistem Informasi Perpustakaan", dosen_nama: "Dr. Andi", bimbingan_count: 5, status: "active" },
        { id: 2, nama: "Siti Nurhaliza", npm: "2023010002", track: "internship1", judul_proyek: "Internship PT Teknologi", dosen_nama: "Prof. Sari", bimbingan_count: 8, status: "ready" },
        { id: 3, nama: "Budi Santoso", npm: "2023010003", track: "proyek2", judul_proyek: "E-Commerce UMKM", dosen_nama: "Dr. Budi", bimbingan_count: 3, status: "active" },
        { id: 4, nama: "Dewi Anggraini", npm: "2022010015", track: "internship2", judul_proyek: "Internship Bank Mandiri", dosen_nama: "Dr. Andi", bimbingan_count: 8, status: "ready" },
        { id: 5, nama: "Eko Prasetyo", npm: "2023010005", track: "proyek1", judul_proyek: "Aplikasi Monitoring IoT", dosen_nama: null, bimbingan_count: 0, status: "active" },
    ];
}

// ---------- RENDERING ----------
function renderList() {
    const container = document.getElementById("mahasiswa-list");
    const search = document.getElementById("search-input")?.value.toLowerCase() || "";

    let filtered = mahasiswaList.filter(m => {
        if (search && !m.nama.toLowerCase().includes(search) && !m.npm.includes(search)) return false;
        if (currentFilter === "proyek") return m.track.includes("proyek");
        if (currentFilter === "internship") return m.track.includes("internship");
        if (currentFilter === "siap") return (m.bimbingan_count || 0) >= 8 || m.status === "ready";
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white rounded-xl"><span class="material-symbols-outlined text-5xl text-slate-300">search_off</span><p class="text-text-secondary mt-2">Tidak ditemukan</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(m => renderCard(m)).join("");
}

function renderCard(m) {
    const bimbinganCount = m.bimbingan_count || 0;
    const isReady = bimbinganCount >= 8 || m.status === "ready";
    const progress = Math.min((bimbinganCount / 8) * 100, 100);

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
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full ${isProyek ? 'bg-blue-500' : 'bg-primary'} text-white flex items-center justify-center font-bold text-sm shrink-0">${displayInitials}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-text-main text-sm truncate">${displayName}</p>
                        ${isReady ? `<span class="px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">Siap Sidang</span>` : ""}
                    </div>
                    <p class="text-text-secondary text-xs">${isProyek && kelompokNama ? 'Kelompok' : m.npm} • ${getTrackDisplayName(m.track)}</p>
                    <p class="text-text-main text-xs mt-1 truncate">${m.judul_proyek || '-'}</p>
                    ${isProyek && anggotaList ? `<p class="text-text-secondary text-xs mt-1"><span class="material-symbols-outlined text-[14px] align-middle">group</span> ${anggotaList}</p>` : ''}
                </div>
            </div>
            <div class="flex flex-col sm:items-end gap-2 shrink-0">
                <div class="w-full sm:w-32">
                    <div class="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Bimbingan</span>
                        <span>${bimbinganCount}/8</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-primary" style="width: ${progress}%"></div>
                    </div>
                </div>
                <p class="text-xs ${m.dosen_nama ? "text-text-secondary" : "text-yellow-600"}">
                    ${m.dosen_nama ? `<span class="material-symbols-outlined text-[14px] align-middle">school</span> ${m.dosen_nama}` : '<span class="material-symbols-outlined text-[14px] align-middle">warning</span> Belum ada pembimbing'}
                </p>
            </div>
        </div>
    </div>`;
}

function updateStats() {
    document.getElementById("stat-total").textContent = mahasiswaList.length;
    document.getElementById("stat-proyek").textContent = mahasiswaList.filter(m => m.track.includes("proyek")).length;
    document.getElementById("stat-internship").textContent = mahasiswaList.filter(m => m.track.includes("internship")).length;
    document.getElementById("stat-siap").textContent = mahasiswaList.filter(m => (m.bimbingan_count || 0) >= 8 || m.status === "ready").length;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("search-input")?.addEventListener("input", renderList);
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderList();
        });
    });
}
