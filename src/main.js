import "./style.css";

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

// ---------- STATE SEDERHANA ----------
let currentRole = "mahasiswa";
let activeMenu = "dashboard";

// ---------- RENDER ROOT ----------
const app = document.querySelector("#app");
app.innerHTML = `
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
          <button class="sidebar-settings">Logout</button>
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

// ---------- ELEMENTS ----------
const sidebarRoleEl = document.getElementById("sidebar-role");
const sidebarMenuEl = document.getElementById("sidebar-menu");
const roleSelectEl = document.getElementById("role-select");
const contentTitleEl = document.getElementById("content-title");
const contentBodyEl = document.getElementById("content-body");

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

// ---------- RENDER FUNCTIONS ----------
function renderSidebar() {
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
      renderSidebar();
      renderContent();
    });
    sidebarMenuEl.appendChild(btn);
  });
}

function renderContent() {
  const title = TITLE_MAP[activeMenu] || "Dashboard";
  contentTitleEl.textContent = title;

  // default kosong
  contentBodyEl.innerHTML = "";

  // dashboard dan track → tampilkan cards
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

  // tampilan placeholder sesuai menu
  const box = document.createElement("div");
  box.className = "placeholder-box";

  if (activeMenu === "proposal") {
    box.innerHTML = `
      <h3>Upload Proposal</h3>
      <p>
        Di sini nanti form upload proposal (.pdf) yang akan call endpoint
        <code>/api/proposal/upload</code> ke backend Express kamu, lalu menyimpan <code>file_url</code>.
      </p>
    `;
  } else if (activeMenu === "laporan") {
    box.innerHTML = `
      <h3>Upload Laporan Sidang</h3>
      <p>
        Form upload laporan akhir (.pdf) terhubung dengan endpoint
        <code>/api/report/upload</code>.
      </p>
    `;
  } else if (
    ["bimbingan", "mahasiswa-bimbingan", "bimbingan-approve"].includes(
      activeMenu
    )
  ) {
    box.innerHTML = `
      <h3>Data Bimbingan Online</h3>
      <p>
        Di sini nanti tabel bimbingan mingguan (maks 8x) yang ambil data dari
        <code>/api/bimbingan</code> sesuai role (mahasiswa / dosen).
      </p>
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

// ---------- EVENT: GANTI ROLE ----------
roleSelectEl.value = currentRole;
roleSelectEl.addEventListener("change", (e) => {
  currentRole = e.target.value;
  activeMenu = "dashboard";
  renderSidebar();
  renderContent();
});

// ---------- INIT ----------
renderSidebar();
renderContent();
