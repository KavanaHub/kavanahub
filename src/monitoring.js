// ========================================
// MONITORING PAGE (Kaprodi)
// ========================================

import { kaprodiAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { formatDateShort, getInitials } from "./utils/formatUtils.js";

// ---------- STATE ----------
let stats = null;
let activities = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "monitoring" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    renderDashboard();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const result = await kaprodiAPI.getStats();
        if (result.ok) stats = result.data;
        else stats = getDummyStats();
    } catch (err) {
        console.error(err);
        stats = getDummyStats();
    }
    activities = getDummyActivities();
}

function getDummyStats() {
    return {
        total: 125,
        proyek: 78,
        internship: 47,
        lulus: 18,
        by_status: {
            "Menunggu Track": 15,
            "Proposal Pending": 12,
            "Sedang Bimbingan": 62,
            "Siap Sidang": 18,
            "Lulus": 18,
        },
        by_angkatan: {
            "2021": 8,
            "2022": 35,
            "2023": 52,
            "2024": 30,
        },
    };
}

function getDummyActivities() {
    return [
        { type: "proposal", desc: "Ahmad Fauzan mengajukan proposal", time: "2024-12-15" },
        { type: "bimbingan", desc: "Siti Nurhaliza menyelesaikan bimbingan ke-8", time: "2024-12-14" },
        { type: "sidang", desc: "Budi Santoso lulus sidang", time: "2024-12-13" },
        { type: "pembimbing", desc: "Dewi Lestari ditugaskan ke Dr. Andi", time: "2024-12-12" },
        { type: "proposal", desc: "Eko Prasetyo mengajukan proposal", time: "2024-12-11" },
    ];
}

// ---------- RENDERING ----------
function renderDashboard() {
    const s = stats || getDummyStats();

    // Update stats
    document.getElementById("stat-total").textContent = s.total;
    document.getElementById("stat-proyek").textContent = s.proyek;
    document.getElementById("stat-internship").textContent = s.internship;
    document.getElementById("stat-lulus").textContent = s.lulus;

    // Status chart
    renderStatusChart(s.by_status);

    // Angkatan chart
    renderAngkatanChart(s.by_angkatan);

    // Activity list
    renderActivities();
}

function renderStatusChart(data) {
    const container = document.getElementById("status-chart");
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const colors = {
        "Menunggu Track": "bg-slate-400",
        "Proposal Pending": "bg-yellow-500",
        "Sedang Bimbingan": "bg-blue-500",
        "Siap Sidang": "bg-purple-500",
        "Lulus": "bg-green-500",
    };

    container.innerHTML = Object.entries(data).map(([key, value]) => {
        const percent = total > 0 ? Math.round((value / total) * 100) : 0;
        return `
        <div>
            <div class="flex justify-between text-xs mb-1">
                <span class="text-text-secondary">${key}</span>
                <span class="font-medium text-text-main">${value} (${percent}%)</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="${colors[key] || 'bg-primary'} h-full" style="width: ${percent}%"></div>
            </div>
        </div>`;
    }).join("");
}

function renderAngkatanChart(data) {
    const container = document.getElementById("angkatan-chart");
    const max = Math.max(...Object.values(data));

    container.innerHTML = Object.entries(data).map(([key, value]) => {
        const percent = Math.round((value / max) * 100);
        return `
        <div>
            <div class="flex justify-between text-xs mb-1">
                <span class="text-text-secondary">Angkatan ${key}</span>
                <span class="font-medium text-text-main">${value} mahasiswa</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="bg-primary h-full" style="width: ${percent}%"></div>
            </div>
        </div>`;
    }).join("");
}

function renderActivities() {
    const container = document.getElementById("activity-list");
    const icons = {
        proposal: { icon: "description", color: "text-yellow-600 bg-yellow-50" },
        bimbingan: { icon: "chat", color: "text-blue-600 bg-blue-50" },
        sidang: { icon: "verified", color: "text-green-600 bg-green-50" },
        pembimbing: { icon: "how_to_reg", color: "text-purple-600 bg-purple-50" },
    };

    container.innerHTML = activities.map(a => {
        const cfg = icons[a.type] || icons.proposal;
        return `
        <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div class="p-2 ${cfg.color} rounded-lg shrink-0"><span class="material-symbols-outlined text-[20px]">${cfg.icon}</span></div>
            <div class="flex-1 min-w-0">
                <p class="text-text-main text-sm truncate">${a.desc}</p>
                <p class="text-text-secondary text-xs">${formatDateShort(a.time)}</p>
            </div>
        </div>`;
    }).join("");
}
