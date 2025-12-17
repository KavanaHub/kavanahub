// ========================================
// PROFILE PAGE (Shared - All Roles)
// ========================================

import { authAPI, getToken, clearToken } from "./api.js";
import { initPage, closeSidebar, getDashboardURL } from "./utils/pageInit.js";
import { getInitials } from "./utils/formatUtils.js";
import { setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";

// ---------- STATE ----------
let profile = null;
let currentRole = "mahasiswa";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    currentRole = sessionStorage.getItem("userRole") || "mahasiswa";
    const { isAuthenticated } = initPage({ activeMenu: "profile" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    await loadProfile();
    setupEventListeners();
});

// ---------- DATA LOADING ----------
async function loadProfile() {
    try {
        const result = await authAPI.getProfile();
        if (result.ok) {
            profile = result.data;
        } else {
            profile = getDummyProfile();
        }
    } catch (err) {
        console.error(err);
        profile = getDummyProfile();
    }
    renderProfile();
}

function getDummyProfile() {
    const role = currentRole;
    if (role === "mahasiswa") {
        return {
            nama: sessionStorage.getItem("userName") || "Nama Mahasiswa",
            email: sessionStorage.getItem("userEmail") || "mahasiswa@email.com",
            npm: "2023010001",
            angkatan: "2023",
            whatsapp: "081234567890",
        };
    } else if (role === "dosen") {
        return {
            nama: sessionStorage.getItem("userName") || "Nama Dosen",
            email: sessionStorage.getItem("userEmail") || "dosen@univ.ac.id",
            nip: "198501012010011001",
        };
    } else {
        return {
            nama: sessionStorage.getItem("userName") || "Nama User",
            email: sessionStorage.getItem("userEmail") || "user@univ.ac.id",
            nip: "198501012010011001",
        };
    }
}

// ---------- RENDERING ----------
function renderProfile() {
    const p = profile || getDummyProfile();
    const isMahasiswa = currentRole === "mahasiswa";
    const roleLabels = { mahasiswa: "Mahasiswa", dosen: "Dosen Pembimbing", koordinator: "Koordinator", kaprodi: "Kepala Program Studi" };

    // Avatar
    document.getElementById("profile-avatar").textContent = getInitials(p.nama);

    // Info
    document.getElementById("profile-nama").textContent = p.nama;
    document.getElementById("profile-role").textContent = roleLabels[currentRole] || currentRole;
    document.getElementById("profile-email").textContent = p.email;

    // Identifier (NPM/NIP)
    if (isMahasiswa) {
        document.getElementById("label-identifier").textContent = "NPM";
        document.getElementById("profile-identifier").textContent = p.npm || "-";
    } else {
        document.getElementById("label-identifier").textContent = "NIP";
        document.getElementById("profile-identifier").textContent = p.nip || "-";
    }

    // Mahasiswa-specific fields
    if (isMahasiswa) {
        document.getElementById("profile-whatsapp").textContent = p.whatsapp || "-";
        document.getElementById("profile-angkatan").textContent = p.angkatan || "-";
        document.getElementById("whatsapp-section").classList.remove("hidden");
        document.getElementById("angkatan-section").classList.remove("hidden");
        document.getElementById("edit-whatsapp-section").classList.remove("hidden");
    } else {
        document.getElementById("whatsapp-section")?.classList.add("hidden");
        document.getElementById("angkatan-section")?.classList.add("hidden");
        document.getElementById("edit-whatsapp-section")?.classList.add("hidden");
    }

    // Fill edit form
    document.getElementById("edit-nama").value = p.nama || "";
    document.getElementById("edit-email").value = p.email || "";
    if (isMahasiswa) {
        document.getElementById("edit-whatsapp").value = p.whatsapp || "";
    }
}

// ---------- EVENT HANDLERS ----------
function setupEventListeners() {
    document.getElementById("profile-form")?.addEventListener("submit", handleSave);
    document.getElementById("btn-cancel")?.addEventListener("click", () => renderProfile());
    document.getElementById("btn-logout")?.addEventListener("click", handleLogout);
    document.getElementById("btn-upload-photo")?.addEventListener("click", () => {
        alert("Fitur upload foto akan segera tersedia");
    });
}

async function handleSave(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-save");
    setButtonLoading(btn, "Menyimpan...");

    const data = {
        nama: document.getElementById("edit-nama").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
    };

    if (currentRole === "mahasiswa") {
        data.whatsapp = document.getElementById("edit-whatsapp").value.trim();
    }

    try {
        const result = await authAPI.updateProfile(data);
        if (result.ok) {
            // Update session
            sessionStorage.setItem("userName", data.nama);
            sessionStorage.setItem("userEmail", data.email);

            // Update local profile
            profile = { ...profile, ...data };
            renderProfile();
            showToast("Profil berhasil disimpan");
        } else {
            alert("Gagal menyimpan: " + (result.error || "Error"));
        }
    } catch (err) {
        console.error(err);
        // Demo: update locally
        sessionStorage.setItem("userName", data.nama);
        sessionStorage.setItem("userEmail", data.email);
        profile = { ...profile, ...data };
        renderProfile();
        showToast("Profil berhasil disimpan");
    } finally {
        resetButtonLoading(btn);
    }
}

function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        clearToken();
        sessionStorage.clear();
        window.location.href = "/login.html";
    }
}

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-main text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
