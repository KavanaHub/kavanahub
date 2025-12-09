import { MENU_CONFIG, ROLE_LABEL, TITLE_MAP } from "./shared.js";
import "./style.css";

// ---------- STATE ----------
let currentRole = sessionStorage.getItem('userRole') || 'mahasiswa';
let activeMenu = 'dashboard';

// ---------- DUMMY DATA ----------
const proyekCards = [
  {
    title: "Proyek 1 - Sistem Bimbingan",
    description: "Status proposal, pembimbing, dan progres bimbingan untuk Proyek 1.",
    status: "Proposal disetujui",
    tag: "Proyek 1",
  },
  {
    title: "Internship 1 - PT Teknologi Kavana",
    description: "Laporan kegiatan dan bimbingan untuk Internship 1 semester ini.",
    status: "Bimbingan 5 / 8",
    tag: "Internship 1",
  },
  {
    title: "Proyek 2 - Aplikasi Mobile",
    description: "Menunggu pengajuan proposal dan usulan pembimbing.",
    status: "Belum dimulai",
    tag: "Proyek 2",
  },
];

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Check if user is logged in
  if (!sessionStorage.getItem('userRole')) {
    // Set default for demo
    sessionStorage.setItem('userRole', 'mahasiswa');
    sessionStorage.setItem('userName', 'Renz Arnando');
    sessionStorage.setItem('userEmail', 'npm@kampus.ac.id');
  }

  currentRole = sessionStorage.getItem('userRole') || 'mahasiswa';

  app.innerHTML = getDashboardHTML();
  bindDashboardEvents();
});

// ---------- DASHBOARD HTML ----------
function getDashboardHTML() {
  const userName = sessionStorage.getItem('userName') || 'User';
  const userEmail = sessionStorage.getItem('userEmail') || 'email@kampus.ac.id';

  return `
  <div class="app-root">
    <div class="app-container">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-circle">K</div>
          <div>
            <div class="logo-title">Kavana</div>
            <div class="logo-subtitle">Bimbingan Online</div>
          </div>
        </div>
        <div class="sidebar-role" id="sidebar-role"></div>
        <nav class="sidebar-menu" id="sidebar-menu"></nav>
        <div class="sidebar-footer">
          <button class="sidebar-settings" id="btn-logout">Logout</button>
        </div>
      </aside>

      <main class="app-main">
        <header class="topbar">
          <div>
            <h1 class="topbar-title">Dashboard Bimbingan</h1>
            <p class="topbar-subtitle">Ringkasan aktivitas Proyek & Internship kamu.</p>
          </div>
          <div class="topbar-actions">
            <select class="role-select" id="role-select">
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="koordinator">Koordinator</option>
              <option value="kaprodi">Kaprodi</option>
            </select>
            <div class="avatar-wrapper">
              <div class="avatar-circle">${userName.charAt(0).toUpperCase()}</div>
              <div class="avatar-info">
                <div class="avatar-name">${userName}</div>
                <div class="avatar-email">${userEmail}</div>
              </div>
            </div>
          </div>
        </header>

        <div class="content-layout">
          <section class="content-main">
            <div class="content-header">
              <h2 id="content-title"></h2>
              <div class="content-filters">
                <select>
                  <option>Semester Ini</option>
                  <option>Semester Lalu</option>
                </select>
                <select>
                  <option>Semua Track</option>
                  <option>Proyek 1</option>
                  <option>Proyek 2</option>
                  <option>Proyek 3</option>
                  <option>Internship 1</option>
                  <option>Internship 2</option>
                </select>
              </div>
            </div>

            <div id="content-body"></div>
          </section>

          <aside class="content-side">
            <div class="calendar-card">
              <div class="calendar-header">
                <span>Jadwal</span>
                <span>Nov 2025</span>
              </div>
              <div class="calendar-body">
                <div class="calendar-dots">
                  <span class="dot filled"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot filled"></span>
                </div>
                <p>Bimbingan terdekat: 30 Nov, 14.00 WIB</p>
              </div>
            </div>

            <div class="online-card">
              <div class="online-header">
                <span>Online Users</span>
                <button>See all</button>
              </div>
              <ul class="online-list">
                <li>
                  <div class="online-avatar">A</div>
                  <div>
                    <div class="online-name">Itz Aidaa</div>
                    <div class="online-sub">Dosen Pembimbing</div>
                  </div>
                </li>
                <li>
                  <div class="online-avatar">R</div>
                  <div>
                    <div class="online-name">${userName}</div>
                    <div class="online-sub">Mahasiswa</div>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
`;
}

