// ========================================
// LOGIN PAGE (Clean Code with Backend API)
// ========================================

import { validateEmail, validateNPM } from "./shared.js";
import { authAPI } from "./api.js";
import { showFieldError, clearFieldError, setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal, showLoading, animate } from "./utils/alerts.js";

// ---------- LOGIN PAGE INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const passwordInput = document.getElementById("login-password");
    const togglePasswordBtn = document.getElementById("toggle-login-password");
    const forgotPasswordLink = document.getElementById("link-forgot-password");

    // Animate form on load
    const loginCard = document.querySelector('.login-card, .auth-card, form');
    if (loginCard) {
        animate.fadeInUp(loginCard, 600);
    }

    // Forgot password (placeholder)
    forgotPasswordLink?.addEventListener("click", (e) => {
        e.preventDefault();
        showModal.info(
            "Fitur Dalam Pengembangan",
            "Fitur lupa password akan segera hadir. Silakan hubungi admin untuk reset password."
        );
    });

    // Toggle password visibility
    togglePasswordBtn?.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePasswordBtn.textContent = type === "password" ? "👁" : "🙈";
    });

    // Clear error on input
    document.getElementById("login-identifier")?.addEventListener("input", () => {
        clearFieldError("login-identifier");
    });

    document.getElementById("login-password")?.addEventListener("input", () => {
        clearFieldError("login-password");
    });

    // Form submission
    form?.addEventListener("submit", handleSubmit);
});

// ---------- FORM SUBMISSION ----------
async function handleSubmit(e) {
    e.preventDefault();

    const identifier = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("login-password").value;

    // Validate
    if (!validateLoginForm(identifier, password)) return;

    // Submit to API
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    setButtonLoading(submitBtn, "Masuk...");

    try {
        const result = await authAPI.login(identifier, password);

        if (result.ok) {
            // Store user data
            sessionStorage.setItem("userName", result.data.nama || "User");
            sessionStorage.setItem("userEmail", result.data.email || "");

            // Show success toast
            showToast.success("Login berhasil! Mengalihkan...");

            // Short delay for the toast to show
            await new Promise(resolve => setTimeout(resolve, 800));

            // Redirect to role-based dashboard
            const role = sessionStorage.getItem("userRole") || "mahasiswa";
            const dashboardUrls = {
                mahasiswa: "/mahasiswa/dashboard.html",
                dosen: "/dosen/dashboard.html",
                koordinator: "/koordinator/dashboard.html",
                kaprodi: "/kaprodi/dashboard.html",
            };
            window.location.href = dashboardUrls[role] || dashboardUrls.mahasiswa;
        } else {
            handleLoginError(result.error, result.status);
        }
    } catch (err) {
        console.error("Login error:", err);
        showModal.error(
            "Kesalahan Jaringan",
            "Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda dan coba lagi."
        );
    } finally {
        resetButtonLoading(submitBtn);
    }
}

function validateLoginForm(identifier, password) {
    let isValid = true;

    // Detect if identifier is email or NPM
    const isEmail = validateEmail(identifier);
    const isNPM = validateNPM(identifier);

    // Validate identifier
    if (!identifier) {
        showFieldError("login-identifier", "Email atau NPM wajib diisi");
        isValid = false;
    } else if (!isEmail && !isNPM) {
        showFieldError("login-identifier", "Masukkan email yang valid atau NPM (angka)");
        isValid = false;
    }

    // Validate password
    if (!password) {
        showFieldError("login-password", "Password wajib diisi");
        isValid = false;
    }

    return isValid;
}

function handleLoginError(error, status) {
    if (status === 401) {
        showFieldError("login-password", "Email/NPM atau password salah");
        showToast.error("Email/NPM atau password salah");
        // Shake the form for visual feedback
        const form = document.getElementById("login-form");
        if (form) animate.shake(form);
    } else if (status === 404) {
        showFieldError("login-identifier", "Akun tidak ditemukan");
        showToast.error("Akun tidak ditemukan");
    } else {
        showModal.error("Login Gagal", error || "Email/NPM atau password salah. Silakan coba lagi.");
    }
}
