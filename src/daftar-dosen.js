// ========================================
// DAFTAR DOSEN PAGE (Kaprodi)
// ========================================

import { kaprodiAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { getInitials } from "./utils/formatUtils.js";

// ---------- STATE ----------
let dosenList = [];

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "daftar-dosen" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        const result = await kaprodiAPI.getDosenList();
        if (result.ok) dosenList = result.data || [];
        else dosenList = getDummyData();
    } catch (err) {
        console.error(err);
        dosenList = getDummyData();
    }
    renderList();
    updateStats();
}

function getDummyData() {
    return [
        { id: 1, nama: "Dr. Andi Wijaya, M.Kom", email: "andi@univ.ac.id", nip: "198501012010011001", mahasiswa_count: 8, max_quota: 10, mahasiswa: ["Ahmad Fauzan", "Siti Nurhaliza", "Budi Santoso"] },
        { id: 2, nama: "Prof. Sari Mutiara, Ph.D", email: "sari@univ.ac.id", nip: "197803152005012003", mahasiswa_count: 6, max_quota: 8, mahasiswa: ["Dewi Lestari", "Eko Prasetyo"] },
        { id: 3, nama: "Dr. Budi Hartono, M.T", email: "budi.h@univ.ac.id", nip: "198207082009121001", mahasiswa_count: 10, max_quota: 10, mahasiswa: ["Fitri Handayani", "Galih Pratama"] },
        { id: 4, nama: "Dr. Ratna Dewi, M.Sc", email: "ratna@univ.ac.id", nip: "198912012015042002", mahasiswa_count: 4, max_quota: 8, mahasiswa: ["Hendra Saputra"] },
        { id: 5, nama: "Ir. Joko Susanto, M.M", email: "joko@univ.ac.id", nip: "199003252018011003", mahasiswa_count: 2, max_quota: 8, mahasiswa: [] },
    ];
}

// ---------- RENDERING ----------
function renderList() {
    const container = document.getElementById("dosen-list");
    const search = document.getElementById("search-input")?.value.toLowerCase() || "";
    let filtered = dosenList.filter(d => d.nama.toLowerCase().includes(search) || d.nip.includes(search));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white rounded-xl"><span class="material-symbols-outlined text-5xl text-slate-300">search_off</span><p class="text-text-secondary mt-2">Tidak ditemukan</p></div>`;
        return;
    }

    container.innerHTML = filtered.map(d => renderCard(d)).join("");
}

function renderCard(d) {
    const percent = Math.round((d.mahasiswa_count / d.max_quota) * 100);
    const isFull = percent >= 100;
    const barColor = percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-yellow-500" : "bg-green-500";

    return `
    <div class="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
        <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">${getInitials(d.nama)}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-text-main text-sm lg:text-base truncate">${d.nama}</p>
                        ${isFull ? `<span class="px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded-full shrink-0">Penuh</span>` : ""}
                    </div>
                    <p class="text-text-secondary text-xs">${d.nip} • ${d.email}</p>
                </div>
            </div>
            <div class="flex flex-col sm:items-end gap-2 shrink-0">
                <div class="w-full sm:w-36">
                    <div class="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Beban</span>
                        <span class="${isFull ? "text-red-600 font-medium" : ""}">${d.mahasiswa_count}/${d.max_quota}</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full ${barColor}" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                </div>
                <button onclick="viewDetail(${d.id})" class="text-xs text-primary hover:underline">Lihat Detail →</button>
            </div>
        </div>
    </div>`;
}

function updateStats() {
    document.getElementById("stat-total").textContent = dosenList.length;
    document.getElementById("stat-available").textContent = dosenList.filter(d => d.mahasiswa_count < d.max_quota).length;
    document.getElementById("stat-full").textContent = dosenList.filter(d => d.mahasiswa_count >= d.max_quota).length;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("search-input")?.addEventListener("input", renderList);
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("detail-modal")?.addEventListener("click", e => { if (e.target.id === "detail-modal") closeModal(); });
}

// ---------- MODAL ----------
window.viewDetail = function (id) {
    const d = dosenList.find(x => x.id === id);
    if (!d) return;
    const percent = Math.round((d.mahasiswa_count / d.max_quota) * 100);
    const barColor = percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-yellow-500" : "bg-green-500";

    document.getElementById("modal-content").innerHTML = `
        <div class="flex flex-col gap-5">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl">${getInitials(d.nama)}</div>
                <div>
                    <h3 class="font-bold text-text-main text-lg">${d.nama}</h3>
                    <p class="text-text-secondary text-sm">${d.email}</p>
                    <p class="text-text-secondary text-xs">NIP: ${d.nip}</p>
                </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-lg">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-text-secondary">Beban Bimbingan</span>
                    <span class="font-semibold text-text-main">${d.mahasiswa_count}/${d.max_quota} mahasiswa</span>
                </div>
                <div class="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full ${barColor}" style="width: ${Math.min(percent, 100)}%"></div>
                </div>
            </div>
            <div>
                <p class="font-medium text-text-main text-sm mb-2">Mahasiswa Bimbingan:</p>
                ${d.mahasiswa && d.mahasiswa.length > 0 ? `
                <ul class="list-disc list-inside text-text-secondary text-sm space-y-1">
                    ${d.mahasiswa.map(m => `<li>${m}</li>`).join("")}
                </ul>
                ` : `<p class="text-text-secondary text-sm">Belum ada mahasiswa</p>`}
            </div>
        </div>
    `;
    document.getElementById("detail-modal").classList.remove("hidden");
    document.getElementById("detail-modal").classList.add("flex");
    document.body.style.overflow = "hidden";
};

function closeModal() {
    document.getElementById("detail-modal").classList.add("hidden");
    document.getElementById("detail-modal").classList.remove("flex");
    document.body.style.overflow = "";
}