// ---------- BIND EVENTS ----------
function bindDashboardEvents() {
  const sidebarRoleEl = document.getElementById("sidebar-role");
  const sidebarMenuEl = document.getElementById("sidebar-menu");
  const roleSelectEl = document.getElementById("role-select");
  const contentTitleEl = document.getElementById("content-title");
  const contentBodyEl = document.getElementById("content-body");
  const logoutBtn = document.getElementById("btn-logout");

  // Render sidebar
  function renderSidebar() {
    const items = MENU_CONFIG[currentRole];
    sidebarRoleEl.innerHTML = `Role: <span>${ROLE_LABEL[currentRole]}</span>`;

    sidebarMenuEl.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "sidebar-item" + (activeMenu === item.id ? " sidebar-item-active" : "");
      btn.innerHTML = `
        <span class="sidebar-bullet"></span>
        <span>${item.label}</span>
      `;
      btn.addEventListener("click", () => {
        activeMenu = item.id;
        renderSidebar();
        renderContent();
      });
      sidebarMenuEl.appendChild(btn);
    });
  }

  // Helper function for track display name
  function getTrackDisplayName(track) {
    // This can be expanded if track names need more complex mapping
    return track;
  }

  // Render content
  function renderContent() {
    const title = TITLE_MAP[activeMenu] || "Dashboard";
    contentTitleEl.textContent = title;
    contentBodyEl.innerHTML = "";

    // Track selection page
    if (activeMenu === "track") {
      const selectedTrack = sessionStorage.getItem('selectedTrack');
      const wrapper = document.createElement("div");

      if (selectedTrack) {
        // Show current track
        const trackData = JSON.parse(selectedTrack);
        wrapper.className = "track-info-container";
        wrapper.innerHTML = `
                    <div class="current-track-card">
                        <div class="track-icon">${trackData.type === 'proyek' ? '📋' : '🏢'}</div>
                        <div class="track-details">
                            <h3>${getTrackDisplayName(trackData.track)}</h3>
                            <p>${trackData.type === 'proyek' ? `Partner NPM: ${trackData.partnerNpm}` : `Perusahaan: ${trackData.companyName}`}</p>
                        </div>
                        <button class="btn btn-outline btn-small" id="btn-change-track">Ganti Track</button>
                    </div>
                `;
        contentBodyEl.appendChild(wrapper);

        // Add change track button handler
        document.getElementById('btn-change-track')?.addEventListener('click', () => {
          window.location.href = '/track.html';
        });
      } else {
        // No track selected, show prompt
        wrapper.className = "no-track-container";
        wrapper.innerHTML = `
                    <div class="no-track-card">
                        <div class="no-track-icon">📚</div>
                        <h3>Belum Ada Track yang Dipilih</h3>
                        <p>Silakan pilih track Proyek atau Internship untuk memulai bimbingan</p>
                        <button class="btn btn-gradient" id="btn-select-track">Pilih Track Sekarang</button>
                    </div>
                `;
        contentBodyEl.appendChild(wrapper);

        // Add select track button handler
        document.getElementById('btn-select-track')?.addEventListener('click', () => {
          window.location.href = '/track.html';
        });
      }
      return;
    }

    if (activeMenu === "dashboard") {
      const wrapper = document.createElement("div");
      wrapper.className = "cards-grid";

      proyekCards.forEach((card) => {
        const article = document.createElement("article");
        article.className = "course-card";
        article.innerHTML = `
          <div class="course-card-icon"></div>
          <div class="course-card-body">
            <div class="course-card-tag">${card.tag}</div>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            <div class="course-card-footer">
              <span class="course-status">${card.status}</span>
              <button class="course-button">Lihat detail</button>
            </div>
          </div>
        `;
        wrapper.appendChild(article);
      });

      contentBodyEl.appendChild(wrapper);
      return;
    }

    const box = document.createElement("div");
    box.className = "placeholder-box";

    if (activeMenu === "proposal") {
      box.innerHTML = `
        <h3>Upload Proposal</h3>
        <p>Form upload proposal (.pdf) yang akan call endpoint <code>/api/proposal/upload</code>.</p>
      `;
    } else if (activeMenu === "laporan") {
      box.innerHTML = `
        <h3>Upload Laporan Sidang</h3>
        <p>Form upload laporan akhir (.pdf) terhubung dengan endpoint <code>/api/report/upload</code>.</p>
      `;
    } else if (["bimbingan", "mahasiswa-bimbingan", "bimbingan-approve"].includes(activeMenu)) {
      box.innerHTML = `
        <h3>Data Bimbingan Online</h3>
        <p>Tabel bimbingan mingguan (maks 8x) dari <code>/api/bimbingan</code>.</p>
      `;
    } else if (activeMenu === "validasi-proposal") {
      box.innerHTML = `
        <h3>Validasi Proposal</h3>
        <p>Halaman koordinator untuk cek & validasi proposal mahasiswa.</p>
      `;
    } else if (activeMenu === "approve-pembimbing") {
      box.innerHTML = `
        <h3>Approve Pembimbing</h3>
        <p>Koordinator memilih dan meng-ACC dosen pembimbing sesuai pengajuan mahasiswa.</p>
      `;
    } else {
      box.innerHTML = `
        <h3>${title}</h3>
        <p>Halaman ini nanti diisi sesuai kebutuhan logic backend kamu.</p>
      `;
    }

    contentBodyEl.appendChild(box);
  }

  // Role select change
  roleSelectEl.value = currentRole;
  roleSelectEl.addEventListener("change", (e) => {
    currentRole = e.target.value;
    sessionStorage.setItem('userRole', currentRole);
    activeMenu = "dashboard";
    renderSidebar();
    renderContent();
  });

  // Logout button
  logoutBtn?.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "/";
  });

  // Initial render
  renderSidebar();
  renderContent();
}
