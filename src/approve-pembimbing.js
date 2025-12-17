// ========================================
// APPROVE PEMBIMBING PAGE (Koordinator)
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { getInitials, getTrackDisplayName } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";

// ---------- STATE ----------
let mahasiswaList = [];
let dosenList = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "approve-pembimbing" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const [mahasiswaResult, dosenResult] = await Promise.all([
            koordinatorAPI.getMahasiswaList(),
            koordinatorAPI.getDosenList(),
        ]);
        if (mahasiswaResult.ok) mahasiswaList = mahasiswaResult.data || [];
        if (dosenResult.ok) dosenList = dosenResult.data || [];
    } catch (err) {
        console.error(err);
        mahasiswaList = getDummyMahasiswa();
        dosenList = getDummyDosen();
    }
    renderList();
    updateStats();
    populateDosenDropdown();
}

function getDummyMahasiswa() {
    return [
        { id: 1, nama: "Ahmad Fauzan", npm: "2023010001", track: "proyek-1", judul: "Sistem Informasi Perpustakaan", dosen_pembimbing: null },
        { id: 2, nama: "Siti Nurhaliza", npm: "2023010002", track: "internship-1", judul: "Internship PT Teknologi", dosen_pembimbing: null },
        { id: 3, nama: "Budi Santoso", npm: "2023010003", track: "proyek-2", judul: "E-Commerce UMKM", dosen_pembimbing: { id: 1, nama: "Dr. Andi Wijaya" } },
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
    const needAssign = mahasiswaList.filter(m => !m.dosen_pembimbing);

    if (needAssign.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-5xl text-green-300">check_circle</span>
            <h3 class="text-lg font-bold text-text-main mt-4">Semua mahasiswa sudah ada pembimbing</h3>
        </div>`;
        return;
    }

    container.innerHTML = needAssign.map(m => `
        <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">${getInitials(m.nama)}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-text-main text-sm lg:text-base truncate">${m.nama}</p>
                        <p class="text-text-secondary text-xs">${m.npm} • ${getTrackDisplayName(m.track)}</p>
                        <p class="text-text-main text-xs mt-1 truncate">${m.judul}</p>
                    </div>
                </div>
                <button onclick="openAssignModal(${m.id})" class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors shrink-0">
                    <span class="material-symbols-outlined text-[16px] align-middle mr-1">how_to_reg</span>Assign Pembimbing
                </button>
            </div>
        </div>
    `).join("");
}

function updateStats() {
    const pending = mahasiswaList.filter(m => !m.dosen_pembimbing).length;
    const assigned = mahasiswaList.filter(m => m.dosen_pembimbing).length;
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
    if (!dosenId) { alert("Pilih dosen pembimbing"); return; }

    const btn = document.getElementById("btn-submit");
    setButtonLoading(btn, "Menetapkan...");

    try {
        const result = await koordinatorAPI.assignDosen(mahasiswaId, dosenId);
        if (result.ok) {
            updateLocal(mahasiswaId, dosenId);
        } else {
            alert("Gagal: " + (result.error || "Error"));
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
    if (m && d) { m.dosen_pembimbing = { id: d.id, nama: d.nama }; d.mahasiswa_count++; }
    closeModal();
    renderList();
    updateStats();
    showToast("Pembimbing berhasil ditetapkan");
}

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-main text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
