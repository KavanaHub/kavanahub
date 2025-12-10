import "./style.css";

// ---------- VALIDATION HELPERS ----------
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateNPM(npm) {
    const re = /^\d+$/;  // Minimal 1 digit, bebas panjang
    return re.test(npm);
}

export function validateWhatsApp(number) {
    const re = /^(\+62|62|0)8[1-9][0-9]{7,10}$/;
    return re.test(number.replace(/[\s-]/g, ''));
}

export function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    };
}

// ---------- ERROR HELPERS ----------
export function showError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
    if (inputEl) {
        inputEl.classList.add('input-error');
    }
}

export function clearError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }
    if (inputEl) {
        inputEl.classList.remove('input-error');
    }
}

export function clearAllErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.classList.remove('visible');
    });
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
}

// ---------- NAVIGATION HELPER ----------
export function navigateTo(page) {
    window.location.href = page;
}

// ---------- ROLE CONFIG ----------
export const MENU_CONFIG = {
    mahasiswa: [
        { id: "dashboard", label: "Dashboard" },
        { id: "track", label: "Proyek & Internship" },
        { id: "bimbingan", label: "Bimbingan Online" },
        { id: "proposal", label: "Upload Proposal" },
        { id: "laporan", label: "Upload Laporan Sidang" },
        { id: "nilai", label: "Nilai & Hasil Akhir" },
        { id: "profile", label: "Profil Saya" },
        { id: "settings", label: "Pengaturan" },
    ],
    dosen: [
        { id: "dashboard", label: "Dashboard" },
        { id: "mahasiswa-bimbingan", label: "Mahasiswa Bimbingan" },
        { id: "bimbingan-approve", label: "Approve Bimbingan" },
        { id: "laporan-approve", label: "Approve Laporan Sidang" },
        { id: "nilai", label: "Input Nilai Sidang" },
        { id: "profile", label: "Profil Saya" },
        { id: "settings", label: "Pengaturan" },
    ],
    koordinator: [
        { id: "dashboard", label: "Dashboard" },
        { id: "validasi-proposal", label: "Validasi Proposal" },
        { id: "approve-pembimbing", label: "Approve Pembimbing" },
        { id: "daftar-mahasiswa", label: "Daftar Mahasiswa" },
        { id: "profile", label: "Profil Saya" },
        { id: "settings", label: "Pengaturan" },
    ],
    kaprodi: [
        { id: "dashboard", label: "Dashboard" },
        { id: "pilih-koordinator", label: "Pilih Koordinator" },
        { id: "daftar-dosen", label: "Daftar Dosen" },
        { id: "monitoring", label: "Monitoring Mahasiswa" },
        { id: "profile", label: "Profil Saya" },
        { id: "settings", label: "Pengaturan" },
    ],
};

export const ROLE_LABEL = {
    mahasiswa: "Mahasiswa",
    dosen: "Dosen Pembimbing",
    koordinator: "Koordinator",
    kaprodi: "Kepala Prodi",
};

export const TITLE_MAP = {
    dashboard: "Ringkasan Kegiatan",
    track: "Proyek & Internship",
    bimbingan: "Bimbingan Online",
    proposal: "Upload Proposal",
    laporan: "Upload Laporan Sidang",
    nilai: "Nilai & Hasil Akhir",
    profile: "Profil Saya",
    settings: "Pengaturan",
    "mahasiswa-bimbingan": "Mahasiswa Bimbingan",
    "bimbingan-approve": "Approve Bimbingan",
    "laporan-approve": "Approve Laporan Sidang",
    "validasi-proposal": "Validasi Proposal",
    "approve-pembimbing": "Approve Pembimbing",
    "daftar-mahasiswa": "Daftar Mahasiswa",
    "pilih-koordinator": "Pilih Koordinator",
    "daftar-dosen": "Daftar Dosen",
    monitoring: "Monitoring Mahasiswa",
};
