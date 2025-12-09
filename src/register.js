import { validateEmail, validateNPM, validateWhatsApp, validatePassword, showError, clearError, clearAllErrors } from "./shared.js";
import "./style.css";

// ---------- REGISTER PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.textContent = type === 'password' ? '👁' : '🙈';
    });

    // Real-time password validation
    passwordInput?.addEventListener('input', (e) => {
        const password = e.target.value;
        const result = validatePassword(password);

        const reqLength = document.getElementById('req-length');
        const reqUppercase = document.getElementById('req-uppercase');
        const reqNumber = document.getElementById('req-number');

        if (reqLength) {
            reqLength.textContent = result.length ? '✓ Minimal 8 karakter' : '✗ Minimal 8 karakter';
            reqLength.classList.toggle('valid', result.length);
        }
        if (reqUppercase) {
            reqUppercase.textContent = result.uppercase ? '✓ Huruf besar' : '✗ Huruf besar';
            reqUppercase.classList.toggle('valid', result.uppercase);
        }
        if (reqNumber) {
            reqNumber.textContent = result.number ? '✓ Angka' : '✗ Angka';
            reqNumber.classList.toggle('valid', result.number);
        }

        // Clear password error on valid input
        if (result.isValid) {
            clearError('password');
        }
    });

    // Real-time confirm password validation
    confirmPasswordInput?.addEventListener('input', (e) => {
        if (passwordInput.value === e.target.value) {
            clearError('confirm-password');
        }
    });

    // Real-time validation for other fields
    document.getElementById('reg-email')?.addEventListener('blur', (e) => {
        if (e.target.value && !validateEmail(e.target.value)) {
            showError('email', 'Format email tidak valid');
        } else {
            clearError('email');
        }
    });

    document.getElementById('reg-npm')?.addEventListener('blur', (e) => {
        if (e.target.value && !validateNPM(e.target.value)) {
            showError('npm', 'NPM harus 10 digit angka');
        } else {
            clearError('npm');
        }
    });

    document.getElementById('reg-whatsapp')?.addEventListener('blur', (e) => {
        if (e.target.value && !validateWhatsApp(e.target.value)) {
            showError('whatsapp', 'Format nomor WhatsApp tidak valid');
        } else {
            clearError('whatsapp');
        }
    });

    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        let isValid = true;

        // Get form data
        const nama = document.getElementById('reg-nama').value.trim();
        const npm = document.getElementById('reg-npm').value.trim();
        const angkatan = document.getElementById('reg-angkatan').value;
        const email = document.getElementById('reg-email').value.trim();
        const whatsapp = document.getElementById('reg-whatsapp').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const terms = document.getElementById('reg-terms').checked;

        // Validate nama
        if (!nama) {
            showError('nama', 'Nama lengkap wajib diisi');
            isValid = false;
        } else if (nama.length < 3) {
            showError('nama', 'Nama minimal 3 karakter');
            isValid = false;
        }

        // Validate NPM
        if (!npm) {
            showError('npm', 'NPM wajib diisi');
            isValid = false;
        } else if (!validateNPM(npm)) {
            showError('npm', 'NPM harus 10 digit angka');
            isValid = false;
        }

        // Validate angkatan
        if (!angkatan) {
            showError('angkatan', 'Pilih angkatan');
            isValid = false;
        }

        // Validate email
        if (!email) {
            showError('email', 'Email wajib diisi');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Format email tidak valid');
            isValid = false;
        }

        // Validate WhatsApp
        if (!whatsapp) {
            showError('whatsapp', 'Nomor WhatsApp wajib diisi');
            isValid = false;
        } else if (!validateWhatsApp(whatsapp)) {
            showError('whatsapp', 'Format nomor tidak valid (contoh: 08123456789)');
            isValid = false;
        }

        // Validate password
        const passwordResult = validatePassword(password);
        if (!password) {
            showError('password', 'Password wajib diisi');
            isValid = false;
        } else if (!passwordResult.isValid) {
            showError('password', 'Password belum memenuhi persyaratan');
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            showError('confirm-password', 'Konfirmasi password wajib diisi');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirm-password', 'Password tidak cocok');
            isValid = false;
        }

        // Validate terms
        if (!terms) {
            showError('terms', 'Anda harus menyetujui syarat dan ketentuan');
            isValid = false;
        }

        // If valid, proceed with registration
        if (isValid) {
            const userData = {
                nama,
                npm,
                angkatan,
                email,
                whatsapp,
                password
            };

            console.log('Registration data:', userData);

            // Simulate successful registration
            alert('Registrasi berhasil! Silakan login untuk melanjutkan.');
            window.location.href = '/login.html';
        }
    });
});
