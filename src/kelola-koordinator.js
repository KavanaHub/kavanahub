// ========================================
// KELOLA KOORDINATOR - Kaprodi
// Assign koordinator ke semester proyek/internship
// ========================================

import { kaprodiAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";

// ---------- STATE ----------
let allKoordinators = [];
let pendingAssignment = null;

const SEMESTERS = [2, 3, 5, 7, 8];
const SEMESTER_LABELS = {
    2: "Proyek 1 (Semester 2)",
    3: "Proyek 2 (Semester 3)",
    5: "Proyek 3 (Semester 5)",
    7: "Internship 1 (Semester 7)",
    8: "Internship 2 (Semester 8)"
};

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "kelola-koordinator" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const result = await kaprodiAPI.getKoordinatorList();
        if (result.ok) {
            allKoordinators = result.data || [];
        } else {
            allKoordinators = getDummyData();
        }
    } catch (err) {
        console.error(err);
        allKoordinators = getDummyData();
    }
    render();
}

function getDummyData() {
    return [
        { id: 1, nama: "Dr. Koordinator A", email: "koord.a@kampus.ac.id", assigned_semester: 2, semester_label: "Proyek 1" },
        { id: 2, nama: "Dr. Koordinator B", email: "koord.b@kampus.ac.id", assigned_semester: null, semester_label: null },
        { id: 3, nama: "Dr. Koordinator C", email: "koord.c@kampus.ac.id", assigned_semester: 7, semester_label: "Internship 1" },
    ];
}

// ---------- RENDERING ----------
function render() {
    renderSlots();
    renderKoordinatorList();
}

function renderSlots() {
    SEMESTERS.forEach(sem => {
        const slot = document.getElementById(`slot-${sem}`);
        const assigned = allKoordinators.find(k => k.assigned_semester === sem);

        if (assigned) {
            slot.innerHTML = `
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                        <p class="font-semibold text-green-700">${assigned.nama}</p>
                        <p class="text-xs text-green-600">${assigned.email}</p>
                    </div>
                    <button onclick="unassignKoordinator(${assigned.id})" class="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Hapus assignment">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <div class="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                    <p class="text-sm text-text-secondary italic">Belum ada koordinator</p>
                    <button onclick="showAssignOptions(${sem})" class="mt-2 px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                        + Pilih Koordinator
                    </button>
                </div>
            `;
        }
    });
}

function renderKoordinatorList() {
    const container = document.getElementById("koordinator-list");

    if (allKoordinators.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-text-secondary">
                <span class="material-symbols-outlined text-4xl mb-2">person_off</span>
                <p>Tidak ada data koordinator</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allKoordinators.map(k => {
        const statusClass = k.assigned_semester
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600";
        const statusText = k.assigned_semester
            ? k.semester_label
            : "Belum di-assign";

        return `
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                        ${k.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-semibold text-text-main">${k.nama}</p>
                        <p class="text-xs text-text-secondary">${k.email}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-lg ${statusClass}">${statusText}</span>
                    ${!k.assigned_semester ? `
                        <div class="relative">
                            <select onchange="quickAssign(${k.id}, this.value)" class="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400">
                                <option value="">Pilih Semester</option>
                                ${getAvailableSemesterOptions()}
                            </select>
                        </div>
                    ` : `
                        <button onclick="unassignKoordinator(${k.id})" class="px-2 py-1.5 text-xs font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                            Hapus
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function getAvailableSemesterOptions() {
    const assignedSemesters = allKoordinators
        .filter(k => k.assigned_semester)
        .map(k => k.assigned_semester);

    return SEMESTERS
        .filter(sem => !assignedSemesters.includes(sem))
        .map(sem => `<option value="${sem}">${SEMESTER_LABELS[sem]}</option>`)
        .join('');
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("btn-modal-cancel").addEventListener("click", closeModal);
    document.getElementById("btn-modal-confirm").addEventListener("click", confirmAssignment);
    document.getElementById("modal-assign").addEventListener("click", (e) => {
        if (e.target.id === "modal-assign") closeModal();
    });
}

window.showAssignOptions = function (semester) {
    const unassigned = allKoordinators.filter(k => !k.assigned_semester);
    if (unassigned.length === 0) {
        showToast("Semua koordinator sudah di-assign");
        return;
    }

    // Create quick select dialog
    const options = unassigned.map(k =>
        `<button onclick="assignKoordinator(${k.id}, ${semester})" class="w-full text-left p-3 hover:bg-indigo-50 rounded-lg transition-colors">
            <p class="font-medium">${k.nama}</p>
            <p class="text-xs text-text-secondary">${k.email}</p>
        </button>`
    ).join('');

    document.getElementById("modal-title").textContent = `Pilih Koordinator untuk ${SEMESTER_LABELS[semester]}`;
    document.getElementById("modal-message").innerHTML = `
        <div class="flex flex-col gap-1 max-h-60 overflow-y-auto">
            ${options}
        </div>
    `;
    document.getElementById("btn-modal-confirm").classList.add("hidden");
    document.getElementById("modal-assign").classList.remove("hidden");
};

window.assignKoordinator = async function (koordinatorId, semester) {
    closeModal();

    try {
        const result = await kaprodiAPI.assignKoordinatorSemester(koordinatorId, semester);
        if (result.ok) {
            showToast(result.data.message || "Berhasil assign koordinator");
            await loadData();
        } else {
            showToast("Gagal: " + (result.error || "Error"));
        }
    } catch (err) {
        console.error(err);
        // Demo mode
        const idx = allKoordinators.findIndex(k => k.id === koordinatorId);
        if (idx !== -1) {
            allKoordinators[idx].assigned_semester = semester;
            allKoordinators[idx].semester_label = SEMESTER_LABELS[semester];
            render();
            showToast("Berhasil assign koordinator");
        }
    }
};

window.quickAssign = async function (koordinatorId, semester) {
    if (!semester) return;
    await window.assignKoordinator(koordinatorId, parseInt(semester));
};

window.unassignKoordinator = async function (koordinatorId) {
    if (!confirm("Yakin ingin menghapus assignment koordinator ini?")) return;

    try {
        const result = await kaprodiAPI.unassignKoordinatorSemester(koordinatorId);
        if (result.ok) {
            showToast("Assignment berhasil dihapus");
            await loadData();
        } else {
            showToast("Gagal: " + (result.error || "Error"));
        }
    } catch (err) {
        console.error(err);
        // Demo mode
        const idx = allKoordinators.findIndex(k => k.id === koordinatorId);
        if (idx !== -1) {
            allKoordinators[idx].assigned_semester = null;
            allKoordinators[idx].semester_label = null;
            render();
            showToast("Assignment berhasil dihapus");
        }
    }
};

function closeModal() {
    document.getElementById("modal-assign").classList.add("hidden");
    document.getElementById("btn-modal-confirm").classList.remove("hidden");
}

function confirmAssignment() {
    if (pendingAssignment) {
        window.assignKoordinator(pendingAssignment.koordinatorId, pendingAssignment.semester);
    }
    closeModal();
}

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-main text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
