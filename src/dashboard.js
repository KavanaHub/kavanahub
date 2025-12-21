// ========================================
// DASHBOARD - Main Entry Point (Responsive)
// ========================================

import { MENU_CONFIG, ROLE_LABEL, TITLE_MAP } from "./shared.js";
import { mahasiswaAPI, dosenAPI, koordinatorAPI, kaprodiAPI, getToken, clearToken } from "./api.js";
import { getSidebarHTML, getMobileHeaderHTML, bindSidebarEvents, updateSidebarUser, updateBimbinganBadge } from "./components/sidebar.js";
import { renderMahasiswaDashboard } from "./components/mahasiswaDashboard.js";
import { renderDosenDashboard } from "./components/dosenDashboard.js";
import { removeAcademicTitles } from "./utils/formatUtils.js";

// ---------- STATE ----------
let currentRole = sessionStorage.getItem("userRole") || "mahasiswa";
let activeMenu = "dashboard";
let userData = null;

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  // Check if user is logged in
  const authToken = getToken();
  const userRole = sessionStorage.getItem("userRole");

  if (!authToken || !userRole) {
    window.location.href = "/login.html";
    return;
  }

  currentRole = userRole;

  // Render dashboard structure
  app.innerHTML = getDashboardHTML();
  bindDashboardEvents();

  // Fetch user profile and render content
  await fetchUserProfile();
  renderContent();
});

