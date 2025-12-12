import { validateNPM } from "./shared.js";
import "./style.css";

// ---------- PROPOSAL PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('proposal-form');
    const trackInfoBox = document.getElementById('track-info-box');
    const partnerSection = document.getElementById('partner-section');
    const dosen2Section = document.getElementById('dosen2-section');
    const btnCancel = document.getElementById('btn-cancel');

    // Load track info
    loadTrackInfo();

    // Load user info from session
    loadUserInfo();

    // Cancel button
    btnCancel?.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang.')) {
            window.location.href = '/dashboard.html';
        }
    });

    // Clear errors on input
    setupErrorClearHandlers();

    // Form submission
    form?.addEventListener('submit', handleSubmit);

    // ---------- FUNCTIONS ----------

    function loadTrackInfo() {
        const trackData = sessionStorage.getItem('selectedTrack');

        if (!trackData) {
            trackInfoBox.innerHTML = `
        <div class="no-track-warning">
          <span class="warning-icon">⚠️</span>
          <div>
            <p><strong>Belum ada track yang dipilih</strong></p>
            <p>Silakan pilih track terlebih dahulu sebelum mengupload proposal.</p>
            <a href="/track.html" class="btn btn-outline btn-small">Pilih Track</a>
          </div>
        </div>
      `;
            return;
        }

        const track = JSON.parse(trackData);
        const trackName = getTrackDisplayName(track.track);
        const isProyek = track.type === 'proyek';
        const isInternship2 = track.track === 'internship-2';

        trackInfoBox.innerHTML = `
      <div class="track-info-display">
        <div class="track-info-icon">${isProyek ? '📋' : '🏢'}</div>
        <div class="track-info-details">
          <h3>${trackName}</h3>
          <p>${isProyek ? `Kelompok - Partner NPM: ${track.partnerNpm}` : `Individual - ${track.companyName}`}</p>
        </div>
        <a href="/track.html" class="btn btn-outline btn-small">Ganti</a>
      </div>
    `;

        // Show partner section for Proyek
        if (isProyek) {
            partnerSection.style.display = 'block';
            document.getElementById('prop-partner-npm').value = track.partnerNpm || '';
        }

        // Show dosen 2 for Internship 2
        if (isInternship2) {
            dosen2Section.style.display = 'block';
        }
    }

    function loadUserInfo() {
        const userName = sessionStorage.getItem('userName');
        const userNPM = sessionStorage.getItem('userNPM');

        if (userName) {
            document.getElementById('prop-nama').value = userName;
        }
        if (userNPM) {
            document.getElementById('prop-npm').value = userNPM;
        }
    }

    function setupErrorClearHandlers() {
        const fields = ['prop-nama', 'prop-npm', 'prop-judul', 'prop-dosen', 'prop-dosen2', 'prop-partner-nama', 'prop-link'];
        fields.forEach(fieldId => {
            document.getElementById(fieldId)?.addEventListener('input', () => clearError(fieldId));
            document.getElementById(fieldId)?.addEventListener('change', () => clearError(fieldId));
        });
    }

    function validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        let isValid = true;
        const trackData = sessionStorage.getItem('selectedTrack');

        if (!trackData) {
            alert('Silakan pilih track terlebih dahulu');
            window.location.href = '/track.html';
            return;
        }

        const track = JSON.parse(trackData);
        const isProyek = track.type === 'proyek';
        const isInternship2 = track.track === 'internship-2';

        // Get form values
        const nama = document.getElementById('prop-nama').value.trim();
        const npm = document.getElementById('prop-npm').value.trim();
        const judul = document.getElementById('prop-judul').value.trim();
        const deskripsi = document.getElementById('prop-deskripsi').value.trim();
        const dosen = document.getElementById('prop-dosen').value;
        const dosen2 = document.getElementById('prop-dosen2')?.value || '';
        const partnerNama = document.getElementById('prop-partner-nama')?.value.trim() || '';
        const partnerNpm = document.getElementById('prop-partner-npm')?.value.trim() || '';
        const proposalLink = document.getElementById('prop-link').value.trim();

        // Validate nama
        if (!nama) {
            showError('prop-nama', 'Nama wajib diisi');
            isValid = false;
        }

        // Validate NPM
        if (!npm) {
            showError('prop-npm', 'NPM wajib diisi');
            isValid = false;
        } else if (!validateNPM(npm)) {
            showError('prop-npm', 'NPM harus 10 digit angka');
            isValid = false;
        }

        // Validate judul
        if (!judul) {
            showError('prop-judul', 'Judul proposal wajib diisi');
            isValid = false;
        } else if (judul.length < 10) {
            showError('prop-judul', 'Judul minimal 10 karakter');
            isValid = false;
        }

        // Validate dosen
        if (!dosen) {
            showError('prop-dosen', 'Pilih dosen pembimbing');
            isValid = false;
        }

        // Validate dosen 2 for Internship 2
        if (isInternship2 && !dosen2) {
            showError('prop-dosen2', 'Pilih dosen pembimbing 2');
            isValid = false;
        }

        // Validate partner for Proyek
        if (isProyek && !partnerNama) {
            showError('prop-partner-nama', 'Nama partner wajib diisi');
            isValid = false;
        }

        // Validate proposal link
        if (!proposalLink) {
            showError('prop-link', 'Link proposal wajib diisi');
            isValid = false;
        } else if (!validateURL(proposalLink)) {
            showError('prop-link', 'Format link tidak valid');
            isValid = false;
        }

        if (isValid) {
            const proposalData = {
                track: track.track,
                trackType: track.type,
                nama,
                npm,
                judul,
                deskripsi,
                dosen,
                dosen2: isInternship2 ? dosen2 : null,
                partnerNama: isProyek ? partnerNama : null,
                partnerNpm: isProyek ? partnerNpm : null,
                proposalLink
            };

            console.log('Proposal data:', proposalData);

            // Store proposal in session (simulating backend)
            sessionStorage.setItem('proposalData', JSON.stringify(proposalData));

            alert('Proposal berhasil disubmit!\n\nProposal Anda akan direview oleh koordinator.');
            window.location.href = '/dashboard.html';
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

    function showError(fieldId, message) {
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

    function clearError(fieldId) {
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
});
