import "./style.css";

// ---------- STATE GLOBAL ----------
let currentPage = "landing"; // 'landing' atau 'dashboard'
let currentRole = "mahasiswa";
let activeMenu = "dashboard";

// ---------- CONFIG MENU PER ROLE ----------
const MENU_CONFIG = {
  mahasiswa: [
    { id: "dashboard", label: "Dashboard" },
    { id: "track", label: "Proyek & Internship" },
    { id: "bimbingan", label: "Bimbingan Online" },
    { id: "proposal", label: "Upload Proposal" },
    { id: "laporan", label: "Upload Laporan Sidang" },
    { id: "nilai", label: "Nilai & Hasil Akhir" },
    { id: "profile", label: "Profil Saya" },
    { id: "settings", label: "Pengaturan" },
  ],
  dosen: [
    { id: "dashboard", label: "Dashboard" },
    { id: "mahasiswa-bimbingan", label: "Mahasiswa Bimbingan" },
    { id: "bimbingan-approve", label: "Approve Bimbingan" },
    { id: "laporan-approve", label: "Approve Laporan Sidang" },
    { id: "nilai", label: "Input Nilai Sidang" },
    { id: "profile", label: "Profil Saya" },
    { id: "settings", label: "Pengaturan" },
  ],
  koordinator: [
    { id: "dashboard", label: "Dashboard" },
    { id: "validasi-proposal", label: "Validasi Proposal" },
    { id: "approve-pembimbing", label: "Approve Pembimbing" },
    { id: "daftar-mahasiswa", label: "Daftar Mahasiswa" },
    { id: "profile", label: "Profil Saya" },
    { id: "settings", label: "Pengaturan" },
  ],
  kaprodi: [
    { id: "dashboard", label: "Dashboard" },
    { id: "pilih-koordinator", label: "Pilih Koordinator" },
    { id: "daftar-dosen", label: "Daftar Dosen" },
    { id: "monitoring", label: "Monitoring Mahasiswa" },
    { id: "profile", label: "Profil Saya" },
    { id: "settings", label: "Pengaturan" },
  ],
};

const ROLE_LABEL = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen Pembimbing",
  koordinator: "Koordinator",
  kaprodi: "Kepala Prodi",
};

const TITLE_MAP = {
  dashboard: "Ringkasan Kegiatan",
  track: "Proyek & Internship",
  bimbingan: "Bimbingan Online",
  proposal: "Upload Proposal",
  laporan: "Upload Laporan Sidang",
  nilai: "Nilai & Hasil Akhir",
  profile: "Profil Saya",
  settings: "Pengaturan",
  "mahasiswa-bimbingan": "Mahasiswa Bimbingan",
  "bimbingan-approve": "Approve Bimbingan",
  "laporan-approve": "Approve Laporan Sidang",
  "validasi-proposal": "Validasi Proposal",
  "approve-pembimbing": "Approve Pembimbing",
  "daftar-mahasiswa": "Daftar Mahasiswa",
  "pilih-koordinator": "Pilih Koordinator",
  "daftar-dosen": "Daftar Dosen",
  monitoring: "Monitoring Mahasiswa",
};

// ---------- RENDER ROOT ----------
const app = document.querySelector("#app");

