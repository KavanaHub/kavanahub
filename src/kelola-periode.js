// ========================================
// KELOLA PERIODE - Koordinator
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal, showLoading, animate, animateList } from "./utils/alerts.js";

// ---------- STATE ----------
let allPeriodes = [];
let assignedSemester = null;
let assignedSemesterLabel = null;

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "kelola-periode" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    // Load assigned semester first
    await loadAssignedSemester();
    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadAssignedSemester() {
    try {
        const result = await koordinatorAPI.getMySemester();
        if (result.ok && result.data.assigned) {
            assignedSemester = result.data.semester;
            assignedSemesterLabel = result.data.semester_label;

            // Show info banner
            const header = document.querySelector('header');
            if (header) {
                const banner = document.createElement('div');
                banner.className = 'mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2';
                banner.innerHTML = `
                    <span class="material-symbols-outlined text-green-600">verified</span>
                    <span class="text-sm text-green-700">Anda di-assign untuk <strong>${assignedSemesterLabel}</strong></span>
                `;
                header.after(banner);
            }
        } else {
            // No assignment, show warning
            const header = document.querySelector('header');
            if (header) {
                const banner = document.createElement('div');
                banner.className = 'mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2';
                banner.innerHTML = `
                    <span class="material-symbols-outlined text-yellow-600">warning</span>
                    <span class="text-sm text-yellow-700">Anda belum di-assign ke semester manapun. Hubungi Kaprodi untuk assignment.</span>
                `;
                header.after(banner);
            }
        }
    } catch (err) {
        console.error('Could not load assigned semester:', err);
        // Demo mode - assume semester 2
        assignedSemester = 2;
        assignedSemesterLabel = 'Proyek 1 (Semester 2)';
    }
}

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

        // Auto-fill semester if assigned
        if (assignedSemester) {
            const semesterSelect = document.getElementById("input-semester");
            semesterSelect.value = assignedSemester;
            semesterSelect.disabled = true; // Koordinator tidak bisa pilih semester lain

            // Auto-set tipe based on semester
            const tipeSelect = document.getElementById("input-tipe");
            if (assignedSemester >= 7) {
                tipeSelect.value = 'internship';
            } else {
                tipeSelect.value = 'proyek';
            }
        }
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
        showToast.warning("Nama, tanggal mulai, dan tanggal selesai wajib diisi");
        return;
    }

    const btn = document.getElementById("btn-submit");
    setButtonLoading(btn, "Menyimpan...");

    try {
        const result = await koordinatorAPI.createJadwal({
            nama, tipe, semester, start_date, end_date, deskripsi
        });
        if (result.ok) {
            showToast.success("Periode berhasil dibuat!");
            closeModal();
            await loadData();
            // Animate the new period card
            setTimeout(() => {
                const firstCard = document.querySelector('#active-periods .card');
                if (firstCard) animate.bounceIn(firstCard);
            }, 100);
        } else {
            showModal.error("Gagal Membuat Periode", result.error || "Terjadi kesalahan saat membuat periode");
        }
    } catch (err) {
        console.error(err);
        // Demo: simulate success
        showToast.success("Periode berhasil dibuat!");
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
    const confirmed = await showModal.confirmDelete(
        "Akhiri Periode?",
        "Yakin ingin mengakhiri periode ini? Role koordinator akan dihapus setelah periode diakhiri."
    );
    if (!confirmed) return;

    showLoading.start("Mengakhiri periode...");

    try {
        const result = await koordinatorAPI.completeJadwal(id);
        showLoading.stop();
        if (result.ok) {
            await showModal.success("Periode Diakhiri", result.message || "Periode berhasil diakhiri");
            await loadData();
        } else {
            showModal.error("Gagal", result.error || "Terjadi kesalahan");
        }
    } catch (err) {
        showLoading.stop();
        console.error(err);
        // Demo: simulate
        await showModal.success("Periode Diakhiri", "Periode berhasil diakhiri");
        const idx = allPeriodes.findIndex(p => p.id === id);
        if (idx !== -1) {
            allPeriodes[idx].status = 'completed';
            renderPeriodes();
        }
    }
};

// showToast function is now imported from alerts.js
