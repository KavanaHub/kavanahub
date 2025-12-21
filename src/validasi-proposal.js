// ========================================
// VALIDASI PROPOSAL PAGE (Koordinator)
// ========================================

import { koordinatorAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateShort, getInitials, getTrackDisplayName } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let proposalList = [];
let currentFilter = "pending";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "validasi-proposal" });
    if (!isAuthenticated) return;

    window.closeSidebar = closeSidebar;

    await loadProposalData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadProposalData() {
    try {
        const result = await koordinatorAPI.getPendingProposals();
        if (result.ok && result.data) {
            proposalList = result.data;
        } else {
            console.warn("API failed, using dummy data");
            proposalList = getDummyData();
        }
    } catch (err) {
        console.error("Error loading proposals:", err);
        proposalList = getDummyData();
    }

    renderProposalList();
    updateStats();
}

function getDummyData() {
    return [
        { id: 1, mahasiswa_id: 1, mahasiswa_nama: "Ahmad Fauzan", npm: "2023010001", judul: "Sistem Informasi Perpustakaan Digital Berbasis Web", track: "proyek-1", partner_npm: "2023010010", file_proposal: "https://drive.google.com/file/1", tanggal_submit: "2024-12-15", status: "pending" },
        { id: 2, mahasiswa_id: 2, mahasiswa_nama: "Siti Nurhaliza", npm: "2023010002", judul: "Internship di PT Teknologi Nusantara", track: "internship-1", company_name: "PT Teknologi Nusantara", file_proposal: "https://drive.google.com/file/2", tanggal_submit: "2024-12-14", status: "pending" },
        { id: 3, mahasiswa_id: 3, mahasiswa_nama: "Budi Santoso", npm: "2023010003", judul: "Aplikasi Mobile E-Commerce UMKM", track: "proyek-2", partner_npm: "2023010011", file_proposal: "https://drive.google.com/file/3", tanggal_submit: "2024-12-13", status: "approved" },
        { id: 4, mahasiswa_id: 4, mahasiswa_nama: "Dewi Lestari", npm: "2023010004", judul: "Sistem Monitoring Kesehatan", track: "proyek-1", partner_npm: "2023010012", file_proposal: "https://drive.google.com/file/4", tanggal_submit: "2024-12-12", status: "rejected", catatan: "Judul terlalu umum, mohon diperjelas scope proyeknya" },
    ];
}

