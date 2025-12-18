// ========================================
// KELOLA PERIODE - Koordinator
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";

// ---------- STATE ----------
let allPeriodes = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "kelola-periode" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const result = await koordinatorAPI.getJadwalList();
        if (result.ok) {
            allPeriodes = result.data || [];
        } else {
            allPeriodes = getDummyData();
        }
    } catch (err) {
        console.error(err);
        allPeriodes = getDummyData();
    }
    renderPeriodes();
}

function getDummyData() {
    return [
        { id: 1, nama: "Proyek 1 Semester Ganjil 2024", tipe: "proyek", semester: 2, start_date: "2024-09-01", end_date: "2025-01-31", status: "active" },
        { id: 2, nama: "Internship 1 Semester Ganjil 2024", tipe: "internship", semester: 7, start_date: "2024-09-01", end_date: "2025-01-31", status: "active" },
        { id: 3, nama: "Proyek 3 Semester Genap 2023", tipe: "proyek", semester: 5, start_date: "2024-02-01", end_date: "2024-06-30", status: "completed" },
    ];
}

// ---------- RENDERING ----------
function renderPeriodes() {
    const activePeriodes = allPeriodes.filter(p => p.status === 'active');
    const completedPeriodes = allPeriodes.filter(p => p.status === 'completed');

    // Active periods
    const activeContainer = document.getElementById("active-periods");
    if (activePeriodes.length === 0) {
        activeContainer.innerHTML = `
            <div class="text-center py-8 text-text-secondary">
                <span class="material-symbols-outlined text-4xl mb-2">event_busy</span>
                <p>Belum ada periode aktif</p>
                <p class="text-xs mt-1">Klik "Mulai Periode Baru" untuk membuat periode</p>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activePeriodes.map(p => renderPeriodeCard(p, true)).join('');
    }

    // Completed periods
    const allContainer = document.getElementById("all-periods");
    if (completedPeriodes.length === 0) {
        allContainer.innerHTML = `
            <div class="text-center py-6 text-text-secondary">
                <span class="material-symbols-outlined text-3xl mb-2">history</span>
                <p class="text-sm">Belum ada riwayat periode</p>
            </div>
        `;
    } else {
        allContainer.innerHTML = completedPeriodes.map(p => renderPeriodeCard(p, false)).join('');
    }
}

function renderPeriodeCard(p, isActive) {
    const semesterLabels = {
        2: "Semester 2 (Proyek 1)",
        3: "Semester 3 (Proyek 2)",
        5: "Semester 5 (Proyek 3)",
        7: "Semester 7 (Internship 1)",
        8: "Semester 8 (Internship 2)"
    };

    const tipeColor = p.tipe === 'proyek' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    const statusColor = isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';

    return `
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 text-xs font-medium rounded ${tipeColor}">${p.tipe === 'proyek' ? 'Proyek' : 'Internship'}</span>
                        <span class="px-2 py-0.5 text-xs font-medium rounded ${statusColor}">${isActive ? 'Aktif' : 'Selesai'}</span>
                    </div>
                    <p class="font-semibold text-text-main">${p.nama}</p>
                    <p class="text-xs text-text-secondary mt-1">${semesterLabels[p.semester] || `Semester ${p.semester}`}</p>
                    <p class="text-xs text-text-secondary">${formatDate(p.start_date)} - ${formatDate(p.end_date)}</p>
                </div>
                ${isActive ? `
                    <button onclick="completePeriode(${p.id})" class="px-3 py-2 text-xs font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">stop_circle</span>
                        Akhiri
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("btn-new-periode").addEventListener("click", () => {
        document.getElementById("modal-create").classList.remove("hidden");
        // Set default dates
        const today = new Date();
        document.getElementById("input-start").value = today.toISOString().split('T')[0];
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 4);
        document.getElementById("input-end").value = endDate.toISOString().split('T')[0];
    });

    document.getElementById("btn-cancel").addEventListener("click", closeModal);
    document.getElementById("modal-create").addEventListener("click", (e) => {
        if (e.target.id === "modal-create") closeModal();
    });

    document.getElementById("form-create").addEventListener("submit", handleCreatePeriode);
}

function closeModal() {
    document.getElementById("modal-create").classList.add("hidden");
    document.getElementById("form-create").reset();
}

async function handleCreatePeriode(e) {
    e.preventDefault();

    const nama = document.getElementById("input-nama").value.trim();
    const tipe = document.getElementById("input-tipe").value;
    const semester = parseInt(document.getElementById("input-semester").value);
    const start_date = document.getElementById("input-start").value;
    const end_date = document.getElementById("input-end").value;
    const deskripsi = document.getElementById("input-deskripsi").value.trim();

    if (!nama || !start_date || !end_date) {
        alert("Nama, tanggal mulai, dan tanggal selesai wajib diisi");
        return;
    }

    const btn = document.getElementById("btn-submit");
    setButtonLoading(btn, "Menyimpan...");

    try {
        const result = await koordinatorAPI.createJadwal({
            nama, tipe, semester, start_date, end_date, deskripsi
        });
        if (result.ok) {
            showToast("Periode berhasil dibuat!");
            closeModal();
            await loadData();
        } else {
            alert("Gagal: " + (result.error || "Error"));
        }
    } catch (err) {
        console.error(err);
        // Demo: simulate success
        showToast("Periode berhasil dibuat!");
        closeModal();
        allPeriodes.unshift({
            id: Date.now(),
            nama, tipe, semester, start_date, end_date, deskripsi,
            status: 'active'
        });
        renderPeriodes();
    } finally {
        resetButtonLoading(btn);
    }
}

window.completePeriode = async function (id) {
    if (!confirm("Yakin ingin mengakhiri periode ini? Data bimbingan akan direset.")) return;

    try {
        const result = await koordinatorAPI.completeJadwal(id);
        if (result.ok) {
            showToast("Periode berhasil diakhiri");
            await loadData();
        } else {
            alert("Gagal: " + (result.error || "Error"));
        }
    } catch (err) {
        console.error(err);
        // Demo: simulate
        showToast("Periode berhasil diakhiri");
        const idx = allPeriodes.findIndex(p => p.id === id);
        if (idx !== -1) {
            allPeriodes[idx].status = 'completed';
            renderPeriodes();
        }
    }
};

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-main text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
