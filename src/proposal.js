// ========================================
// PROPOSAL PAGE (Clean Code Refactored)
// ========================================

import { validateNPM } from "./shared.js";
import { mahasiswaAPI } from "./api.js";
import { initPage, closeSidebar } from "./utils/pageInit.js";
import {
    showFieldError,
    clearFieldError,
    setupErrorClearOnInput,
    isValidURL,
    setButtonLoading,
    resetButtonLoading,
} from "./utils/formUtils.js";
import { getTrackDisplayName } from "./utils/formatUtils.js";
import { showToast, showModal } from "./utils/alerts.js";

// ---------- STATE ----------
let dosenList = [];

// ---------- CONSTANTS ----------
const FORM_FIELDS = ["prop-nama", "prop-npm", "prop-judul", "prop-dosen", "prop-dosen2", "prop-partner-nama", "prop-link"];

// ---------- PROPOSAL PAGE INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize page with sidebar
    const { isAuthenticated } = initPage({ activeMenu: "proposal" });
    if (!isAuthenticated) return;

    // Setup global closeSidebar
    window.closeSidebar = closeSidebar;

    // Load data - fetch from database
    await loadTrackInfo();
    await loadUserInfo();
    await loadDosenList();

    // Event listeners
    document.getElementById("btn-cancel")?.addEventListener("click", handleCancel);
    document.getElementById("proposal-form")?.addEventListener("submit", handleSubmit);

    // Setup error clearing
    setupErrorClearOnInput(FORM_FIELDS);
});

// ---------- DATA LOADING ----------
let profileData = null;
let kelompokData = null;

async function loadTrackInfo() {
    const trackInfoBox = document.getElementById("track-info-box");
    const partnerSection = document.getElementById("partner-section");
    const dosen2Section = document.getElementById("dosen2-section");

    trackInfoBox.innerHTML = '<p class="text-text-secondary text-sm">Loading track info...</p>';

    try {
        // Fetch profile data from database
        const result = await mahasiswaAPI.getProfile();

        if (!result.ok || !result.data.track) {
            trackInfoBox.innerHTML = renderNoTrackWarning();
            return;
        }

        profileData = result.data;
        const track = profileData.track;
        const trackName = getTrackDisplayName(track);
        const isProyek = track.startsWith('proyek');
        const isInternship2 = track === 'internship2';

        // Fetch kelompok data if proyek
        let partnerName = null;
        let partnerNpm = null;
        if (isProyek && profileData.kelompok_id) {
            try {
                const kelompokResult = await mahasiswaAPI.getMyKelompok();
                if (kelompokResult.ok && kelompokResult.data?.anggota) {
                    kelompokData = kelompokResult.data;
                    // Find partner (the other member)
                    const partner = kelompokData.anggota.find(m => m.id !== profileData.id);
                    if (partner) {
                        partnerName = partner.nama;
                        partnerNpm = partner.npm;
                    }
                }
            } catch (err) {
                console.log("Could not load kelompok data:", err);
            }
        }

        trackInfoBox.innerHTML = renderTrackInfo(track, trackName, isProyek, kelompokData?.kelompok?.nama);

        // Show partner section for Proyek and populate with database data
        if (isProyek) {
            partnerSection.classList.remove("hidden");
            // Set partner data from database
            if (partnerName) {
                document.getElementById("prop-partner-nama").value = partnerName;
                document.getElementById("prop-partner-nama").readOnly = true;
                document.getElementById("prop-partner-nama").classList.add("bg-slate-50", "text-text-secondary");
            }
            if (partnerNpm) {
                document.getElementById("prop-partner-npm").value = partnerNpm;
            }
        }

        // Show dosen 2 for Internship 2
        if (isInternship2) {
            dosen2Section.classList.remove("hidden");
        }
    } catch (err) {
        console.error("Error loading track info:", err);
        trackInfoBox.innerHTML = '<p class="text-red-500 text-sm">Error loading data</p>';
    }
}

async function loadUserInfo() {
    // Wait for profile to load if not already loaded
    if (!profileData) {
        try {
            const result = await mahasiswaAPI.getProfile();
            if (result.ok) {
                profileData = result.data;
            }
        } catch (err) {
            console.error("Error loading user info:", err);
            return;
        }
    }

    if (profileData) {
        const namaInput = document.getElementById("prop-nama");
        const npmInput = document.getElementById("prop-npm");

        if (namaInput && profileData.nama) {
            namaInput.value = profileData.nama;
            namaInput.readOnly = true;
            namaInput.classList.add("bg-slate-50", "text-text-secondary");
        }
        if (npmInput && profileData.npm) {
            npmInput.value = profileData.npm;
            npmInput.readOnly = true;
            npmInput.classList.add("bg-slate-50", "text-text-secondary");
        }
    }
}

async function loadDosenList() {
    try {
        const result = await mahasiswaAPI.getDosenList();
        if (result.ok && result.data) {
            dosenList = result.data;
            populateDosenDropdowns();
        }
    } catch (err) {
        console.error("Error loading dosen list:", err);
    }
}

function populateDosenDropdowns() {
    const dosenSelect = document.getElementById("prop-dosen");
    const dosen2Select = document.getElementById("prop-dosen2");

    const options = dosenList.map((d) => `<option value="${d.id}">${d.nama} ${d.nidn ? `(${d.nidn})` : ""}</option>`).join("");

    if (dosenSelect) {
        dosenSelect.innerHTML = '<option value="">-- Pilih Dosen Pembimbing --</option>' + options;
    }
    if (dosen2Select) {
        dosen2Select.innerHTML = '<option value="">-- Pilih Dosen Pembimbing 2 --</option>' + options;
    }
}

