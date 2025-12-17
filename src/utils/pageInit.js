// ========================================
// PAGE INITIALIZATION UTILITIES
// Reusable functions for page setup
// ========================================

import { getToken, clearToken } from "../api.js";
import { getSidebarHTML, bindSidebarEvents, updateSidebarUser } from "../components/sidebar.js";

/**
 * Initialize a page with authentication check and sidebar
 * @param {Object} options - Configuration options
 * @param {string} options.activeMenu - Current active menu item ID
 * @param {Function} options.onInit - Callback after initialization
 * @param {boolean} options.requireAuth - Whether authentication is required (default: true)
 * @returns {Object} - { currentRole, isAuthenticated }
 */
export function initPage(options = {}) {
    const { activeMenu = "dashboard", onInit = null, requireAuth = true } = options;

    const currentRole = sessionStorage.getItem("userRole") || "mahasiswa";
    const authToken = getToken();

    // Check authentication
    if (requireAuth && !authToken) {
        window.location.href = "/login.html";
        return { currentRole: null, isAuthenticated: false };
    }

    // Inject sidebar
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        sidebarPlaceholder.outerHTML = getSidebarHTML(currentRole, activeMenu);
        bindSidebarEvents(createMenuHandler(currentRole));
        updateSidebarUser();
    }

    // Setup mobile sidebar toggle
    setupMobileSidebar();

    // Setup global closeSidebar function
    window.closeSidebar = closeSidebar;

    // Call onInit callback if provided
    if (onInit && typeof onInit === "function") {
        onInit();
    }

    return { currentRole, isAuthenticated: true };
}

/**
 * Setup mobile sidebar toggle functionality
 */
export function setupMobileSidebar() {
    const openBtn = document.getElementById("btn-open-sidebar");

    openBtn?.addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        sidebar?.classList.remove("-translate-x-full");
        overlay?.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });
}

/**
 * Close sidebar (for mobile)
 */
export function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar?.classList.add("-translate-x-full");
    overlay?.classList.add("hidden");
    document.body.style.overflow = "";
}

/**
 * Create menu click handler with role-based navigation
 * @param {string} currentRole - Current user role
 * @returns {Function} - Menu click handler
 */
export function createMenuHandler(currentRole = "mahasiswa") {
    // Role-based redirect pages
    const rolePages = {
        mahasiswa: {
            dashboard: "/mahasiswa/dashboard.html",
            track: "/mahasiswa/track.html",
            kelompok: "/mahasiswa/kelompok.html",
            proposal: "/mahasiswa/proposal.html",
            bimbingan: "/mahasiswa/bimbingan.html",
            laporan: "/mahasiswa/laporan.html",
            nilai: "/mahasiswa/hasil.html",
        },
        dosen: {
            dashboard: "/dosen/dashboard.html",
            "mahasiswa-bimbingan": "/dosen/mahasiswa-bimbingan.html",
            "bimbingan-approve": "/dosen/bimbingan-approve.html",
            "laporan-approve": "/dosen/laporan-approve.html",
        },
        koordinator: {
            dashboard: "/koordinator/dashboard.html",
            "validasi-proposal": "/koordinator/validasi-proposal.html",
            "approve-pembimbing": "/koordinator/approve-pembimbing.html",
            "daftar-mahasiswa": "/koordinator/daftar-mahasiswa.html",
        },
        kaprodi: {
            dashboard: "/kaprodi/dashboard.html",
            "daftar-dosen": "/kaprodi/daftar-dosen.html",
            monitoring: "/kaprodi/monitoring.html",
        },
    };

    // Shared pages (all roles)
    const sharedPages = {
        profile: "/shared/profile.html",
        settings: "/shared/settings.html",
    };

    return function handleMenuClick(menuId) {
        // Check role-specific pages first
        const rolePagesMap = rolePages[currentRole] || rolePages.mahasiswa;
        if (rolePagesMap[menuId]) {
            window.location.href = rolePagesMap[menuId];
            return;
        }

        // Check shared pages
        if (sharedPages[menuId]) {
            window.location.href = sharedPages[menuId];
            return;
        }

        console.warn(`No route found for menu: ${menuId}`);
    };
}

/**
 * Get dashboard URL based on role
 * @param {string} role - User role
 * @returns {string} - Dashboard URL
 */
export function getDashboardURL(role) {
    const dashboards = {
        mahasiswa: "/mahasiswa/dashboard.html",
        dosen: "/dosen/dashboard.html",
        koordinator: "/koordinator/dashboard.html",
        kaprodi: "/kaprodi/dashboard.html",
    };
    return dashboards[role] || dashboards.mahasiswa;
}

/**
 * Logout user and redirect to login
 */
export function logout() {
    clearToken();
    sessionStorage.clear();
    window.location.href = "/login.html";
}
