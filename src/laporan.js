import "./style.css";

// ---------- LAPORAN PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('laporan-form');
    const btnCancel = document.getElementById('btn-cancel');

    // Check prerequisites
    checkPrerequisites();

    // Load existing data
    loadExistingData();

    // Cancel button
    btnCancel?.addEventListener('click', () => {
        window.location.href = '/dashboard.html';
    });

    // Clear errors on input
    ['lap-judul', 'lap-link'].forEach(fieldId => {
        document.getElementById(fieldId)?.addEventListener('input', () => {
            const errorEl = document.getElementById(`error-${fieldId}`);
            const inputEl = document.getElementById(fieldId);
            if (errorEl) errorEl.classList.remove('visible');
            if (inputEl) inputEl.classList.remove('input-error');
        });
    });

    // Form submission
    form?.addEventListener('submit', handleSubmit);

    // ---------- FUNCTIONS ----------

    function checkPrerequisites() {
        const proposalData = sessionStorage.getItem('proposalData');
        const sessions = JSON.parse(sessionStorage.getItem('bimbinganSessions') || '[]');

        const prereqProposal = document.getElementById('prereq-proposal');
        const prereqBimbingan = document.getElementById('prereq-bimbingan');

        // Check proposal
        if (proposalData) {
            prereqProposal.querySelector('.prereq-icon').textContent = '✅';
            prereqProposal.classList.add('completed');
        } else {
            prereqProposal.querySelector('.prereq-icon').textContent = '❌';
            prereqProposal.classList.add('pending');
        }

        // Check bimbingan
        if (sessions.length >= 8) {
            prereqBimbingan.querySelector('.prereq-icon').textContent = '✅';
            prereqBimbingan.classList.add('completed');
        } else {
            prereqBimbingan.querySelector('.prereq-icon').textContent = `${sessions.length}/8`;
            prereqBimbingan.classList.add('pending');
        }
    }

    function loadExistingData() {
        const proposalData = sessionStorage.getItem('proposalData');
        if (proposalData) {
            const proposal = JSON.parse(proposalData);
            document.getElementById('lap-judul').value = proposal.judul || '';
        }
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

        const judul = document.getElementById('lap-judul').value.trim();
        const abstrak = document.getElementById('lap-abstrak').value.trim();
        const link = document.getElementById('lap-link').value.trim();

        // Validate judul
        if (!judul) {
            showError('lap-judul', 'Judul wajib diisi');
            isValid = false;
        }

        // Validate link
        if (!link) {
            showError('lap-link', 'Link laporan wajib diisi');
            isValid = false;
        } else if (!validateURL(link)) {
            showError('lap-link', 'Format link tidak valid');
            isValid = false;
        }

        if (isValid) {
            const laporanData = {
                judul,
                abstrak,
                link,
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };

            console.log('Laporan data:', laporanData);
            sessionStorage.setItem('laporanData', JSON.stringify(laporanData));

            alert('Laporan berhasil disubmit!\n\nLaporan Anda akan direview oleh pembimbing.');
            window.location.href = '/dashboard.html';
        }
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
});
