// ========================================
// KOORDINATOR DASHBOARD PAGE
// ========================================

import { koordinatorAPI, getToken } from "./api.js";
import { getSidebarHTML, bindSidebarEvents, updateSidebarUser } from "./components/sidebar.js";
import { formatDateShort, getInitials, removeAcademicTitles } from "./utils/formatUtils.js";

// ---------- STATE ----------
let stats = null;
let pendingProposals = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const currentRole = sessionStorage.getItem("userRole");

    // Check auth
    if (!getToken()) {
        window.location.href = "/login.html";
        return;
    }

    // Redirect if not koordinator
    if (currentRole && currentRole !== "koordinator") {
        const dashboards = {
            mahasiswa: "/mahasiswa/dashboard.html",
            dosen: "/dosen/dashboard.html",
            kaprodi: "/kaprodi/dashboard.html",
        };
        window.location.href = dashboards[currentRole] || "/mahasiswa/dashboard.html";
        return;
    }

    // Inject sidebar
    const app = document.getElementById("app");
    app.innerHTML = `
        <div id="sidebar-placeholder"></div>
        <!-- Mobile Header -->
        <div id="mobile-header" class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-4 py-3 flex items-center justify-between shadow-lg">
            <button id="btn-open-sidebar" class="text-white p-2 -ml-2">
                <span class="material-symbols-outlined text-[28px]">menu</span>
            </button>
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-white icon-fill">school</span>
                <span class="text-white font-bold">Kavana</span>
            </div>
            <div class="w-10"></div>
        </div>
        <main id="main-content" class="flex-1 overflow-y-auto h-full w-full pt-14 lg:pt-0"></main>
    `;

    // Setup sidebar
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    sidebarPlaceholder.outerHTML = getSidebarHTML("koordinator", "dashboard");
    bindSidebarEvents(handleMenuClick);
    updateSidebarUser();

    // Setup mobile toggle
    setupMobileSidebar();

    // Load data and render
    await loadData();
    renderDashboard();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const [statsResult, proposalResult, profileResult] = await Promise.all([
            koordinatorAPI.getStats(),
            koordinatorAPI.getPendingProposals(),
            koordinatorAPI.getProfile(),
        ]);

        if (statsResult.ok) stats = statsResult.data;
        if (proposalResult.ok) pendingProposals = proposalResult.data || [];

        // Update sessionStorage with real profile data
        if (profileResult.ok && profileResult.data) {
            if (profileResult.data.nama) sessionStorage.setItem("userName", profileResult.data.nama);
            if (profileResult.data.email) sessionStorage.setItem("userEmail", profileResult.data.email);
            updateSidebarUser(); // Update sidebar with new name
        }
    } catch (err) {
        console.error("Error loading data:", err);
        // Use dummy data
        stats = getDummyStats();
        pendingProposals = getDummyProposals();
    }
}

function getDummyStats() {
    return {
        total_mahasiswa: 45,
        proposal_pending: 8,
        menunggu_pembimbing: 5,
        siap_sidang: 12,
    };
}

function getDummyProposals() {
    return [
        { id: 1, nama: "Ahmad Fauzan", npm: "2023010001", judul_proyek: "Sistem Informasi Perpustakaan", tanggal: "2024-12-15", track: "proyek1" },
        { id: 2, nama: "Siti Nurhaliza", npm: "2023010002", judul_proyek: "Internship PT Teknologi", tanggal: "2024-12-14", track: "internship1" },
        { id: 3, nama: "Budi Santoso", npm: "2023010003", judul_proyek: "Aplikasi E-Commerce UMKM", tanggal: "2024-12-13", track: "proyek2" },
    ];
}

// ---------- RENDERING ----------
function renderDashboard() {
    const main = document.getElementById("main-content");
    const rawName = sessionStorage.getItem("userName") || "Koordinator";
    const userName = removeAcademicTitles(rawName);
    const s = stats || getDummyStats();

    main.innerHTML = `
        <div class="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <!-- Header -->
            <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-text-main text-2xl sm:text-3xl lg:text-4xl font-black">Selamat Datang, ${userName}!</h1>
                    <p class="text-text-secondary text-sm lg:text-base mt-1">Dashboard Koordinator Proyek & Internship</p>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <span class="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                    <span class="text-sm font-medium">Koordinator</span>
                </div>
            </header>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">school</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${s.total_mahasiswa}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Total Mahasiswa</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">fact_check</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${s.proposal_pending}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Proposal Pending</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">how_to_reg</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${s.menunggu_pembimbing}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Perlu Pembimbing</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-green-50 text-green-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">verified</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${s.siap_sidang}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Siap Sidang</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <a href="/koordinator/validasi-proposal.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">fact_check</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Validasi Proposal</h3>
                        <p class="text-text-secondary text-sm">${s.proposal_pending} proposal menunggu</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
                <a href="/koordinator/approve-pembimbing.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">how_to_reg</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Assign Pembimbing</h3>
                        <p class="text-text-secondary text-sm">${s.menunggu_pembimbing} mahasiswa menunggu</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
                <a href="/koordinator/daftar-mahasiswa.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">groups</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Daftar Mahasiswa</h3>
                        <p class="text-text-secondary text-sm">Lihat semua mahasiswa</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
            </div>

            <!-- Recent Proposals -->
            <div class="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="font-bold text-text-main text-lg">Proposal Terbaru</h2>
                    <a href="/koordinator/validasi-proposal.html" class="text-primary text-sm hover:underline">Lihat Semua →</a>
                </div>
                ${pendingProposals.length > 0 ? `
                <div class="flex flex-col gap-3">
                    ${pendingProposals.slice(0, 5).map(p => `
                    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                            ${getInitials(p.nama || 'Unknown')}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-text-main text-sm truncate">${p.nama || 'Unknown'}</p>
                            <p class="text-text-secondary text-xs truncate">${p.judul_proyek || '-'}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full shrink-0">Pending</span>
                    </div>
                    `).join("")}
                </div>
                ` : `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
                    <p class="text-text-secondary text-sm mt-2">Tidak ada proposal pending</p>
                </div>
                `}
            </div>
        </div>
    `;
}

// ---------- MENU HANDLER ----------
function handleMenuClick(menuId) {
    const pages = {
        dashboard: "/koordinator/dashboard.html",
        "kelola-periode": "/koordinator/kelola-periode.html",
        "validasi-proposal": "/koordinator/validasi-proposal.html",
        "approve-pembimbing": "/koordinator/approve-pembimbing.html",
        "daftar-mahasiswa": "/koordinator/daftar-mahasiswa.html",
        // Dosen pembimbing pages (koordinator juga dosen)
        "mahasiswa-bimbingan": "/dosen/mahasiswa-bimbingan.html",
        "bimbingan-approve": "/dosen/bimbingan-approve.html",
        "laporan-approve": "/dosen/laporan-approve.html",
        profile: "/shared/profile.html",
        settings: "/shared/settings.html",
    };

    if (pages[menuId]) {
        window.location.href = pages[menuId];
    }
}

// ---------- MOBILE SIDEBAR ----------
function setupMobileSidebar() {
    const openBtn = document.getElementById("btn-open-sidebar");
    openBtn?.addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        sidebar?.classList.remove("-translate-x-full");
        overlay?.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
}