// ---------- RENDERING ----------
function renderProposalList() {
    const container = document.getElementById("proposal-list");
    // Use status_proposal from backend, fallback to status for compatibility
    let filtered = proposalList.filter(p => {
        const status = p.status_proposal || p.status || 'pending';
        return currentFilter === "all" || status === currentFilter;
    });
    filtered.sort((a, b) => new Date(b.created_at || b.tanggal_submit) - new Date(a.created_at || a.tanggal_submit));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
                <span class="material-symbols-outlined text-5xl text-slate-300">inbox</span>
                <h3 class="text-lg font-bold text-text-main mt-4">Tidak ada proposal</h3>
            </div>`;
        return;
    }

    container.innerHTML = filtered.map(p => renderProposalCard(p)).join("");
}

function renderProposalCard(p) {
    // Use correct field names from backend API
    const status = p.status_proposal || p.status || 'pending';
    const nama = p.nama || 'Unknown';
    const judul = p.judul_proyek || p.judul || 'Tidak ada judul';
    const track = p.track || 'proyek1';

    const statusConfig = { pending: { text: "Pending", icon: "🕐", class: "bg-yellow-100 text-yellow-700" }, approved: { text: "Approved", icon: "✅", class: "bg-green-100 text-green-700" }, rejected: { text: "Rejected", icon: "❌", class: "bg-red-100 text-red-700" } };
    const s = statusConfig[status] || statusConfig.pending;
    const isProyek = track.includes("proyek");

    return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
        <div class="flex flex-col gap-4">
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">${getInitials(nama)}</div>
                    <div>
                        <p class="font-semibold text-text-main text-sm lg:text-base">${nama}</p>
                        <p class="text-text-secondary text-xs">${p.npm || '-'} • ${getTrackDisplayName(track)}</p>
                    </div>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${s.class}">${s.icon} ${s.text}</span>
            </div>

            <div class="bg-slate-50 p-3 lg:p-4 rounded-lg">
                <h4 class="font-semibold text-text-main text-sm mb-2">${judul}</h4>
                <div class="flex flex-wrap gap-3 text-xs text-text-secondary">
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">calendar_today</span>${formatDateShort(p.created_at || p.tanggal_submit)}</span>
                    ${isProyek ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">group</span>Kelompok</span>` : `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">business</span>Individual</span>`}
                </div>
            </div>

            ${p.catatan ? `<div class="bg-red-50 p-3 rounded-lg border border-red-100"><p class="text-red-700 text-xs"><span class="font-medium">Catatan:</span> ${p.catatan}</p></div>` : ""}


            <div class="flex gap-2 pt-2">
                <a href="${p.file_proposal}" target="_blank" class="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[16px]">description</span>Lihat Proposal
                </a>
                <button onclick="viewDetail(${p.id})" class="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Detail</button>
                ${status === "pending" ? `
                <button onclick="openApproveModal(${p.id})" class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"><span class="material-symbols-outlined text-[16px]">check</span>Approve</button>
                <button onclick="openRejectModal(${p.id})" class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><span class="material-symbols-outlined text-[16px]">close</span>Reject</button>
                ` : ""}
            </div>
        </div>
    </div>`;
}

function updateStats() {
    // Use status_proposal from backend
    document.getElementById("stat-pending").textContent = proposalList.filter(p => (p.status_proposal || p.status) === "pending").length;
    document.getElementById("stat-approved").textContent = proposalList.filter(p => (p.status_proposal || p.status) === "approved").length;
    document.getElementById("stat-rejected").textContent = proposalList.filter(p => (p.status_proposal || p.status) === "rejected").length;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderProposalList();
        });
    });

    document.getElementById("modal-close")?.addEventListener("click", closeActionModal);
    document.getElementById("btn-modal-cancel")?.addEventListener("click", closeActionModal);
    document.getElementById("action-modal")?.addEventListener("click", e => { if (e.target.id === "action-modal") closeActionModal(); });
    document.getElementById("action-form")?.addEventListener("submit", handleAction);

    document.getElementById("detail-close")?.addEventListener("click", closeDetailModal);
    document.getElementById("detail-modal")?.addEventListener("click", e => { if (e.target.id === "detail-modal") closeDetailModal(); });
}

// ---------- MODALS ----------
window.openApproveModal = function (id) {
    const p = proposalList.find(x => x.id === id);
    if (!p) return;
    document.getElementById("action-id").value = id;
    document.getElementById("action-type").value = "approved";
    document.getElementById("modal-title").textContent = "Approve Proposal";
    document.getElementById("modal-desc").textContent = `Approve proposal "${p.judul_proyek || p.judul}" oleh ${p.nama || p.mahasiswa_nama}?`;
    document.getElementById("action-catatan").value = "";
    const btn = document.getElementById("btn-modal-submit");
    btn.textContent = "Approve";
    btn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg bg-green-500 hover:bg-green-600";
    openActionModal();
};

window.openRejectModal = function (id) {
    const p = proposalList.find(x => x.id === id);
    if (!p) return;
    document.getElementById("action-id").value = id;
    document.getElementById("action-type").value = "rejected";
    document.getElementById("modal-title").textContent = "Reject Proposal";
    document.getElementById("modal-desc").textContent = `Reject proposal "${p.judul_proyek || p.judul}" oleh ${p.nama || p.mahasiswa_nama}? Berikan alasan penolakan.`;
    document.getElementById("action-catatan").value = "";
    const btn = document.getElementById("btn-modal-submit");
    btn.textContent = "Reject";
    btn.className = "flex-1 py-2.5 text-sm font-semibold text-white rounded-lg bg-red-500 hover:bg-red-600";
    openActionModal();
};

function openActionModal() {
    document.getElementById("action-modal").classList.remove("hidden");
    document.getElementById("action-modal").classList.add("flex");
    document.body.style.overflow = "hidden";
}
function closeActionModal() {
    document.getElementById("action-modal").classList.add("hidden");
    document.getElementById("action-modal").classList.remove("flex");
    document.body.style.overflow = "";
}

async function handleAction(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById("action-id").value);
    const status = document.getElementById("action-type").value;
    const catatan = document.getElementById("action-catatan").value.trim();
    const btn = document.getElementById("btn-modal-submit");
    setButtonLoading(btn, "Memproses...");

    try {
        const result = await koordinatorAPI.validateProposal(id, status, catatan);
        if (result.ok) {
            updateLocal(id, status, catatan);
        } else {
            showModal.error("Gagal", result.error || "Terjadi kesalahan");
        }
    } catch (err) {
        console.error(err);
        updateLocal(id, status, catatan);
    } finally {
        resetButtonLoading(btn);
    }
}

function updateLocal(id, status, catatan) {
    const p = proposalList.find(x => x.id === id);
    if (p) {
        p.status_proposal = status;
        p.status = status; // for backward compatibility
        if (catatan) p.catatan = catatan;
    }
    closeActionModal();
    renderProposalList();
    updateStats();
    showToast.success(status === "approved" ? "Proposal diapprove" : "Proposal ditolak");
}

window.viewDetail = function (id) {
    const p = proposalList.find(x => x.id === id);
    if (!p) return;

    // Use correct field names from backend
    const nama = p.nama || p.mahasiswa_nama || 'Unknown';
    const judul = p.judul_proyek || p.judul || 'Tidak ada judul';
    const track = p.track || 'proyek1';
    const isProyek = track.includes("proyek");

    document.getElementById("detail-content").innerHTML = `
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">${getInitials(nama)}</div>
                <div><h3 class="font-bold text-text-main text-lg">${nama}</h3><p class="text-text-secondary text-sm">${p.npm || '-'}</p></div>
            </div>
            <div class="bg-slate-50 p-4 rounded-lg"><p class="text-text-secondary text-xs mb-1">Judul</p><p class="font-semibold text-text-main">${judul}</p></div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 p-3 rounded-lg"><p class="text-text-secondary text-xs">Track</p><p class="font-semibold text-text-main text-sm">${getTrackDisplayName(track)}</p></div>
                <div class="bg-slate-50 p-3 rounded-lg"><p class="text-text-secondary text-xs">Tanggal Submit</p><p class="font-semibold text-text-main text-sm">${formatDateShort(p.created_at || p.tanggal_submit)}</p></div>
                ${isProyek ? `<div class="bg-slate-50 p-3 rounded-lg col-span-2"><p class="text-text-secondary text-xs">Tipe</p><p class="font-semibold text-text-main text-sm">Kelompok</p></div>` : `<div class="bg-slate-50 p-3 rounded-lg col-span-2"><p class="text-text-secondary text-xs">Tipe</p><p class="font-semibold text-text-main text-sm">Individual</p></div>`}
            </div>
            <a href="${p.file_proposal || '#'}" target="_blank" class="py-2.5 text-center text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/80">Buka Proposal</a>
        </div>`;
    document.getElementById("detail-modal").classList.remove("hidden");
    document.getElementById("detail-modal").classList.add("flex");
    document.body.style.overflow = "hidden";
};
function closeDetailModal() {
    document.getElementById("detail-modal").classList.add("hidden");
    document.getElementById("detail-modal").classList.remove("flex");
    document.body.style.overflow = "";
}

// showToast is now imported from alerts.js
