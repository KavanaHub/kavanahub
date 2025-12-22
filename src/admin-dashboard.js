// ========================================
// ADMIN DASHBOARD PAGE
// ========================================

import { adminAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateShort } from "./utils/formatUtils.js";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "dashboard" });
    if (!isAuthenticated) return;

    window.closeSidebar = closeSidebar;

    await loadDashboardData();
});

// ---------- DATA LOADING ----------
async function loadDashboardData() {
    try {
        const [statsResult, activityResult] = await Promise.all([
            adminAPI.getStats(),
            adminAPI.getRecentActivity()
        ]);

        if (statsResult.ok) {
            renderStats(statsResult.data);
        }

        if (activityResult.ok) {
            renderActivity(activityResult.data);
        }
    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

// ---------- RENDER STATS ----------
function renderStats(stats) {
    // Main stats
    document.getElementById("stat-mahasiswa").textContent = stats.total_mahasiswa || 0;
    document.getElementById("stat-dosen").textContent = stats.total_dosen || 0;
    document.getElementById("stat-koordinator").textContent = stats.total_koordinator || 0;
    document.getElementById("stat-sidang").textContent = stats.sidang_bulan_ini || 0;

    // System overview
    document.getElementById("stat-proposal-pending").textContent = stats.proposal_pending || 0;
    document.getElementById("stat-bimbingan-aktif").textContent = stats.bimbingan_aktif || 0;
    document.getElementById("stat-laporan-pending").textContent = stats.laporan_pending || 0;
    document.getElementById("stat-sidang-scheduled").textContent = stats.sidang_scheduled || 0;
    document.getElementById("stat-users-inactive").textContent = stats.users_inactive || 0;
}

// ---------- RENDER ACTIVITY ----------
function renderActivity(activities) {
    const container = document.getElementById("activity-list");

    if (!activities || activities.length === 0) {
        container.innerHTML = `
      <div class="text-center py-6">
        <span class="material-symbols-outlined text-3xl text-slate-300">inbox</span>
        <p class="text-text-secondary text-sm mt-2">Belum ada aktivitas terbaru</p>
      </div>
    `;
        return;
    }

    container.innerHTML = activities.slice(0, 5).map(a => `
    <div class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div class="w-8 h-8 rounded-full ${getActivityColor(a.type)} flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-[16px]">${getActivityIcon(a.type)}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-text-main font-medium">${a.message}</p>
        <p class="text-xs text-text-secondary">${formatDateShort(a.created_at)}</p>
      </div>
    </div>
  `).join("");
}

function getActivityIcon(type) {
    const icons = {
        user_register: "person_add",
        proposal_submit: "upload_file",
        bimbingan_complete: "check_circle",
        sidang_scheduled: "event",
        default: "notifications"
    };
    return icons[type] || icons.default;
}

function getActivityColor(type) {
    const colors = {
        user_register: "bg-blue-100 text-blue-600",
        proposal_submit: "bg-green-100 text-green-600",
        bimbingan_complete: "bg-purple-100 text-purple-600",
        sidang_scheduled: "bg-yellow-100 text-yellow-600",
        default: "bg-slate-100 text-slate-600"
    };
    return colors[type] || colors.default;
}