// ---------- RENDERING ----------
function renderNoTrackWarning() {
    return `
    <div class="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <span class="text-2xl">⚠️</span>
      <div class="flex-1">
        <p class="font-semibold text-yellow-800 text-sm lg:text-base">Belum ada track yang dipilih</p>
        <p class="text-yellow-700 text-xs lg:text-sm">Silakan pilih track terlebih dahulu sebelum mengupload proposal.</p>
      </div>
      <a href="/mahasiswa/track.html" class="px-4 py-2 bg-yellow-500 text-white text-xs lg:text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors">Pilih Track</a>
    </div>
  `;
}

function renderTrackInfo(track, trackName, isProyek, kelompokName = null) {
    const subtitle = isProyek
        ? (kelompokName ? `Kelompok: ${kelompokName}` : 'Kelompok belum terbentuk')
        : 'Individual';

    return `
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${isProyek ? "bg-blue-100" : "bg-purple-100"} flex items-center justify-center text-2xl lg:text-3xl shrink-0">
        ${isProyek ? "📋" : "🏢"}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-text-main text-base lg:text-lg">${trackName}</p>
        <p class="text-text-secondary text-xs lg:text-sm truncate">${subtitle}</p>
      </div>
    </div>
  `;
}

// ---------- EVENT HANDLERS ----------
async function handleCancel() {
    const confirmed = await showModal.confirm(
        "Batalkan?",
        "Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang.",
        "Ya, Batalkan",
        "Tidak"
    );
    if (confirmed) {
        window.location.href = "/mahasiswa/dashboard.html";
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const trackData = sessionStorage.getItem("selectedTrack");
    if (!trackData) {
        showToast.warning("Silakan pilih track terlebih dahulu");
        window.location.href = "/mahasiswa/track.html";
        return;
    }

    const track = JSON.parse(trackData);
    const formData = getFormData();

    // Validate
    if (!validateForm(formData, track)) return;

    // Submit
    const submitBtn = document.getElementById("btn-submit");
    setButtonLoading(submitBtn, "Mengirim...");

    try {
        const result = await mahasiswaAPI.submitProposal({
            judul_proyek: formData.judul,
            file_url: formData.proposalLink,
            usulan_dosen_id: formData.dosen || null,
        });

        if (result.ok) {
            saveToSession(formData, track);
            await showModal.success("Proposal Terkirim!", "Proposal Anda akan direview oleh koordinator.");
            window.location.href = "/mahasiswa/dashboard.html";
        } else {
            showModal.error("Gagal Submit", result.error || "Terjadi kesalahan saat mengirim proposal");
        }
    } catch (err) {
        console.error("Submit error:", err);
        showModal.error("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
        resetButtonLoading(submitBtn);
    }
}

// ---------- FORM HELPERS ----------
function getFormData() {
    return {
        nama: document.getElementById("prop-nama").value.trim(),
        npm: document.getElementById("prop-npm").value.trim(),
        judul: document.getElementById("prop-judul").value.trim(),
        deskripsi: document.getElementById("prop-deskripsi").value.trim(),
        dosen: document.getElementById("prop-dosen").value,
        dosen2: document.getElementById("prop-dosen2")?.value || "",
        partnerNama: document.getElementById("prop-partner-nama")?.value.trim() || "",
        partnerNpm: document.getElementById("prop-partner-npm")?.value.trim() || "",
        proposalLink: document.getElementById("prop-link").value.trim(),
    };
}

function validateForm(data, track) {
    let isValid = true;
    const isProyek = track.type === "proyek";
    const isInternship2 = track.track === "internship-2";

    if (!data.nama) {
        showFieldError("prop-nama", "Nama wajib diisi");
        isValid = false;
    }

    if (!data.npm) {
        showFieldError("prop-npm", "NPM wajib diisi");
        isValid = false;
    } else if (!validateNPM(data.npm)) {
        showFieldError("prop-npm", "NPM harus 10 digit angka");
        isValid = false;
    }

    if (!data.judul) {
        showFieldError("prop-judul", "Judul proposal wajib diisi");
        isValid = false;
    } else if (data.judul.length < 10) {
        showFieldError("prop-judul", "Judul minimal 10 karakter");
        isValid = false;
    }

    if (!data.dosen) {
        showFieldError("prop-dosen", "Pilih dosen pembimbing");
        isValid = false;
    }

    if (isInternship2 && !data.dosen2) {
        showFieldError("prop-dosen2", "Pilih dosen pembimbing 2");
        isValid = false;
    }

    if (isProyek && !data.partnerNama) {
        showFieldError("prop-partner-nama", "Nama partner wajib diisi");
        isValid = false;
    }

    if (!data.proposalLink) {
        showFieldError("prop-link", "Link proposal wajib diisi");
        isValid = false;
    } else if (!isValidURL(data.proposalLink)) {
        showFieldError("prop-link", "Format link tidak valid");
        isValid = false;
    }

    return isValid;
}

function saveToSession(data, track) {
    sessionStorage.setItem(
        "proposalData",
        JSON.stringify({
            track: track.track,
            trackType: track.type,
            judul: data.judul,
            deskripsi: data.deskripsi,
            dosen: data.dosen,
            proposalLink: data.proposalLink,
        })
    );
}