// ---------- FETCH USER PROFILE ----------
async function fetchUserProfile() {
  try {
    let result;

    if (currentRole === "mahasiswa") {
      result = await mahasiswaAPI.getProfile();
    } else if (currentRole === "dosen" || currentRole === "kaprodi") {
      result = await dosenAPI.getProfile();
    } else if (currentRole === "koordinator") {
      result = await koordinatorAPI.getProfile();
    }

    if (result && result.ok) {
      userData = result.data;
      sessionStorage.setItem("userName", result.data.nama || "User");
      sessionStorage.setItem("userEmail", result.data.email || "");

      // Update user display
      updateSidebarUser();
      updateHeaderUser();
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
}

// ---------- UPDATE HEADER USER ----------
function updateHeaderUser() {
  const rawName = sessionStorage.getItem("userName") || "User";
  const userName = removeAcademicTitles(rawName);
  const headerName = document.querySelector(".header-name");
  if (headerName) headerName.textContent = userName;
}

// ---------- DASHBOARD HTML (Responsive) ----------
function getDashboardHTML() {
  const rawName = sessionStorage.getItem("userName") || "User";
  const userName = removeAcademicTitles(rawName);

  return `
    ${getMobileHeaderHTML()}
    ${getSidebarHTML(currentRole, activeMenu)}

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto h-full w-full pt-14 lg:pt-0">
      <div class="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
        <!-- Page Header -->
        <header class="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-4">
          <div class="flex flex-col gap-1">
            <h2 class="text-text-main text-2xl sm:text-3xl font-black leading-tight tracking-tight">
              Selamat Datang, <span class="header-name">${userName}</span>
            </h2>
            <p class="text-text-secondary text-sm sm:text-base" id="topbar-subtitle">Pantau progres dan bimbinganmu di sini.</p>
          </div>
          <div class="flex gap-2 sm:gap-3 w-full sm:w-auto" id="header-actions">
            <button class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-text-main shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
              <span class="material-symbols-outlined text-[18px] sm:text-[20px]">help</span>
              <span class="hidden sm:inline">Bantuan</span>
            </button>
            <a href="/proposal.html" class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-[18px] sm:text-[20px]">add</span>
              <span class="hidden sm:inline">Ajukan Topik</span>
            </a>
          </div>
        </header>

        <!-- Dynamic Content Area -->
        <div id="content-body" class="flex flex-col gap-6 lg:gap-8"></div>
      </div>
    </main>
  `;
}

// ---------- BIND EVENTS ----------
function bindDashboardEvents() {
  // Bind sidebar events with menu click handler
  bindSidebarEvents(handleMenuClick);
}

// ---------- MENU CLICK HANDLER ----------
function handleMenuClick(menuId) {
  // Pages that should redirect to separate HTML
  const redirectPages = {
    track: "/mahasiswa/track.html",
    proposal: "/mahasiswa/proposal.html",
    bimbingan: "/mahasiswa/bimbingan.html",
    laporan: "/mahasiswa/laporan.html",
    nilai: "/mahasiswa/hasil.html",
    profile: "/shared/profile.html",
  };

  if (redirectPages[menuId]) {
    window.location.href = redirectPages[menuId];
    return;
  }

  // Update active menu and render content
  activeMenu = menuId;

  // Refresh sidebar to show active state
  const sidebarContainer = document.getElementById("sidebar");
  const overlayContainer = document.getElementById("sidebar-overlay");
  if (sidebarContainer && overlayContainer) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = getSidebarHTML(currentRole, activeMenu);
    sidebarContainer.outerHTML = tempDiv.querySelector('.sidebar').outerHTML;
    bindSidebarEvents(handleMenuClick);
  }

  renderContent();
}

// ---------- RENDER CONTENT ----------
async function renderContent() {
  const contentBody = document.getElementById("content-body");
  if (!contentBody) return;

  // Update subtitle based on role/menu
  const subtitle = document.getElementById("topbar-subtitle");

  if (activeMenu === "dashboard") {
    if (currentRole === "mahasiswa") {
      if (subtitle) subtitle.textContent = "Pantau progres dan bimbinganmu di sini.";
      const result = await renderMahasiswaDashboard(contentBody, userData);
      if (result?.bimbinganPending) {
        updateBimbinganBadge(result.bimbinganPending);
      }
    } else if (currentRole === "dosen") {
      if (subtitle) subtitle.textContent = "Kelola bimbingan mahasiswa Anda.";
      await renderDosenDashboard(contentBody, userData);
    } else if (currentRole === "koordinator") {
      if (subtitle) subtitle.textContent = "Kelola proposal dan penugasan dosen.";
      renderKoordinatorDashboard(contentBody);
    } else if (currentRole === "kaprodi") {
      if (subtitle) subtitle.textContent = "Monitor progres mahasiswa dan dosen.";
      renderKaprodiDashboard(contentBody);
    }
  } else {
    // For menu items that don't redirect, show placeholder
    renderPlaceholder(contentBody, activeMenu);
  }
}

// ---------- PLACEHOLDER CONTENT ----------
function renderPlaceholder(container, menuId) {
  const menuItem = MENU_CONFIG[currentRole]?.find((m) => m.id === menuId);
  const title = menuItem?.label || "Halaman";

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-slate-100">
      <span class="material-symbols-outlined text-5xl sm:text-6xl text-slate-300 mb-4">construction</span>
      <h3 class="text-lg sm:text-xl font-bold text-text-main mb-2">${title}</h3>
      <p class="text-text-secondary text-sm sm:text-base">Halaman ini sedang dalam pengembangan.</p>
      <button onclick="location.reload()" class="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
        Kembali ke Dashboard
      </button>
    </div>
  `;
}

// ---------- KOORDINATOR DASHBOARD ----------
function renderKoordinatorDashboard(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="p-2 bg-blue-50 text-primary rounded-lg w-fit mb-3 lg:mb-4">
          <span class="material-symbols-outlined">description</span>
        </div>
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Proposal Pending</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">5</p>
      </div>
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="p-2 bg-green-50 text-green-600 rounded-lg w-fit mb-3 lg:mb-4">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Proposal Disetujui</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">23</p>
      </div>
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100 sm:col-span-2 lg:col-span-1">
        <div class="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3 lg:mb-4">
          <span class="material-symbols-outlined">person_add</span>
        </div>
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Dosen Aktif</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">12</p>
      </div>
    </div>
    <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-base lg:text-lg font-bold text-text-main mb-4 lg:mb-6">Aksi Cepat</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <a href="/validasi-proposal.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors">
          <span class="material-symbols-outlined text-xl lg:text-2xl text-primary">fact_check</span>
          <span class="text-xs lg:text-sm font-medium text-text-main text-center">Validasi Proposal</span>
        </a>
        <a href="/approve-pembimbing.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors">
          <span class="material-symbols-outlined text-xl lg:text-2xl text-primary">how_to_reg</span>
          <span class="text-xs lg:text-sm font-medium text-text-main text-center">Assign Dosen</span>
        </a>
        <a href="/daftar-dosen.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors">
          <span class="material-symbols-outlined text-xl lg:text-2xl text-primary">groups</span>
          <span class="text-xs lg:text-sm font-medium text-text-main text-center">Daftar Dosen</span>
        </a>
        <a href="/monitoring-mahasiswa.html" class="flex flex-col items-center gap-2 lg:gap-3 p-4 lg:p-6 bg-slate-50 hover:bg-primary/10 rounded-xl transition-colors">
          <span class="material-symbols-outlined text-xl lg:text-2xl text-primary">monitoring</span>
          <span class="text-xs lg:text-sm font-medium text-text-main text-center">Monitoring</span>
        </a>
      </div>
    </div>
  `;
}

// ---------- KAPRODI DASHBOARD ----------
function renderKaprodiDashboard(container) {
  container.innerHTML = `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Total Mahasiswa</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">156</p>
      </div>
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Aktif Bimbingan</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">89</p>
      </div>
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Sudah Sidang</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">45</p>
      </div>
      <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
        <p class="text-text-secondary text-xs sm:text-sm font-medium">Total Dosen</p>
        <p class="text-text-main text-xl lg:text-2xl font-bold mt-1">18</p>
      </div>
    </div>
    <div class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 class="text-base lg:text-lg font-bold text-text-main mb-4">Dashboard Kaprodi</h3>
      <p class="text-text-secondary text-sm">Fitur monitoring lengkap akan segera hadir.</p>
    </div>
  `;
}
