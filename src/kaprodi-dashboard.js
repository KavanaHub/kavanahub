// ========================================
// KAPRODI DASHBOARD PAGE
// ========================================

import { kaprodiAPI, getToken } from "./api.js";
import { getSidebarHTML, bindSidebarEvents, updateSidebarUser } from "./components/sidebar.js";
import { getInitials, removeAcademicTitles } from "./utils/formatUtils.js";

// ---------- STATE ----------
let stats = null;
let dosenList = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const currentRole = sessionStorage.getItem("userRole");

    if (!getToken()) {
        window.location.href = "/login.html";
        return;
    }

    if (currentRole && currentRole !== "kaprodi") {
        const dashboards = {
            mahasiswa: "/mahasiswa/dashboard.html",
            dosen: "/dosen/dashboard.html",
            koordinator: "/koordinator/dashboard.html",
        };
        window.location.href = dashboards[currentRole] || "/mahasiswa/dashboard.html";
        return;
    }

    const app = document.getElementById("app");
    app.innerHTML = `
        <div id="sidebar-placeholder"></div>
        <div id="mobile-header" class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-4 py-3 flex items-center justify-between shadow-lg">
            <button id="btn-open-sidebar" class="text-white p-2 -ml-2"><span class="material-symbols-outlined text-[28px]">menu</span></button>
            <div class="flex items-center gap-2"><span class="material-symbols-outlined text-white icon-fill">school</span><span class="text-white font-bold">Kavana</span></div>
            <div class="w-10"></div>
        </div>
        <main id="main-content" class="flex-1 overflow-y-auto h-full w-full pt-14 lg:pt-0"></main>
    `;

    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    sidebarPlaceholder.outerHTML = getSidebarHTML("kaprodi", "dashboard");
    bindSidebarEvents(handleMenuClick);
    updateSidebarUser();
    setupMobileSidebar();

    await loadData();
    renderDashboard();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const [statsResult, dosenResult, profileResult] = await Promise.all([
            kaprodiAPI.getStats(),
            kaprodiAPI.getDosenList(),
            kaprodiAPI.getProfile(),
        ]);
        if (statsResult.ok) stats = statsResult.data;
        if (dosenResult.ok) dosenList = dosenResult.data || [];

        // Update sessionStorage with real profile data
        if (profileResult.ok && profileResult.data) {
            if (profileResult.data.nama) sessionStorage.setItem("userName", profileResult.data.nama);
            if (profileResult.data.email) sessionStorage.setItem("userEmail", profileResult.data.email);
            updateSidebarUser();
        }
    } catch (err) {
        console.error(err);
        stats = getDummyStats();
        dosenList = getDummyDosen();
    }
}

function getDummyStats() {
    return {
        total_mahasiswa: 125,
        total_dosen: 15,
        mahasiswa_aktif: 98,
        siap_sidang: 27,
        lulus_semester_ini: 18,
    };
}

function getDummyDosen() {
    return [
        { id: 1, nama: "Dr. Andi Wijaya, M.Kom", mahasiswa_count: 8, max_quota: 10 },
        { id: 2, nama: "Prof. Sari Mutiara, Ph.D", mahasiswa_count: 6, max_quota: 8 },
        { id: 3, nama: "Dr. Budi Hartono, M.T", mahasiswa_count: 10, max_quota: 10 },
        { id: 4, nama: "Dr. Ratna Dewi, M.Sc", mahasiswa_count: 4, max_quota: 8 },
    ];
}

// ---------- RENDERING ----------
function renderDashboard() {
    const main = document.getElementById("main-content");
    const rawName = sessionStorage.getItem("userName") || "Kaprodi";
    const userName = removeAcademicTitles(rawName);
    const s = stats || getDummyStats();

    main.innerHTML = `
        <div class="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
            <!-- Header -->
            <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-text-main text-2xl sm:text-3xl lg:text-4xl font-black">Selamat Datang, ${userName}!</h1>
                    <p class="text-text-secondary text-sm lg:text-base mt-1">Dashboard Kepala Program Studi</p>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg">
                    <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
                    <span class="text-sm font-medium">Kaprodi</span>
                </div>
            </header>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p class="text-2xl lg:text-3xl font-bold text-text-main">${s.total_mahasiswa}</p>
                    <p class="text-text-secondary text-xs">Total Mahasiswa</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p class="text-2xl lg:text-3xl font-bold text-purple-600">${s.total_dosen}</p>
                    <p class="text-text-secondary text-xs">Total Dosen</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p class="text-2xl lg:text-3xl font-bold text-blue-600">${s.mahasiswa_aktif}</p>
                    <p class="text-text-secondary text-xs">Mahasiswa Aktif</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                    <p class="text-2xl lg:text-3xl font-bold text-yellow-600">${s.siap_sidang}</p>
                    <p class="text-text-secondary text-xs">Siap Sidang</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center col-span-2 lg:col-span-1">
                    <p class="text-2xl lg:text-3xl font-bold text-green-600">${s.lulus_semester_ini}</p>
                    <p class="text-text-secondary text-xs">Lulus Semester Ini</p>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <a href="/kaprodi/daftar-dosen.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">group</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Daftar Dosen</h3>
                        <p class="text-text-secondary text-sm">Kelola dosen pembimbing & beban</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
                <a href="/kaprodi/monitoring.html" class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[28px]">monitoring</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-text-main">Monitoring</h3>
                        <p class="text-text-secondary text-sm">Pantau progress mahasiswa</p>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </a>
            </div>

            <!-- Dosen Workload -->
            <div class="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="font-bold text-text-main text-lg">Beban Bimbingan Dosen</h2>
                    <a href="/kaprodi/daftar-dosen.html" class="text-primary text-sm hover:underline">Lihat Semua →</a>
                </div>
                <div class="flex flex-col gap-3">
                    ${dosenList.slice(0, 5).map(d => {
        const percent = Math.round((d.mahasiswa_count / d.max_quota) * 100);
        const barColor = percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-yellow-500" : "bg-green-500";
        return `
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">${getInitials(d.nama)}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-center mb-1">
                                    <p class="font-medium text-text-main text-sm truncate">${d.nama}</p>
                                    <span class="text-xs text-text-secondary shrink-0">${d.mahasiswa_count}/${d.max_quota}</span>
                                </div>
                                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full ${barColor}" style="width: ${percent}%"></div>
                                </div>
                            </div>
                        </div>`;
    }).join("")}
                </div>
            </div>
        </div>
    `;
}

// ---------- MENU HANDLER ----------
function handleMenuClick(menuId) {
    const pages = {
        dashboard: "/kaprodi/dashboard.html",
        "kelola-koordinator": "/kaprodi/kelola-koordinator.html",
        "daftar-dosen": "/kaprodi/daftar-dosen.html",
        monitoring: "/kaprodi/monitoring.html",
        profile: "/shared/profile.html",
        settings: "/shared/settings.html",
    };
    if (pages[menuId]) window.location.href = pages[menuId];
}

function setupMobileSidebar() {
    document.getElementById("btn-open-sidebar")?.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.remove("-translate-x-full");
        document.getElementById("sidebar-overlay")?.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
}