// ---------- LANDING PAGE HTML ----------
function getLandingHTML() {
  return `
    <div class="landing-page">
      <!-- Header -->
      <header class="landing-header">
        <div class="landing-logo">
          <div class="landing-logo-circle">K</div>
          <div class="landing-logo-text">
            <div class="landing-logo-title">Kavana</div>
            <div class="landing-logo-subtitle">Bimbingan Online</div>
          </div>
        </div>
        <nav class="landing-nav">
          <ul class="landing-nav-links">
            <li><a href="#features">Fitur</a></li>
            <li><a href="#roles">Pengguna</a></li>
            <li><a href="#how">Cara Kerja</a></li>
            <li><a href="#contact">Kontak</a></li>
          </ul>
          <div class="landing-nav-buttons">
            <button class="btn btn-outline" id="btn-login">Masuk</button>
            <button class="btn btn-primary" id="btn-register">Daftar</button>
          </div>
        </nav>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Kelola Bimbingan <span>Proyek & Internship</span> Dengan Mudah</h1>
          <p>
            Kavana adalah sistem bimbingan online yang memudahkan mahasiswa, dosen pembimbing, 
            dan koordinator untuk mengelola proses bimbingan akademik secara digital dan terstruktur.
          </p>
          <div class="hero-buttons">
            <button class="btn btn-gradient btn-large" id="btn-hero-start">Mulai Sekarang</button>
            <button class="btn btn-outline btn-large" style="border-color: #2596be; color: #2596be;" id="btn-hero-demo">Lihat Demo</button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-number">500+</div>
              <div class="hero-stat-label">Mahasiswa Aktif</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-number">50+</div>
              <div class="hero-stat-label">Dosen Pembimbing</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-number">1000+</div>
              <div class="hero-stat-label">Sesi Bimbingan</div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-dashboard-preview">
            <div class="preview-header">
              <span class="preview-dot red"></span>
              <span class="preview-dot yellow"></span>
              <span class="preview-dot green"></span>
            </div>
            <div class="preview-body">
              <div class="preview-sidebar">
                <div class="preview-sidebar-item active"></div>
                <div class="preview-sidebar-item"></div>
                <div class="preview-sidebar-item"></div>
                <div class="preview-sidebar-item"></div>
              </div>
              <div class="preview-content">
                <div class="preview-card">
                  <div class="preview-card-title"></div>
                  <div class="preview-card-text"></div>
                </div>
                <div class="preview-card">
                  <div class="preview-card-title"></div>
                  <div class="preview-card-text"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section" id="features">
        <div class="section-header">
          <span class="section-tag">Fitur Unggulan</span>
          <h2>Semua yang Kamu Butuhkan</h2>
          <p>Fitur lengkap untuk mengelola seluruh proses bimbingan akademik dari awal hingga sidang</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Manajemen Proposal</h3>
            <p>Upload dan kelola proposal dengan mudah. Koordinator dapat memvalidasi dan memberikan feedback langsung.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👨‍🏫</div>
            <h3>Pemilihan Pembimbing</h3>
            <p>Ajukan dosen pembimbing pilihan dan dapatkan persetujuan dari koordinator secara online.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Bimbingan Online</h3>
            <p>Catat setiap sesi bimbingan hingga 8 kali pertemuan dengan tracking progress yang jelas.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Tracking Progress</h3>
            <p>Pantau perkembangan proyek dan internship dengan dashboard yang informatif.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3>Upload Laporan</h3>
            <p>Submit laporan akhir untuk mendapatkan persetujuan pembimbing sebelum sidang.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3>Penilaian Sidang</h3>
            <p>Sistem penilaian terintegrasi dari pembimbing dan penguji untuk hasil akhir yang transparan.</p>
          </div>
        </div>
      </section>

      <!-- Roles Section -->
      <section class="roles-section" id="roles">
        <div class="section-header">
          <span class="section-tag">Multi-Role</span>
          <h2>Untuk Semua Pengguna</h2>
          <p>Setiap pengguna memiliki dashboard dan fitur yang disesuaikan dengan perannya</p>
        </div>
        <div class="roles-grid">
          <div class="role-card">
            <div class="role-avatar">M</div>
            <h3>Mahasiswa</h3>
            <p>Upload proposal, pilih pembimbing, catat bimbingan, dan ajukan sidang.</p>
          </div>
          <div class="role-card">
            <div class="role-avatar">D</div>
            <h3>Dosen Pembimbing</h3>
            <p>Approve bimbingan, review laporan, dan berikan nilai sidang.</p>
          </div>
          <div class="role-card">
            <div class="role-avatar">K</div>
            <h3>Koordinator</h3>
            <p>Validasi proposal, approve pembimbing, dan jadwalkan sidang.</p>
          </div>
          <div class="role-card">
            <div class="role-avatar">P</div>
            <h3>Kaprodi</h3>
            <p>Pilih koordinator, monitoring mahasiswa, dan kelola daftar dosen.</p>
          </div>
        </div>
      </section>

      <!-- How it Works Section -->
      <section class="how-section" id="how">
        <div class="section-header">
          <span class="section-tag">Alur Sistem</span>
          <h2>Cara Kerja Kavana</h2>
          <p>Proses bimbingan yang terstruktur dari awal hingga kelulusan</p>
        </div>
        <div class="steps-container">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Registrasi</h3>
            <p>Daftar akun dengan data lengkap</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Pilih Track</h3>
            <p>Proyek 1/2/3 atau Internship 1/2</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Upload Proposal</h3>
            <p>Ajukan judul dan pembimbing</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h3>Bimbingan</h3>
            <p>Lakukan 8x sesi bimbingan</p>
          </div>
          <div class="step-card">
            <div class="step-number">5</div>
            <h3>Sidang</h3>
            <p>Presentasi dan dapatkan nilai</p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section" id="contact">
        <div class="cta-box">
          <h2>Siap Memulai Bimbingan Online?</h2>
          <p>Bergabung dengan ratusan mahasiswa yang sudah menggunakan Kavana untuk mengelola bimbingan akademik mereka.</p>
          <button class="btn btn-white btn-large" id="btn-cta-register">Daftar Sekarang - Gratis!</button>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="landing-logo">
              <div class="landing-logo-circle">K</div>
              <div class="landing-logo-text">
                <div class="landing-logo-title">Kavana</div>
                <div class="landing-logo-subtitle">Bimbingan Online</div>
              </div>
            </div>
            <p>Sistem bimbingan online untuk mahasiswa Proyek & Internship. Kelola proses akademik dengan lebih mudah dan terstruktur.</p>
          </div>
          <div class="footer-links">
            <h4>Produk</h4>
            <ul>
              <li><a href="#features">Fitur</a></li>
              <li><a href="#roles">Pengguna</a></li>
              <li><a href="#how">Cara Kerja</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Dukungan</h4>
            <ul>
              <li><a href="#">Bantuan</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Kontak</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Kebijakan Privasi</a></li>
              <li><a href="#">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Kavana - Bimbingan Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `;
}

