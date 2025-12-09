import { validateEmail, validateNPM } from "./shared.js";
import "./style.css";

// ---------- LOGIN PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const passwordInput = document.getElementById('login-password');
    const togglePasswordBtn = document.getElementById('toggle-login-password');
    const forgotPasswordLink = document.getElementById('link-forgot-password');

    // Forgot password (placeholder)
    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Fitur lupa password akan segera hadir. Silakan hubungi admin untuk reset password.');
    });

    // Toggle password visibility
    togglePasswordBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePasswordBtn.textContent = type === 'password' ? '👁' : '🙈';
    });

    // Clear error on input
    document.getElementById('login-identifier')?.addEventListener('input', () => {
        const errorEl = document.getElementById('error-login-identifier');
        const inputEl = document.getElementById('login-identifier');
        if (errorEl) errorEl.classList.remove('visible');
        if (inputEl) inputEl.classList.remove('input-error');
    });

    document.getElementById('login-password')?.addEventListener('input', () => {
        const errorEl = document.getElementById('error-login-password');
        const inputEl = document.getElementById('login-password');
        if (errorEl) errorEl.classList.remove('visible');
        if (inputEl) inputEl.classList.remove('input-error');
    });

    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        // Get form data
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('login-remember').checked;

        // Detect if identifier is email or NPM
        const isEmail = identifier.includes('@');
        const isNPM = /^\d+$/.test(identifier);

        // Validate identifier (email or NPM)
        const identifierErrorEl = document.getElementById('error-login-identifier');
        const identifierInputEl = document.getElementById('login-identifier');

        if (!identifier) {
            if (identifierErrorEl) {
                identifierErrorEl.textContent = 'Email atau NPM wajib diisi';
                identifierErrorEl.classList.add('visible');
            }
            if (identifierInputEl) identifierInputEl.classList.add('input-error');
            isValid = false;
        } else if (isEmail && !validateEmail(identifier)) {
            if (identifierErrorEl) {
                identifierErrorEl.textContent = 'Format email tidak valid';
                identifierErrorEl.classList.add('visible');
            }
            if (identifierInputEl) identifierInputEl.classList.add('input-error');
            isValid = false;
        } else if (isNPM && !validateNPM(identifier)) {
            if (identifierErrorEl) {
                identifierErrorEl.textContent = 'NPM harus 10 digit angka';
                identifierErrorEl.classList.add('visible');
            }
            if (identifierInputEl) identifierInputEl.classList.add('input-error');
            isValid = false;
        } else if (!isEmail && !isNPM) {
            if (identifierErrorEl) {
                identifierErrorEl.textContent = 'Masukkan email yang valid atau NPM (10 digit angka)';
                identifierErrorEl.classList.add('visible');
            }
            if (identifierInputEl) identifierInputEl.classList.add('input-error');
            isValid = false;
        }

        // Validate password
        const passwordErrorEl = document.getElementById('error-login-password');
        const passwordInputEl = document.getElementById('login-password');

        if (!password) {
            if (passwordErrorEl) {
                passwordErrorEl.textContent = 'Password wajib diisi';
                passwordErrorEl.classList.add('visible');
            }
            if (passwordInputEl) passwordInputEl.classList.add('input-error');
            isValid = false;
        }

        // If valid, proceed with login
        if (isValid) {
            const loginData = {
                loginType: isEmail ? 'email' : 'npm',
                identifier,
                password,
                remember
            };

            console.log('Login data:', loginData);

            // Store user data in sessionStorage
            sessionStorage.setItem('userRole', 'mahasiswa');
            sessionStorage.setItem('userName', 'User');
            sessionStorage.setItem('userEmail', isEmail ? identifier : '');
            sessionStorage.setItem('userNPM', isNPM ? identifier : '');

            // Simulate successful login
            alert('Login berhasil! Selamat datang di Kavana.');
            window.location.href = '/dashboard.html';
        }
    });
});
