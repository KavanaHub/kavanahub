import "./style.css";

// ---------- STATE ----------
let sessions = JSON.parse(sessionStorage.getItem('bimbinganSessions')) || [];
let editingIndex = -1;

// ---------- BIMBINGAN PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('session-modal');
    const modalClose = document.getElementById('modal-close');
    const btnAddSession = document.getElementById('btn-add-session');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const sessionForm = document.getElementById('session-form');

    // Load info
    loadTrackInfo();
    loadPembimbingInfo();
    renderSessions();
    updateProgress();

    // Modal handlers
    btnAddSession?.addEventListener('click', () => openModal());
    modalClose?.addEventListener('click', closeModal);
    btnModalCancel?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    sessionForm?.addEventListener('submit', handleSubmit);

    // ---------- FUNCTIONS ----------

    function loadTrackInfo() {
        const trackInfoEl = document.getElementById('track-info');
        const trackData = sessionStorage.getItem('selectedTrack');

        if (!trackData) {
            trackInfoEl.innerHTML = `
        <div class="info-warning">
          <span>⚠️</span>
          <p>Belum ada track yang dipilih</p>
          <a href="/track.html" class="link">Pilih Track</a>
        </div>
      `;
            return;
        }

        const track = JSON.parse(trackData);
        const isProyek = track.type === 'proyek';

        trackInfoEl.innerHTML = `
      <div class="info-icon">${isProyek ? '📋' : '🏢'}</div>
      <div class="info-details">
        <h3>${getTrackDisplayName(track.track)}</h3>
        <p>${isProyek ? `Partner: ${track.partnerNpm}` : track.companyName}</p>
      </div>
    `;
    }

    function loadPembimbingInfo() {
        const pembimbingInfoEl = document.getElementById('pembimbing-info');
        const proposalData = sessionStorage.getItem('proposalData');

        if (!proposalData) {
            pembimbingInfoEl.innerHTML = `
        <div class="info-warning">
          <span>⚠️</span>
          <p>Belum ada proposal</p>
          <a href="/proposal.html" class="link">Upload Proposal</a>
        </div>
      `;
            return;
        }

        const proposal = JSON.parse(proposalData);
        const dosenNames = {
            'dosen-1': 'Dr. Ahmad Fauzi, M.Kom',
            'dosen-2': 'Dr. Budi Santoso, M.T.',
            'dosen-3': 'Prof. Citra Dewi, Ph.D',
            'dosen-4': 'Dr. Diana Putri, M.Sc',
            'dosen-5': 'Dr. Eko Prasetyo, M.Kom'
        };

        pembimbingInfoEl.innerHTML = `
      <div class="info-icon">👨‍🏫</div>
      <div class="info-details">
        <h3>Dosen Pembimbing</h3>
        <p>${dosenNames[proposal.dosen] || 'Belum ditentukan'}</p>
      </div>
    `;
    }

    function updateProgress() {
        const count = sessions.length;
        const percentage = (count / 8) * 100;

        document.getElementById('progress-text').textContent = `${count} / 8 Sesi`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;

        // Update dots
        const dotsContainer = document.getElementById('progress-dots');
        dotsContainer.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${i < count ? 'completed' : ''}`;
            dot.textContent = i + 1;
            dotsContainer.appendChild(dot);
        }

        // Disable add button if max reached
        const btnAdd = document.getElementById('btn-add-session');
        if (count >= 8) {
            btnAdd.disabled = true;
            btnAdd.textContent = 'Bimbingan Selesai ✓';
        }
    }

    function renderSessions() {
        const listEl = document.getElementById('sessions-list');

        if (sessions.length === 0) {
            listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Belum Ada Bimbingan</h3>
          <p>Klik tombol "Tambah Bimbingan" untuk mencatat sesi bimbingan pertama Anda</p>
        </div>
      `;
            return;
        }

        listEl.innerHTML = sessions.map((session, index) => `
      <div class="session-card">
        <div class="session-number">${index + 1}</div>
        <div class="session-content">
          <div class="session-header">
            <span class="session-date">${formatDate(session.date)}</span>
            <span class="session-topic">${session.topic}</span>
          </div>
          <p class="session-notes">${session.notes}</p>
          ${session.next ? `<p class="session-next"><strong>Rencana:</strong> ${session.next}</p>` : ''}
        </div>
        <div class="session-actions">
          <button class="btn btn-small btn-outline" onclick="editSession(${index})">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteSession(${index})">Hapus</button>
        </div>
      </div>
    `).join('');
    }

    function openModal(index = -1) {
        editingIndex = index;
        const modal = document.getElementById('session-modal');
        const form = document.getElementById('session-form');
        const title = document.getElementById('modal-title');

        form.reset();

        if (index >= 0 && sessions[index]) {
            title.textContent = `Edit Bimbingan ke-${index + 1}`;
            document.getElementById('session-date').value = sessions[index].date;
            document.getElementById('session-topic').value = sessions[index].topic;
            document.getElementById('session-notes').value = sessions[index].notes;
            document.getElementById('session-next').value = sessions[index].next || '';
        } else {
            title.textContent = `Tambah Bimbingan ke-${sessions.length + 1}`;
            document.getElementById('session-date').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('session-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        editingIndex = -1;
    }

    function handleSubmit(e) {
        e.preventDefault();

        const date = document.getElementById('session-date').value;
        const topic = document.getElementById('session-topic').value.trim();
        const notes = document.getElementById('session-notes').value.trim();
        const next = document.getElementById('session-next').value.trim();

        let isValid = true;

        if (!date) {
            showError('session-date', 'Tanggal wajib diisi');
            isValid = false;
        }
        if (!topic) {
            showError('session-topic', 'Topik wajib diisi');
            isValid = false;
        }
        if (!notes) {
            showError('session-notes', 'Catatan wajib diisi');
            isValid = false;
        }

        if (isValid) {
            const sessionData = { date, topic, notes, next };

            if (editingIndex >= 0) {
                sessions[editingIndex] = sessionData;
            } else {
                sessions.push(sessionData);
            }

            sessionStorage.setItem('bimbinganSessions', JSON.stringify(sessions));

            closeModal();
            renderSessions();
            updateProgress();
        }
    }

    // Global functions for inline handlers
    window.editSession = (index) => openModal(index);
    window.deleteSession = (index) => {
        if (confirm('Apakah Anda yakin ingin menghapus bimbingan ini?')) {
            sessions.splice(index, 1);
            sessionStorage.setItem('bimbinganSessions', JSON.stringify(sessions));
            renderSessions();
            updateProgress();
        }
    };

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }
});
