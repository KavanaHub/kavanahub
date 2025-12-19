// ========================================
// KELOMPOK PAGE - Mahasiswa
// ========================================

import { mahasiswaAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { getInitials } from "./utils/formatUtils.js";
import { showToast, showModal, animate } from "./utils/alerts.js";

// ---------- STATE ----------
let myKelompok = null;
let availableKelompok = [];
let userTrack = null;

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    const { isAuthenticated } = initPage({ activeMenu: "kelompok" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadData();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadData() {
    try {
        // Get profile to check track
        const profileResult = await mahasiswaAPI.getProfile();
        if (profileResult.ok) {
            userTrack = profileResult.data.track;
        }

        // Check track
        if (!userTrack) {
            showNoTrackWarning();
            return;
        }

        // Check if internship
        if (userTrack.startsWith('internship')) {
            showInternshipInfo();
            return;
        }

        // Get my kelompok
        const kelompokResult = await mahasiswaAPI.getMyKelompok();
        if (kelompokResult.ok && kelompokResult.data && kelompokResult.data.kelompok) {
            myKelompok = kelompokResult.data;
            renderMyKelompok();
        } else {
            // No kelompok yet, show create/join options
            showCreateJoinOptions();
            await loadAvailableKelompok();
        }
    } catch (err) {
        console.error(err);
        // Use dummy data for demo
        showCreateJoinOptions();
        availableKelompok = getDummyAvailable();
        renderAvailableKelompok();
    }
}

async function loadAvailableKelompok() {
    try {
        const result = await mahasiswaAPI.getAvailableKelompok();
        if (result.ok) {
            availableKelompok = result.data || [];
        } else {
            availableKelompok = getDummyAvailable();
        }
    } catch {
        availableKelompok = getDummyAvailable();
    }
    renderAvailableKelompok();
}

function getDummyAvailable() {
    return [
        { id: 1, nama: "Tim Innovate", track: "proyek-1", jumlah_anggota: 1 },
        { id: 2, nama: "Tim Creator", track: "proyek-1", jumlah_anggota: 1 },
    ];
}

// ---------- RENDERING ----------
function renderMyKelompok() {
    const content = document.getElementById("my-kelompok-content");
    if (!myKelompok || !myKelompok.kelompok) {
        content.innerHTML = `
            <div class="text-center py-8 text-text-secondary">
                <span class="material-symbols-outlined text-4xl mb-2">group_off</span>
                <p>Anda belum tergabung dalam kelompok</p>
            </div>
        `;
        return;
    }

    const k = myKelompok.kelompok;
    const members = myKelompok.anggota || [];

    content.innerHTML = `
        <div class="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200 mb-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-violet-600 font-medium">Nama Kelompok</p>
                    <p class="text-lg font-bold text-violet-800">${k.nama}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-violet-600 font-medium">Track</p>
                    <p class="text-sm font-semibold text-violet-800">${formatTrack(k.track)}</p>
                </div>
            </div>
        </div>
        <div>
            <p class="text-sm font-medium text-text-main mb-3">Anggota Kelompok (${members.length}/2)</p>
            <div class="flex flex-col gap-2">
                ${members.map(m => `
                    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">${getInitials(m.nama)}</div>
                        <div>
                            <p class="font-medium text-text-main">${m.nama}</p>
                            <p class="text-xs text-text-secondary">${m.npm}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${members.length < 2 ? `
                <p class="text-xs text-text-secondary mt-3 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">info</span>
                    Menunggu 1 anggota lagi untuk melengkapi kelompok
                </p>
            ` : `
                <p class="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Kelompok sudah lengkap!
                </p>
            `}
        </div>
    `;

    // Hide create/join sections
    document.getElementById("create-kelompok-section").classList.add("hidden");
    document.getElementById("available-kelompok-section").classList.add("hidden");
}

function renderAvailableKelompok() {
    const list = document.getElementById("available-kelompok-list");

    if (availableKelompok.length === 0) {
        list.innerHTML = `
            <div class="text-center py-6 text-text-secondary">
                <span class="material-symbols-outlined text-3xl mb-2">search_off</span>
                <p class="text-sm">Tidak ada kelompok tersedia</p>
                <p class="text-xs mt-1">Buat kelompok baru untuk memulai</p>
            </div>
        `;
        return;
    }

    list.innerHTML = availableKelompok.map(k => `
        <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <div>
                    <p class="font-medium text-text-main">${k.nama}</p>
                    <p class="text-xs text-text-secondary">${k.jumlah_anggota}/2 anggota • ${formatTrack(k.track)}</p>
                </div>
            </div>
            <button onclick="joinKelompok(${k.id})" class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px]">group_add</span>
                Gabung
            </button>
        </div>
    `).join('');
}

function showCreateJoinOptions() {
    document.getElementById("my-kelompok-content").innerHTML = `
        <div class="text-center py-6 text-text-secondary">
            <span class="material-symbols-outlined text-4xl mb-2">group_off</span>
            <p>Anda belum tergabung dalam kelompok</p>
            <p class="text-xs mt-1">Buat kelompok baru atau gabung ke kelompok yang tersedia</p>
        </div>
    `;
    document.getElementById("create-kelompok-section").classList.remove("hidden");
    document.getElementById("available-kelompok-section").classList.remove("hidden");
}

function showNoTrackWarning() {
    document.getElementById("my-kelompok-section").classList.add("hidden");
    document.getElementById("no-track-warning").classList.remove("hidden");
}

function showInternshipInfo() {
    document.getElementById("my-kelompok-section").classList.add("hidden");
    document.getElementById("internship-info").classList.remove("hidden");
}

function formatTrack(track) {
    const map = {
        'proyek-1': 'Proyek 1',
        'proyek-2': 'Proyek 2',
        'proyek-3': 'Proyek 3',
        'internship-1': 'Internship 1',
        'internship-2': 'Internship 2'
    };
    return map[track] || track;
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("create-kelompok-form")?.addEventListener("submit", handleCreateKelompok);
}

async function handleCreateKelompok(e) {
    e.preventDefault();
    const nama = document.getElementById("kelompok-nama").value.trim();

    if (!nama) {
        showToast.warning("Nama kelompok wajib diisi");
        return;
    }

    const btn = document.getElementById("btn-create");
    setButtonLoading(btn, "Membuat...");

    try {
        const result = await mahasiswaAPI.createKelompok(nama);
        if (result.ok) {
            showToast.success("Kelompok berhasil dibuat!");
            await loadData();
        } else {
            showModal.error("Gagal", result.error || "Gagal membuat kelompok");
        }
    } catch (err) {
        console.error(err);
        // Demo: simulate success
        showToast.success("Kelompok berhasil dibuat!");
        myKelompok = {
            kelompok: { id: 1, nama, track: userTrack },
            anggota: [{ id: 1, nama: sessionStorage.getItem("userName") || "Anda", npm: "2023xxxxx" }]
        };
        renderMyKelompok();
    } finally {
        resetButtonLoading(btn);
    }
}

window.joinKelompok = async function (kelompokId) {
    const confirmed = await showModal.confirm(
        "Gabung Kelompok?",
        "Yakin ingin bergabung ke kelompok ini?"
    );
    if (!confirmed) return;

    try {
        const result = await mahasiswaAPI.joinKelompok(kelompokId);
        if (result.ok) {
            showToast.success("Berhasil bergabung ke kelompok!");
            await loadData();
        } else {
            showModal.error("Gagal", result.error || "Gagal bergabung ke kelompok");
        }
    } catch (err) {
        console.error(err);
        // Demo: simulate success
        showToast.success("Berhasil bergabung ke kelompok!");
        const joined = availableKelompok.find(k => k.id === kelompokId);
        if (joined) {
            myKelompok = {
                kelompok: joined,
                anggota: [
                    { id: 1, nama: "Anggota Lain", npm: "2023010001" },
                    { id: 2, nama: sessionStorage.getItem("userName") || "Anda", npm: "2023xxxxx" }
                ]
            };
            renderMyKelompok();
        }
    }
};

// showToast is now imported from alerts.js
