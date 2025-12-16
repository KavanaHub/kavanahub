// ========================================
// SIDEBAR COMPONENT - Kavana Bimbingan Online
// Responsive with mobile toggle
// ========================================

import { MENU_CONFIG, ROLE_LABEL } from "../shared.js";
import { clearToken } from "../api.js";

// Menu icons mapping
const MENU_ICONS = {
    dashboard: "dashboard",
    track: "work_outline",
    bimbingan: "chat_bubble_outline",
    proposal: "upload",
    laporan: "description",
    nilai: "star_outline",
    profile: "person_outline",
    settings: "settings",
    "mahasiswa-bimbingan": "groups",
    "bimbingan-approve": "check_circle",
    "laporan-approve": "grading",
    "validasi-proposal": "fact_check",
    "approve-pembimbing": "how_to_reg",
};

// Generate sidebar HTML with purple/blue gradient theme (responsive)
export function getSidebarHTML(currentRole, activeMenu = "dashboard") {
    const userName = sessionStorage.getItem("userName") || "User";
    const userEmail = sessionStorage.getItem("userEmail") || "email@kampus.ac.id";
    const menuItems = MENU_CONFIG[currentRole] || [];

    // Generate menu items HTML
    const menuHTML = menuItems
        .map((item) => {
            const isActive = activeMenu === item.id;
            const icon = MENU_ICONS[item.id] || "circle";
            const hasBadge = item.id === "bimbingan";

            return `
      <a href="#" 
         data-menu="${item.id}"
         class="sidebar-menu-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }">
        <span class="material-symbols-outlined text-[22px]">${icon}</span>
        <span class="text-sm flex-1">${item.label}</span>
        ${hasBadge ? '<span class="sidebar-badge w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-md">2</span>' : ""}
      </a>
    `;
        })
        .join("");

    return `
    <!-- Mobile Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" onclick="closeSidebar()"></div>
    
    <!-- Sidebar -->
    <aside id="sidebar" class="sidebar fixed lg:relative w-[260px] bg-gradient-to-b from-[#7c3aed] via-[#6366f1] to-[#4f46e5] h-full flex flex-col shrink-0 overflow-y-auto shadow-xl z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
      <div class="p-6 pb-4">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-lg backdrop-blur-sm">
              <span class="material-symbols-outlined icon-fill text-2xl">school</span>
            </div>
            <div class="flex flex-col">
              <h1 class="text-white text-lg font-bold leading-none">Kavana</h1>
              <p class="text-white/70 text-xs font-medium mt-1">Bimbingan Online</p>
            </div>
          </div>
          <!-- Close button for mobile -->
          <button id="btn-close-sidebar" class="lg:hidden text-white/70 hover:text-white p-1">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <nav class="flex-1 px-4 flex flex-col gap-1" id="sidebar-menu">
        ${menuHTML}
      </nav>
      <div class="p-4 mt-auto">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <div class="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold shrink-0 shadow-md avatar-circle">${userName.charAt(0).toUpperCase()}</div>
          <div class="flex flex-col min-w-0 flex-1">
            <p class="text-white text-sm font-semibold truncate avatar-name">${userName}</p>
            <p class="text-white/60 text-xs truncate avatar-email">${userEmail}</p>
          </div>
          <button class="text-white/60 hover:text-white transition-colors" id="btn-logout">
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  `;
}

// Get mobile header HTML with hamburger menu
export function getMobileHeaderHTML() {
    return `
    <div id="mobile-header" class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-4 py-3 flex items-center justify-between shadow-lg">
      <button id="btn-open-sidebar" class="text-white p-2 -ml-2">
        <span class="material-symbols-outlined text-[28px]">menu</span>
      </button>
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-white icon-fill">school</span>
        <span class="text-white font-bold">Kavana</span>
      </div>
      <div class="w-10"></div>
    </div>
  `;
}

// Bind sidebar events
export function bindSidebarEvents(onMenuClick) {
    // Logout button
    const logoutBtn = document.getElementById("btn-logout");
    logoutBtn?.addEventListener("click", () => {
        clearToken();
        sessionStorage.clear();
        window.location.href = "/login.html";
    });

    // Mobile sidebar toggle
    const openBtn = document.getElementById("btn-open-sidebar");
    const closeBtn = document.getElementById("btn-close-sidebar");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    openBtn?.addEventListener("click", () => {
        sidebar?.classList.remove("-translate-x-full");
        overlay?.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });

    closeBtn?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);

    // Menu item clicks
    const menuItems = document.querySelectorAll(".sidebar-menu-item");
    menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const menuId = item.dataset.menu;

            // Close sidebar on mobile after menu click
            if (window.innerWidth < 1024) {
                closeSidebar();
            }

            if (onMenuClick) {
                onMenuClick(menuId);
            }
        });
    });
}

// Close sidebar function (for mobile)
function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.add("-translate-x-full");
    overlay?.classList.add("hidden");
    document.body.style.overflow = "";
}

// Make closeSidebar available globally for onclick
window.closeSidebar = closeSidebar;

// Update active menu state
export function updateActiveMenu(activeMenu) {
    const menuItems = document.querySelectorAll(".sidebar-menu-item");
    menuItems.forEach((item) => {
        const isActive = item.dataset.menu === activeMenu;
        if (isActive) {
            item.classList.remove("text-white/80", "hover:bg-white/10");
            item.classList.add("bg-white/20", "text-white", "font-semibold", "shadow-lg");
        } else {
            item.classList.add("text-white/80", "hover:bg-white/10");
            item.classList.remove("bg-white/20", "text-white", "font-semibold", "shadow-lg");
        }
    });
}

// Update user display in sidebar
export function updateSidebarUser() {
    const userName = sessionStorage.getItem("userName") || "User";
    const userEmail = sessionStorage.getItem("userEmail") || "";

    const avatarName = document.querySelector(".avatar-name");
    const avatarEmail = document.querySelector(".avatar-email");
    const avatarCircle = document.querySelector(".avatar-circle");

    if (avatarName) avatarName.textContent = userName;
    if (avatarEmail) avatarEmail.textContent = userEmail;
    if (avatarCircle) avatarCircle.textContent = userName.charAt(0).toUpperCase();
}

// Update bimbingan badge count
export function updateBimbinganBadge(count) {
    const badge = document.querySelector(".sidebar-badge");
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }
}
