// ========================================
// TRACK PAGE (Clean Code Refactored)
// ========================================

import { validateNPM } from "./shared.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import { showFieldError, clearFieldError } from "./utils/formUtils.js";
import { getTrackDisplayName } from "./utils/formatUtils.js";
import { showToast, showModal } from "./utils/alerts.js";
import { mahasiswaAPI } from "./api.js";

// ---------- STATE ----------
let selectedTrack = null;
let selectedType = null;
let studentSemester = null;
let activeJadwal = [];

// ---------- SEMESTER TO TRACK MAPPING ----------
const SEMESTER_TRACK_MAP = {
    2: "proyek-1",
    3: "proyek-2",
    5: "proyek-3",
    7: "internship-1",
    8: "internship-2"
};

const SEMESTER_LABELS = {
    2: "Proyek 1 (Semester 2)",
    3: "Proyek 2 (Semester 3)",
    5: "Proyek 3 (Semester 5)",
    7: "Internship 1 (Semester 7)",
    8: "Internship 2 (Semester 8)"
};

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
    noTrackMessage: document.getElementById("no-track-message"),
    noTrackTitle: document.getElementById("no-track-title"),
    noTrackDescription: document.getElementById("no-track-description"),
    trackCategories: document.getElementById("track-categories"),
});

// ---------- TRACK PAGE INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize page with sidebar
    initPage({ activeMenu: "track" });

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    // Load semester and filter tracks
    await initializeTrackVisibility();

    const elements = getElements();

    // Track card click handlers (only for visible cards)
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

// ---------- SEMESTER CALCULATION ----------
/**
 * Calculate student's current semester based on angkatan
 * Academic year: Oct-Feb (odd semester), Mar-Sep (even semester)
 */
function calculateSemester(angkatan) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Calculate academic years since entry
    // Entry year starts in October
    let yearsSinceEntry = currentYear - angkatan;

    // Determine which semester within the academic year
    // Oct-Feb = Odd semester (1st semester of that academic year)
    // Mar-Sep = Even semester (2nd semester of that academic year)
    let semester;

    if (currentMonth >= 10) {
        // October onwards = start of new odd semester
        semester = (yearsSinceEntry * 2) + 1;
    } else if (currentMonth >= 3 && currentMonth <= 9) {
        // March-September = even semester
        semester = yearsSinceEntry * 2;
    } else {
        // January-February = still in odd semester (started last October)
        semester = ((yearsSinceEntry - 1) * 2) + 1;
    }

    // Ensure minimum semester is 1
    return Math.max(1, semester);
}

// ---------- TRACK VISIBILITY LOGIC ----------
async function initializeTrackVisibility() {
    const elements = getElements();

    try {
        // Use the mahasiswa periode-aktif endpoint - it calculates semester and checks jadwal
        const result = await mahasiswaAPI.getPeriodeAktif();

        if (result.ok) {
            const data = result.data;
            studentSemester = data.semester;

            console.log("[Track] Student semester:", studentSemester);
            console.log("[Track] Active periode:", data.active ? data.periode : "None");

            if (data.active && data.periode) {
                // There's an active periode for this semester
                activeJadwal = [data.periode];
            } else {
                activeJadwal = [];
            }
        } else {
            console.error("Failed to get periode aktif:", result.error);
            studentSemester = null;
            activeJadwal = [];
        }
    } catch (err) {
        console.error("Error fetching periode aktif:", err);
        // Fallback: calculate manually
        const angkatan = parseInt(sessionStorage.getItem("userAngkatan")) || null;
        if (angkatan) {
            studentSemester = calculateSemester(angkatan);
        }
        activeJadwal = [];
    }

    // Filter and display tracks
    filterTracksBasedOnSemester(elements);
}


function filterTracksBasedOnSemester(elements) {
    const trackCards = elements.trackCards;
    const trackCategories = elements.trackCategories;
    const noTrackMessage = elements.noTrackMessage;

    // Check if student semester has a track
    const hasTrackForSemester = SEMESTER_TRACK_MAP.hasOwnProperty(studentSemester);

    // Check if there's an active jadwal for student's semester
    const activeJadwalForSemester = activeJadwal.find(
        j => parseInt(j.semester) === studentSemester
    );

    let visibleTrackCount = 0;

    // Hide all track cards first, then show only matching ones
    trackCards.forEach(card => {
        const cardSemester = parseInt(card.dataset.semester);

        if (cardSemester === studentSemester && activeJadwalForSemester) {
            // Show this track - it matches student semester AND has active jadwal
            card.classList.remove("hidden");
            card.style.display = "";
            visibleTrackCount++;
        } else {
            // Hide this track
            card.classList.add("hidden");
            card.style.display = "none";
        }
    });

    // Hide empty sections
    document.querySelectorAll(".track-category").forEach(category => {
        const visibleCards = category.querySelectorAll(".track-card:not(.hidden)");
        if (visibleCards.length === 0) {
            category.classList.add("hidden");
        } else {
            category.classList.remove("hidden");
        }
    });

    // Show appropriate message
    if (visibleTrackCount === 0) {
        trackCategories.classList.add("hidden");
        noTrackMessage.classList.remove("hidden");

        // Customize message based on reason
        if (!hasTrackForSemester) {
            // Semesters without projects (1, 4, 6)
            elements.noTrackTitle.textContent = "Tidak Ada Proyek di Semester Ini";
            elements.noTrackDescription.textContent =
                `Semester ${studentSemester} tidak memiliki proyek atau internship yang harus diambil. ` +
                `Semester dengan proyek: 2 (Proyek 1), 3 (Proyek 2), 5 (Proyek 3), 7 (Internship 1), 8 (Internship 2).`;
        } else {
            // Has track for semester but no active jadwal
            const trackLabel = SEMESTER_LABELS[studentSemester] || `Semester ${studentSemester}`;
            elements.noTrackTitle.textContent = "Periode Proyek Belum Dibuka";
            elements.noTrackDescription.textContent =
                `Koordinator belum membuka periode untuk ${trackLabel}. ` +
                `Silakan tunggu pengumuman atau hubungi koordinator.`;
        }
    } else {
        trackCategories.classList.remove("hidden");
        noTrackMessage.classList.add("hidden");
    }
}

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
    const displayName = getTrackDisplayName(trackData.track);

    try {
        // Convert track format: "proyek-1" -> "proyek1"
        const trackValue = trackData.track.replace("-", "");

        // Save to backend API
        const result = await mahasiswaAPI.setTrack(trackValue);

        if (!result.ok) {
            await showModal.error("Gagal Memilih Track", result.error || "Terjadi kesalahan saat menyimpan track");
            return;
        }

        // Save to sessionStorage for quick access
        sessionStorage.setItem("selectedTrack", JSON.stringify(trackData));
        sessionStorage.setItem("userTrack", trackValue);
        console.log("Track saved to backend:", trackData);

        const details =
            trackData.type === "proyek" ? `Partner NPM: ${trackData.partnerNpm}` : `Perusahaan: ${trackData.companyName}`;

        await showModal.success(`${displayName} Dipilih!`, details);
        window.location.href = "/mahasiswa/dashboard.html";

    } catch (err) {
        console.error("Error saving track:", err);
        await showModal.error("Kesalahan Jaringan", "Tidak dapat menyimpan track. Silakan coba lagi.");
    }
}
