// ========================================
// TRACK PAGE (Clean Code Refactored)
// ========================================

import { validateNPM } from "./shared.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { showFieldError, clearFieldError } from "./utils/formUtils.js";
import { getTrackDisplayName } from "./utils/formatUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let selectedTrack = null;
let selectedType = null;

// ---------- DOM SELECTORS ----------
const getElements = () => ({
    modal: document.getElementById("track-modal"),
    modalClose: document.getElementById("modal-close"),
    btnCancel: document.getElementById("btn-cancel"),
    btnConfirm: document.getElementById("btn-confirm"),
    trackCards: document.querySelectorAll(".track-card"),
    selectedIcon: document.getElementById("selected-icon"),
    selectedName: document.getElementById("selected-track-name"),
    selectedType: document.getElementById("selected-track-type"),
    teamSection: document.getElementById("team-section"),
    companySection: document.getElementById("company-section"),
});

// ---------- TRACK PAGE INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    // Initialize page with sidebar
    initPage({ activeMenu: "track" });

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    const elements = getElements();

    // Track card click handlers
    elements.trackCards.forEach((card) => {
        const btn = card.querySelector(".track-select-btn");
        btn?.addEventListener("click", () => {
            selectedTrack = card.dataset.track;
            selectedType = card.dataset.type;
            openModal(card);
        });
    });

    // Modal handlers
    elements.modalClose?.addEventListener("click", closeModal);
    elements.btnCancel?.addEventListener("click", closeModal);
    elements.modal?.addEventListener("click", (e) => e.target === elements.modal && closeModal());
    elements.btnConfirm?.addEventListener("click", confirmSelection);

    // Clear errors on input
    setupErrorClearing();
});

// ---------- ERROR HANDLING ----------
function setupErrorClearing() {
    document.getElementById("partner-npm")?.addEventListener("input", () => clearFieldError("partner-npm"));
    document.getElementById("company-name")?.addEventListener("input", () => clearFieldError("company-name"));
}

// ---------- MODAL FUNCTIONS ----------
function openModal(card) {
    const elements = getElements();

    // Get track info from card
    const trackName = card.querySelector("h4").textContent;
    const trackType = card.dataset.type;

    // Update modal content
    elements.selectedName.textContent = trackName;

    if (trackType === "proyek") {
        elements.selectedIcon.textContent = "📋";
        elements.selectedType.textContent = "Proyek - 2 Orang per Kelompok";
        elements.teamSection.classList.remove("hidden");
        elements.companySection.classList.add("hidden");
    } else {
        elements.selectedIcon.textContent = "🏢";
        elements.selectedType.textContent = "Internship - Individual";
        elements.teamSection.classList.add("hidden");
        elements.companySection.classList.remove("hidden");
    }

    // Clear previous inputs
    document.getElementById("partner-npm").value = "";
    document.getElementById("company-name").value = "";
    document.getElementById("company-address").value = "";

    // Show modal
    elements.modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("track-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    selectedTrack = null;
    selectedType = null;
}

function confirmSelection() {
    if (selectedType === "proyek") {
        confirmProyekSelection();
    } else {
        confirmInternshipSelection();
    }
}

function confirmProyekSelection() {
    const partnerNpm = document.getElementById("partner-npm").value.trim();

    if (!partnerNpm) {
        showFieldError("partner-npm", "NPM partner wajib diisi");
        return;
    }

    if (!validateNPM(partnerNpm)) {
        showFieldError("partner-npm", "NPM tidak valid");
        return;
    }

    const trackData = {
        track: selectedTrack,
        type: selectedType,
        partnerNpm: partnerNpm,
    };

    saveAndRedirect(trackData);
}

function confirmInternshipSelection() {
    const companyName = document.getElementById("company-name").value.trim();
    const companyAddress = document.getElementById("company-address").value.trim();

    if (!companyName) {
        showFieldError("company-name", "Nama perusahaan wajib diisi");
        return;
    }

    const trackData = {
        track: selectedTrack,
        type: selectedType,
        companyName: companyName,
        companyAddress: companyAddress,
    };

    saveAndRedirect(trackData);
}

async function saveAndRedirect(trackData) {
    sessionStorage.setItem("selectedTrack", JSON.stringify(trackData));
    console.log("Track selected:", trackData);

    const displayName = getTrackDisplayName(trackData.track);
    const details =
        trackData.type === "proyek" ? `Partner NPM: ${trackData.partnerNpm}` : `Perusahaan: ${trackData.companyName}`;

    await showModal.success(`${displayName} Dipilih!`, details);
    window.location.href = "/mahasiswa/dashboard.html";
}
