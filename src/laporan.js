// ========================================
// LAPORAN PAGE (Clean Code Refactored)
// ========================================

import { mahasiswaAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { showFieldError, clearFieldError, isValidURL, setButtonLoading, resetButtonLoading } from "./utils/formUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- CONSTANTS ----------
const FORM_FIELDS = ["lap-judul", "lap-link"];

// ---------- LAPORAN PAGE INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize page with sidebar
    const { isAuthenticated } = initPage({ activeMenu: "laporan" });
    if (!isAuthenticated) return;

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    // Check if laporan already submitted - redirect if so
    const hasExistingLaporan = await checkExistingLaporan();
    if (hasExistingLaporan) return;

    // Load data
    await checkPrerequisites();
    loadExistingData();

    // Event listeners
    document.getElementById("btn-cancel")?.addEventListener("click", () => (window.location.href = "/mahasiswa/dashboard.html"));
    document.getElementById("laporan-form")?.addEventListener("submit", handleSubmit);

    // Setup error clearing
    FORM_FIELDS.forEach((fieldId) => {
        document.getElementById(fieldId)?.addEventListener("input", () => clearFieldError(fieldId));
    });
});

// ---------- CHECK EXISTING LAPORAN ----------
async function checkExistingLaporan() {
    try {
        const result = await mahasiswaAPI.getMyLaporan();
        if (result.ok && result.data && result.data.length > 0) {
            const latestLaporan = result.data[0];
            // If laporan exists and is pending/submitted/approved, redirect
            if (['pending', 'submitted', 'approved'].includes(latestLaporan.status)) {
                await showModal.info(
                    "Laporan Sudah Disubmit",
                    `Laporan Anda sudah disubmit dengan status: ${latestLaporan.status}. Silakan cek di halaman Hasil Sidang.`
                );
                window.location.href = "/mahasiswa/hasil.html";
                return true;
            }
            // If revision/rejected, allow resubmit (don't redirect)
        }
        return false;
    } catch (err) {
        console.error("Error checking existing laporan:", err);
        return false;
    }
}

// ---------- PREREQUISITES CHECK ----------
async function checkPrerequisites() {
    const prereqProposal = document.getElementById("prereq-proposal");
    const prereqBimbingan = document.getElementById("prereq-bimbingan");

    try {
        // Check proposal from API
        const profileResult = await mahasiswaAPI.getProfile();
        updatePrereqCard(
            prereqProposal,
            profileResult.ok && profileResult.data.status_proposal === "approved",
            '<span class="material-symbols-outlined text-[18px]">check_circle</span>',
            '<span class="material-symbols-outlined text-[18px]">cancel</span>',
            "green",
            "red"
        );

        // Check bimbingan from API
        const bimbinganResult = await mahasiswaAPI.getMyBimbingan();
        const approvedCount = bimbinganResult.ok ? bimbinganResult.data.filter((b) => b.status === "approved").length : 0;
        const isComplete = approvedCount >= 8;

        if (isComplete) {
            updatePrereqCard(prereqBimbingan, true, '<span class="material-symbols-outlined text-[18px]">check_circle</span>', "", "green", "");
        } else {
            prereqBimbingan.querySelector(".prereq-icon").innerHTML = `<span class="text-yellow-600 font-bold">${approvedCount}/8</span>`;
            prereqBimbingan.classList.remove("bg-slate-50", "border-slate-100");
            prereqBimbingan.classList.add("bg-yellow-50", "border-yellow-200");
        }
    } catch (err) {
        console.error("Error checking prerequisites:", err);
    }
}

function updatePrereqCard(element, isComplete, successIcon, failIcon, successColor, failColor) {
    if (!element) return;

    const icon = element.querySelector(".prereq-icon");
    if (isComplete) {
        icon.textContent = successIcon;
        element.classList.remove("bg-slate-50", "border-slate-100");
        element.classList.add(`bg-${successColor}-50`, `border-${successColor}-200`);
    } else {
        icon.textContent = failIcon;
        element.classList.remove("bg-slate-50", "border-slate-100");
        element.classList.add(`bg-${failColor}-50`, `border-${failColor}-200`);
    }
}

// ---------- DATA LOADING ----------
function loadExistingData() {
    const proposalData = sessionStorage.getItem("proposalData");
    if (proposalData) {
        const proposal = JSON.parse(proposalData);
        const judulInput = document.getElementById("lap-judul");
        if (judulInput) judulInput.value = proposal.judul || "";
    }
}

// ---------- FORM SUBMISSION ----------
async function handleSubmit(e) {
    e.preventDefault();

    const judul = document.getElementById("lap-judul").value.trim();
    const abstrak = document.getElementById("lap-abstrak").value.trim();
    const link = document.getElementById("lap-link").value.trim();

    // Validation
    if (!validateForm(judul, link)) return;

    const submitBtn = document.getElementById("btn-submit");
    setButtonLoading(submitBtn, "Mengirim...");

    try {
        const result = await mahasiswaAPI.submitLaporan({
            judul,
            file_url: link,
        });

        if (result.ok) {
            sessionStorage.setItem(
                "laporanData",
                JSON.stringify({
                    judul,
                    abstrak,
                    link,
                    submittedAt: new Date().toISOString(),
                    status: "pending",
                })
            );

            await showModal.success("Laporan Terkirim!", "Laporan Anda akan direview oleh pembimbing.");
            window.location.href = "/mahasiswa/dashboard.html";
        } else {
            showModal.error("Gagal Submit", result.error || "Terjadi kesalahan");
        }
    } catch (err) {
        console.error("Submit error:", err);
        showModal.error("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
        resetButtonLoading(submitBtn);
    }
}

function validateForm(judul, link) {
    let isValid = true;

    if (!judul) {
        showFieldError("lap-judul", "Judul wajib diisi");
        isValid = false;
    }

    if (!link) {
        showFieldError("lap-link", "Link laporan wajib diisi");
        isValid = false;
    } else if (!isValidURL(link)) {
        showFieldError("lap-link", "Format link tidak valid");
        isValid = false;
    }

    return isValid;
}
