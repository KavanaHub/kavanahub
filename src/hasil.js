import "./style.css";

// ---------- HASIL PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    loadSummary();
    loadPembimbingInfo();
});

function loadStatus() {
    const proposalData = sessionStorage.getItem('proposalData');
    const sessions = JSON.parse(sessionStorage.getItem('bimbinganSessions') || '[]');
    const laporanData = sessionStorage.getItem('laporanData');

    const statusBadge = document.getElementById('status-badge');
    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-desc');
    const nilaiSection = document.getElementById('nilai-section');

    // Determine status
    if (!proposalData) {
        statusBadge.textContent = 'Belum Mulai';
        statusBadge.className = 'status-badge pending';
        statusTitle.textContent = 'Proposal Belum Disubmit';
        statusDesc.textContent = 'Silakan upload proposal terlebih dahulu';
    } else if (sessions.length < 8) {
        statusBadge.textContent = 'Dalam Proses';
        statusBadge.className = 'status-badge in-progress';
        statusTitle.textContent = 'Bimbingan Berlangsung';
        statusDesc.textContent = `Progress bimbingan: ${sessions.length}/8 sesi`;
    } else if (!laporanData) {
        statusBadge.textContent = 'Siap Sidang';
        statusBadge.className = 'status-badge ready';
        statusTitle.textContent = 'Bimbingan Selesai';
        statusDesc.textContent = 'Silakan upload laporan sidang untuk melanjutkan';
    } else {
        statusBadge.textContent = 'Menunggu Sidang';
        statusBadge.className = 'status-badge waiting';
        statusTitle.textContent = 'Laporan Submitted';
        statusDesc.textContent = 'Menunggu jadwal sidang dari koordinator';

        // Demo: Show nilai if all complete (simulated)
        // In real app, this would come from backend after sidang
    }
}

function loadSummary() {
    const proposalData = sessionStorage.getItem('proposalData');
    const sessions = JSON.parse(sessionStorage.getItem('bimbinganSessions') || '[]');
    const laporanData = sessionStorage.getItem('laporanData');

    // Proposal status
    const proposalStatus = document.getElementById('proposal-status');
    if (proposalData) {
        const proposal = JSON.parse(proposalData);
        proposalStatus.textContent = proposal.judul ? 'Disubmit ✓' : 'Disubmit';
        document.getElementById('summary-proposal').classList.add('completed');
    } else {
        proposalStatus.innerHTML = '<a href="/proposal.html">Upload Proposal</a>';
    }

    // Bimbingan status
    const bimbinganStatus = document.getElementById('bimbingan-status');
    bimbinganStatus.textContent = `${sessions.length} / 8 Sesi`;
    if (sessions.length >= 8) {
        document.getElementById('summary-bimbingan').classList.add('completed');
    } else {
        bimbinganStatus.innerHTML = `${sessions.length}/8 - <a href="/bimbingan.html">Lanjutkan</a>`;
    }

    // Laporan status
    const laporanStatus = document.getElementById('laporan-status');
    if (laporanData) {
        laporanStatus.textContent = 'Disubmit ✓';
        document.getElementById('summary-laporan').classList.add('completed');
    } else if (sessions.length >= 8) {
        laporanStatus.innerHTML = '<a href="/laporan.html">Upload Laporan</a>';
    } else {
        laporanStatus.textContent = 'Selesaikan bimbingan';
    }

    // Sidang status
    const sidangStatus = document.getElementById('sidang-status');
    sidangStatus.textContent = 'Belum dijadwalkan';
}

function loadPembimbingInfo() {
    const pembimbingCard = document.getElementById('pembimbing-card');
    const proposalData = sessionStorage.getItem('proposalData');

    if (!proposalData) {
        pembimbingCard.innerHTML = `
      <p class="text-muted">Belum ada pembimbing yang ditentukan</p>
    `;
        return;
    }

    const proposal = JSON.parse(proposalData);
    const dosenNames = {
        'dosen-1': { name: 'Dr. Ahmad Fauzi, M.Kom', wa: '081234567890' },
        'dosen-2': { name: 'Dr. Budi Santoso, M.T.', wa: '081234567891' },
        'dosen-3': { name: 'Prof. Citra Dewi, Ph.D', wa: '081234567892' },
        'dosen-4': { name: 'Dr. Diana Putri, M.Sc', wa: '081234567893' },
        'dosen-5': { name: 'Dr. Eko Prasetyo, M.Kom', wa: '081234567894' }
    };

    const dosen = dosenNames[proposal.dosen];

    if (dosen) {
        pembimbingCard.innerHTML = `
      <div class="pembimbing-info">
        <div class="pembimbing-avatar">${dosen.name.charAt(0)}</div>
        <div class="pembimbing-details">
          <h3>${dosen.name}</h3>
          <p>Dosen Pembimbing</p>
          <a href="https://wa.me/${dosen.wa}" class="wa-link" target="_blank">
            📱 WhatsApp: ${dosen.wa}
          </a>
        </div>
      </div>
    `;
    }
}
