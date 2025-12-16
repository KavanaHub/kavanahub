// ========================================
// REGISTER PAGE (Connected to Backend API)
// ========================================

import { validateEmail, validateNPM, validateWhatsApp, validatePassword } from "./shared.js";
import { authAPI } from "./api.js";
import { showFieldError, clearFieldError, clearAllErrors, setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";

// ---------- REGISTER PAGE INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const passwordInput = document.getElementById("reg-password");
    const confirmPasswordInput = document.getElementById("reg-confirm-password");
    const togglePasswordBtn = document.getElementById("toggle-password");

    // Toggle password visibility
    togglePasswordBtn?.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        togglePasswordBtn.textContent = type === "password" ? "👁" : "🙈";
    });

    // Real-time password validation
    passwordInput?.addEventListener("input", (e) => {
        const password = e.target.value;
        const result = validatePassword(password);

        updatePasswordRequirement("req-length", result.length, "Minimal 8 karakter");
        updatePasswordRequirement("req-uppercase", result.uppercase, "Huruf besar");
        updatePasswordRequirement("req-number", result.number, "Angka");

        if (result.isValid) {
            clearFieldError("reg-password");
        }
    });

    // Real-time confirm password validation
    confirmPasswordInput?.addEventListener("input", (e) => {
        if (passwordInput.value === e.target.value) {
            clearFieldError("reg-confirm-password");
        }
    });

    // Real-time validation for other fields
    setupFieldValidation("reg-email", validateEmail, "Format email tidak valid");
    setupFieldValidation("reg-npm", validateNPM, "NPM harus 10 digit angka");
    setupFieldValidation("reg-whatsapp", validateWhatsApp, "Format nomor WhatsApp tidak valid");

    // Form submission
    form?.addEventListener("submit", handleSubmit);
});

// ---------- HELPERS ----------
function updatePasswordRequirement(elementId, isValid, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = (isValid ? "✓ " : "✗ ") + text;
        el.classList.toggle("valid", isValid);
    }
}

function setupFieldValidation(fieldId, validator, errorMessage) {
    const field = document.getElementById(fieldId);
    field?.addEventListener("blur", (e) => {
        if (e.target.value && !validator(e.target.value)) {
            showFieldError(fieldId, errorMessage);
        } else {
            clearFieldError(fieldId);
        }
    });

    field?.addEventListener("input", () => clearFieldError(fieldId));
}

// ---------- FORM SUBMISSION ----------
async function handleSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    // Get form data
    const formData = getFormData();

    // Validate
    if (!validateForm(formData)) return;

    // Submit to API
    const submitBtn = document.querySelector('#register-form button[type="submit"]');
    setButtonLoading(submitBtn, "Mendaftar...");

    try {
        const result = await authAPI.register({
            nama: formData.nama,
            npm: formData.npm,
            angkatan: parseInt(formData.angkatan),
            email: formData.email,
            no_wa: formData.whatsapp,
            password: formData.password,
        });

        if (result.ok) {
            alert("Registrasi berhasil! Silakan login untuk melanjutkan.");
            window.location.href = "/login.html";
        } else {
            // Handle specific errors
            handleRegistrationError(result.error);
        }
    } catch (err) {
        console.error("Registration error:", err);
        alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
        resetButtonLoading(submitBtn);
    }
}

function getFormData() {
    return {
        nama: document.getElementById("reg-nama").value.trim(),
        npm: document.getElementById("reg-npm").value.trim(),
        angkatan: document.getElementById("reg-angkatan").value,
        email: document.getElementById("reg-email").value.trim(),
        whatsapp: document.getElementById("reg-whatsapp").value.trim(),
        password: document.getElementById("reg-password").value,
        confirmPassword: document.getElementById("reg-confirm-password").value,
        terms: document.getElementById("reg-terms").checked,
    };
}

function validateForm(data) {
    let isValid = true;

    // Validate nama
    if (!data.nama) {
        showFieldError("reg-nama", "Nama lengkap wajib diisi");
        isValid = false;
    } else if (data.nama.length < 3) {
        showFieldError("reg-nama", "Nama minimal 3 karakter");
        isValid = false;
    }

    // Validate NPM
    if (!data.npm) {
        showFieldError("reg-npm", "NPM wajib diisi");
        isValid = false;
    } else if (!validateNPM(data.npm)) {
        showFieldError("reg-npm", "NPM harus 10 digit angka");
        isValid = false;
    }

    // Validate angkatan
    if (!data.angkatan) {
        showFieldError("reg-angkatan", "Pilih angkatan");
        isValid = false;
    }

    // Validate email
    if (!data.email) {
        showFieldError("reg-email", "Email wajib diisi");
        isValid = false;
    } else if (!validateEmail(data.email)) {
        showFieldError("reg-email", "Format email tidak valid");
        isValid = false;
    }

    // Validate WhatsApp
    if (!data.whatsapp) {
        showFieldError("reg-whatsapp", "Nomor WhatsApp wajib diisi");
        isValid = false;
    } else if (!validateWhatsApp(data.whatsapp)) {
        showFieldError("reg-whatsapp", "Format nomor tidak valid (contoh: 08123456789)");
        isValid = false;
    }

    // Validate password
    const passwordResult = validatePassword(data.password);
    if (!data.password) {
        showFieldError("reg-password", "Password wajib diisi");
        isValid = false;
    } else if (!passwordResult.isValid) {
        showFieldError("reg-password", "Password belum memenuhi persyaratan");
        isValid = false;
    }

    // Validate confirm password
    if (!data.confirmPassword) {
        showFieldError("reg-confirm-password", "Konfirmasi password wajib diisi");
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        showFieldError("reg-confirm-password", "Password tidak cocok");
        isValid = false;
    }

    // Validate terms
    if (!data.terms) {
        showFieldError("reg-terms", "Anda harus menyetujui syarat dan ketentuan");
        isValid = false;
    }

    return isValid;
}

function handleRegistrationError(error) {
    const errorLower = (error || "").toLowerCase();

    if (errorLower.includes("email") && errorLower.includes("exist")) {
        showFieldError("reg-email", "Email sudah terdaftar");
    } else if (errorLower.includes("npm") && errorLower.includes("exist")) {
        showFieldError("reg-npm", "NPM sudah terdaftar");
    } else if (errorLower.includes("email")) {
        showFieldError("reg-email", error);
    } else if (errorLower.includes("npm")) {
        showFieldError("reg-npm", error);
    } else {
        alert("Registrasi gagal: " + (error || "Terjadi kesalahan"));
    }
}
