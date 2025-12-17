// ========================================
// DOSEN DASHBOARD PAGE
// ========================================

import { dosenAPI } from "./api.js";
import { getToken, clearToken } from "./api.js";
import { getSidebarHTML, bindSidebarEvents, updateSidebarUser } from "./components/sidebar.js";
import { formatDateShort, getInitials } from "./utils/formatUtils.js";

// ---------- STATE ----------
let dosenProfile = null;
let mahasiswaList = [];
let pendingBimbingan = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const currentRole = sessionStorage.getItem("userRole");

    // Check auth
    if (!getToken()) {
        window.location.href = "/login.html";
        return;
    }

    // Redirect if not dosen
    if (currentRole && currentRole !== "dosen") {
        const dashboards = {
            mahasiswa: "/mahasiswa/dashboard.html",
            koordinator: "/koordinator/dashboard.html",
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
    sidebarPlaceholder.outerHTML = getSidebarHTML("dosen", "dashboard");
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
        const [profileResult, mahasiswaResult, bimbinganResult] = await Promise.all([
            dosenAPI.getProfile(),
            dosenAPI.getMahasiswaBimbingan(),
            dosenAPI.getBimbinganList(),
        ]);

        if (profileResult.ok) dosenProfile = profileResult.data;
        if (mahasiswaResult.ok) mahasiswaList = mahasiswaResult.data || [];
        if (bimbinganResult.ok) pendingBimbingan = (bimbinganResult.data || []).filter(b => b.status === "pending");
    } catch (err) {
        console.error("Error loading data:", err);
        // Use dummy data
        dosenProfile = { nama: sessionStorage.getItem("userName") || "Dosen" };
        mahasiswaList = getDummyMahasiswa();
        pendingBimbingan = getDummyBimbingan();
    }
}

function getDummyMahasiswa() {
    return [
        { id: 1, nama: "Ahmad Fauzan", npm: "2023010001", bimbingan_count: 5, bimbingan_pending: 1 },
        { id: 2, nama: "Siti Nurhaliza", npm: "2023010002", bimbingan_count: 8, bimbingan_pending: 0 },
        { id: 3, nama: "Budi Santoso", npm: "2023010003", bimbingan_count: 3, bimbingan_pending: 2 },
    ];
}

function getDummyBimbingan() {
    return [
        { id: 1, mahasiswa_nama: "Ahmad Fauzan", kegiatan: "Konsultasi BAB 1", tanggal: "2024-12-15" },
        { id: 2, mahasiswa_nama: "Siti Nurhaliza", kegiatan: "Review Progress", tanggal: "2024-12-14" },
    ];
}

// ---------- RENDERING ----------
function renderDashboard() {
    const main = document.getElementById("main-content");
    const userName = dosenProfile?.nama || sessionStorage.getItem("userName") || "Dosen";
    const totalMahasiswa = mahasiswaList.length;
    const totalPending = pendingBimbingan.length;
    const siapSidang = mahasiswaList.filter(m => m.bimbingan_count >= 8).length;

    main.innerHTML = `
        <div class="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <!-- Header -->
            <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-text-main text-2xl sm:text-3xl lg:text-4xl font-black">Selamat Datang, ${userName.split(" ")[0]}!</h1>
                    <p class="text-text-secondary text-sm lg:text-base mt-1">Dashboard Dosen Pembimbing</p>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <span class="material-symbols-outlined text-[20px]">badge</span>
                    <span class="text-sm font-medium">Dosen Pembimbing</span>
                </div>
            </header>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">groups</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${totalMahasiswa}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Mahasiswa Bimbingan</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">pending</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${totalPending}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Bimbingan Pending</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-green-50 text-green-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">check_circle</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">${siapSidang}</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Siap Sidang</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <span class="material-symbols-outlined text-[24px]">description</span>
                        </div>
                        <div>
                            <p class="text-2xl lg:text-3xl font-bold text-text-main">0</p>
                            <p class="text-text-secondary text-xs lg:text-sm">Laporan Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <a href="/dosen/mahasiswa-bimbingan.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">groups</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Mahasiswa Bimbingan</h3>
                        <p class="text-text-secondary text-sm">Lihat daftar mahasiswa Anda</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
                <a href="/dosen/bimbingan-approve.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">check_circle</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Approve Bimbingan</h3>
                        <p class="text-text-secondary text-sm">${totalPending} pending review</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
                <a href="/dosen/laporan-approve.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">grading</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Approve Laporan</h3>
                        <p class="text-text-secondary text-sm">Review laporan sidang</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="font-bold text-text-main text-lg">Bimbingan Pending</h2>
                    <a href="/dosen/bimbingan-approve.html" class="text-primary text-sm hover:underline">Lihat Semua →</a>
                </div>
                ${pendingBimbingan.length > 0 ? `
                <div class="flex flex-col gap-3">
                    ${pendingBimbingan.slice(0, 5).map(b => `
                    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                            ${getInitials(b.mahasiswa_nama)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-text-main text-sm truncate">${b.mahasiswa_nama}</p>
                            <p class="text-text-secondary text-xs truncate">${b.kegiatan}</p>
                        </div>
                        <span class="text-text-secondary text-xs shrink-0">${formatDateShort(b.tanggal)}</span>
                    </div>
                    `).join("")}
                </div>
                ` : `
                <div class="text-center py-8">
                    <span class="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
                    <p class="text-text-secondary text-sm mt-2">Tidak ada bimbingan pending</p>
                </div>
                `}
            </div>
        </div>
    `;
}

// ---------- MENU HANDLER ----------
function handleMenuClick(menuId) {
    const pages = {
        dashboard: "/dosen/dashboard.html",
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
