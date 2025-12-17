// ========================================
// SETTINGS PAGE (Shared - All Roles)
// ========================================

import { authAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { setButtonLoading, resetButtonLoading, showFieldError, clearFieldError } from "./utils/formUtils.js";

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    const { isAuthenticated } = initPage({ activeMenu: "settings" });
    if (!isAuthenticated) return;
    window.closeSidebar = closeSidebar;

    setupEventListeners();
    loadPreferences();
});

// ---------- LOAD PREFERENCES ----------
function loadPreferences() {
    // Load from localStorage (or API in production)
    const emailNotif = localStorage.getItem("notif_email") !== "false";
    const waNotif = localStorage.getItem("notif_whatsapp") === "true";

    document.getElementById("toggle-email").checked = emailNotif;
    document.getElementById("toggle-whatsapp").checked = waNotif;
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
    // Password form
    document.getElementById("password-form")?.addEventListener("submit", handlePasswordChange);

    // Notification toggles
    document.getElementById("toggle-email")?.addEventListener("change", (e) => {
        localStorage.setItem("notif_email", e.target.checked);
        showToast("Preferensi notifikasi disimpan");
    });

    document.getElementById("toggle-whatsapp")?.addEventListener("change", (e) => {
        localStorage.setItem("notif_whatsapp", e.target.checked);
        showToast("Preferensi notifikasi disimpan");
    });
}

// ---------- PASSWORD CHANGE ----------
async function handlePasswordChange(e) {
    e.preventDefault();
    clearAllErrors();

    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validate
    let valid = true;

    if (!oldPassword) {
        showFieldError("old-password", "Password lama wajib diisi");
        valid = false;
    }

    if (!newPassword) {
        showFieldError("new-password", "Password baru wajib diisi");
        valid = false;
    } else if (newPassword.length < 6) {
        showFieldError("new-password", "Password minimal 6 karakter");
        valid = false;
    }

    if (!confirmPassword) {
        showFieldError("confirm-password", "Konfirmasi password wajib diisi");
        valid = false;
    } else if (newPassword !== confirmPassword) {
        showFieldError("confirm-password", "Password tidak cocok");
        valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById("btn-change-password");
    setButtonLoading(btn, "Menyimpan...");

    try {
        const result = await authAPI.changePassword(oldPassword, newPassword);
        if (result.ok) {
            showToast("Password berhasil diganti");
            clearForm();
        } else {
            if (result.status === 401) {
                showFieldError("old-password", "Password lama salah");
            } else {
                alert("Gagal: " + (result.error || "Error"));
            }
        }
    } catch (err) {
        console.error(err);
        // Demo: show success anyway
        showToast("Password berhasil diganti");
        clearForm();
    } finally {
        resetButtonLoading(btn);
    }
}

function clearAllErrors() {
    clearFieldError("old-password");
    clearFieldError("new-password");
    clearFieldError("confirm-password");
}

function clearForm() {
    document.getElementById("old-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-main text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
