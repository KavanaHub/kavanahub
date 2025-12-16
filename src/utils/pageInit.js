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
        bindSidebarEvents(createMenuHandler());
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
 * Create menu click handler with common navigation
 * @returns {Function} - Menu click handler
 */
export function createMenuHandler() {
    const redirectPages = {
        dashboard: "/dashboard.html",
        track: "/track.html",
        proposal: "/proposal.html",
        bimbingan: "/bimbingan.html",
        laporan: "/laporan.html",
        nilai: "/hasil.html",
        profile: "/profile.html",
        settings: "/settings.html",
        "mahasiswa-bimbingan": "/mahasiswa-bimbingan.html",
        "bimbingan-approve": "/bimbingan-approve.html",
        "laporan-approve": "/laporan-approve.html",
        "validasi-proposal": "/validasi-proposal.html",
        "approve-pembimbing": "/approve-pembimbing.html",
    };

    return function handleMenuClick(menuId) {
        if (redirectPages[menuId]) {
            window.location.href = redirectPages[menuId];
        }
    };
}

/**
 * Logout user and redirect to login
 */
export function logout() {
    clearToken();
    sessionStorage.clear();
    window.location.href = "/login.html";
}