// ---------- DASHBOARD HTML ----------
function getDashboardHTML() {
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
              <div class="avatar-circle">R</div>
              <div class="avatar-info">
                <div class="avatar-name">Renz Arnando</div>
                <div class="avatar-email">npm@kampus.ac.id</div>
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
                    <div class="online-name">Renz Arnando</div>
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

// ---------- DUMMY DATA KARTU ----------
const proyekCards = [
  {
    title: "Proyek 1 - Sistem Bimbingan",
    description:
      "Status proposal, pembimbing, dan progres bimbingan untuk Proyek 1.",
    status: "Proposal disetujui",
    tag: "Proyek 1",
  },
  {
    title: "Internship 1 - PT Teknologi Kavana",
    description:
      "Laporan kegiatan dan bimbingan untuk Internship 1 semester ini.",
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

// ---------- NAVIGASI HALAMAN ----------
function navigateTo(page) {
  currentPage = page;
  renderApp();
}

// ---------- RENDER APLIKASI ----------
function renderApp() {
  if (currentPage === "landing") {
    app.innerHTML = getLandingHTML();
    bindLandingEvents();
  } else if (currentPage === "dashboard") {
    app.innerHTML = getDashboardHTML();
    bindDashboardEvents();
  }
}

// ---------- BIND EVENTS LANDING ----------
function bindLandingEvents() {
  // Tombol Login
  document.getElementById("btn-login")?.addEventListener("click", () => {
    navigateTo("dashboard");
  });

  // Tombol Register
  document.getElementById("btn-register")?.addEventListener("click", () => {
    navigateTo("dashboard");
  });

  // Tombol Hero
  document.getElementById("btn-hero-start")?.addEventListener("click", () => {
    navigateTo("dashboard");
  });

  document.getElementById("btn-hero-demo")?.addEventListener("click", () => {
    navigateTo("dashboard");
  });

  // Tombol CTA
  document.getElementById("btn-cta-register")?.addEventListener("click", () => {
    navigateTo("dashboard");
  });

  // Smooth scroll untuk anchor links
  document.querySelectorAll('.landing-nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ---------- BIND EVENTS DASHBOARD ----------
function bindDashboardEvents() {
  const sidebarRoleEl = document.getElementById("sidebar-role");
  const sidebarMenuEl = document.getElementById("sidebar-menu");
  const roleSelectEl = document.getElementById("role-select");
  const contentTitleEl = document.getElementById("content-title");
  const contentBodyEl = document.getElementById("content-body");
  const logoutBtn = document.getElementById("btn-logout");

  // Fungsi render sidebar
  function renderSidebarDashboard() {
    const items = MENU_CONFIG[currentRole];
    sidebarRoleEl.innerHTML = `Role: <span>${ROLE_LABEL[currentRole]}</span>`;

    sidebarMenuEl.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className =
        "sidebar-item" + (activeMenu === item.id ? " sidebar-item-active" : "");
      btn.innerHTML = `
        <span class="sidebar-bullet"></span>
        <span>${item.label}</span>
      `;
      btn.addEventListener("click", () => {
        activeMenu = item.id;
        renderSidebarDashboard();
        renderContentDashboard();
      });
      sidebarMenuEl.appendChild(btn);
    });
  }

  // Fungsi render content
  function renderContentDashboard() {
    const title = TITLE_MAP[activeMenu] || "Dashboard";
    contentTitleEl.textContent = title;
    contentBodyEl.innerHTML = "";

    if (activeMenu === "dashboard" || activeMenu === "track") {
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
    activeMenu = "dashboard";
    renderSidebarDashboard();
    renderContentDashboard();
  });

  // Logout button
  logoutBtn?.addEventListener("click", () => {
    navigateTo("landing");
  });

  // Initial render
  renderSidebarDashboard();
  renderContentDashboard();
}

// ---------- INIT ----------
renderApp();
