import { validateNPM } from "./shared.js";
import "./style.css";

// ---------- STATE ----------
let selectedTrack = null;
let selectedType = null;

// ---------- TRACK PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('track-modal');
    const modalClose = document.getElementById('modal-close');
    const btnCancel = document.getElementById('btn-cancel');
    const btnConfirm = document.getElementById('btn-confirm');
    const trackCards = document.querySelectorAll('.track-card');

    // Track card click handlers
    trackCards.forEach(card => {
        const btn = card.querySelector('.track-select-btn');
        btn?.addEventListener('click', () => {
            selectedTrack = card.dataset.track;
            selectedType = card.dataset.type;
            openModal(card);
        });
    });

    // Modal handlers
    modalClose?.addEventListener('click', closeModal);
    btnCancel?.addEventListener('click', closeModal);

    // Close modal on outside click
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Confirm selection
    btnConfirm?.addEventListener('click', confirmSelection);

    // Clear errors on input
    document.getElementById('partner-npm')?.addEventListener('input', () => {
        document.getElementById('error-partner-npm')?.classList.remove('visible');
        document.getElementById('partner-npm')?.classList.remove('input-error');
    });

    document.getElementById('company-name')?.addEventListener('input', () => {
        document.getElementById('error-company-name')?.classList.remove('visible');
        document.getElementById('company-name')?.classList.remove('input-error');
    });
});

// ---------- MODAL FUNCTIONS ----------
function openModal(card) {
    const modal = document.getElementById('track-modal');
    const modalTitle = document.getElementById('modal-title');
    const selectedIcon = document.getElementById('selected-icon');
    const selectedName = document.getElementById('selected-track-name');
    const selectedTypeText = document.getElementById('selected-track-type');
    const teamSection = document.getElementById('team-section');
    const companySection = document.getElementById('company-section');

    // Get track info from card
    const trackName = card.querySelector('h3').textContent;
    const trackType = card.dataset.type;

    // Update modal content
    selectedName.textContent = trackName;

    if (trackType === 'proyek') {
        selectedIcon.textContent = '📋';
        selectedTypeText.textContent = 'Proyek - 2 Orang per Kelompok';
        teamSection.style.display = 'block';
        companySection.style.display = 'none';
    } else {
        selectedIcon.textContent = '🏢';
        selectedTypeText.textContent = 'Internship - Individual';
        teamSection.style.display = 'none';
        companySection.style.display = 'block';
    }

    // Clear previous inputs
    document.getElementById('partner-npm').value = '';
    document.getElementById('company-name').value = '';
    document.getElementById('company-address').value = '';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('track-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedTrack = null;
    selectedType = null;
}

function confirmSelection() {
    let isValid = true;

    if (selectedType === 'proyek') {
        // Validate partner NPM
        const partnerNpm = document.getElementById('partner-npm').value.trim();
        const errorEl = document.getElementById('error-partner-npm');
        const inputEl = document.getElementById('partner-npm');

        if (!partnerNpm) {
            errorEl.textContent = 'NPM partner wajib diisi';
            errorEl.classList.add('visible');
            inputEl.classList.add('input-error');
            isValid = false;
        } else if (!validateNPM(partnerNpm)) {
            errorEl.textContent = 'NPM harus 10 digit angka';
            errorEl.classList.add('visible');
            inputEl.classList.add('input-error');
            isValid = false;
        }

        if (isValid) {
            // Save selection
            const trackData = {
                track: selectedTrack,
                type: selectedType,
                partnerNpm: partnerNpm
            };

            sessionStorage.setItem('selectedTrack', JSON.stringify(trackData));
            console.log('Track selected:', trackData);

            alert(`Anda telah memilih ${getTrackDisplayName(selectedTrack)}.\nPartner NPM: ${partnerNpm}`);
            window.location.href = '/dashboard.html';
        }
    } else {
        // Validate company info for internship
        const companyName = document.getElementById('company-name').value.trim();
        const companyAddress = document.getElementById('company-address').value.trim();
        const errorEl = document.getElementById('error-company-name');
        const inputEl = document.getElementById('company-name');

        if (!companyName) {
            errorEl.textContent = 'Nama perusahaan wajib diisi';
            errorEl.classList.add('visible');
            inputEl.classList.add('input-error');
            isValid = false;
        }

        if (isValid) {
            // Save selection
            const trackData = {
                track: selectedTrack,
                type: selectedType,
                companyName: companyName,
                companyAddress: companyAddress
            };

            sessionStorage.setItem('selectedTrack', JSON.stringify(trackData));
            console.log('Track selected:', trackData);

            alert(`Anda telah memilih ${getTrackDisplayName(selectedTrack)}.\nPerusahaan: ${companyName}`);
            window.location.href = '/dashboard.html';
        }
    }
}

function getTrackDisplayName(track) {
    const names = {
        'proyek-1': 'Proyek 1',
        'proyek-2': 'Proyek 2',
        'proyek-3': 'Proyek 3',
        'internship-1': 'Internship 1',
        'internship-2': 'Internship 2'
    };
    return names[track] || track;
}
