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
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "track", label: "Proyek & Internship", icon: "work" },
        { id: "kelompok", label: "Kelompok Proyek", icon: "groups" },
        { id: "bimbingan", label: "Bimbingan Online", icon: "chat" },
        { id: "proposal", label: "Upload Proposal", icon: "upload_file" },
        { id: "laporan", label: "Upload Laporan Sidang", icon: "description" },
        { id: "nilai", label: "Nilai & Hasil Akhir", icon: "school" },
        { id: "profile", label: "Profil Saya", icon: "person" },
        { id: "settings", label: "Pengaturan", icon: "settings" },
    ],
    dosen: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "mahasiswa-bimbingan", label: "Mahasiswa Bimbingan", icon: "groups" },
        { id: "bimbingan-approve", label: "Approve Bimbingan", icon: "check_circle" },
        { id: "laporan-approve", label: "Approve Laporan Sidang", icon: "grading" },
        { id: "profile", label: "Profil Saya", icon: "person" },
        { id: "settings", label: "Pengaturan", icon: "settings" },
    ],
    koordinator: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "kelola-periode", label: "Kelola Periode", icon: "event" },
        { id: "validasi-proposal", label: "Validasi Proposal", icon: "fact_check" },
        { id: "approve-pembimbing", label: "Assign Pembimbing", icon: "how_to_reg" },
        { id: "daftar-mahasiswa", label: "Daftar Mahasiswa", icon: "groups" },
        { id: "jadwal-sidang", label: "Jadwal Sidang", icon: "calendar_month" },
        // Dosen Pembimbing features (koordinator juga dosen)
        { id: "separator", label: "Dosen Pembimbing", icon: "" },
        { id: "mahasiswa-bimbingan", label: "Mahasiswa Bimbingan", icon: "school" },
        { id: "bimbingan-approve", label: "Approve Bimbingan", icon: "task_alt" },
        { id: "laporan-approve", label: "Approve Laporan", icon: "grading" },
        { id: "profile", label: "Profil Saya", icon: "person" },
        { id: "settings", label: "Pengaturan", icon: "settings" },
    ],
    kaprodi: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "kelola-koordinator", label: "Kelola Koordinator", icon: "assignment_ind" },
        { id: "daftar-dosen", label: "Daftar Dosen", icon: "group" },
        { id: "monitoring", label: "Monitoring Mahasiswa", icon: "monitoring" },
        { id: "profile", label: "Profil Saya", icon: "person" },
        { id: "settings", label: "Pengaturan", icon: "settings" },
    ],
    admin: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "kelola-users", label: "Kelola Users", icon: "manage_accounts" },
        { id: "monitoring", label: "Monitoring Sistem", icon: "monitoring" },
        { id: "laporan", label: "Laporan Sistem", icon: "summarize" },
        { id: "settings", label: "Pengaturan Sistem", icon: "settings" },
    ],
};

export const ROLE_LABEL = {
    mahasiswa: "Mahasiswa",
    dosen: "Dosen Pembimbing",
    koordinator: "Koordinator",
    kaprodi: "Kepala Prodi",
    admin: "Administrator",
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
