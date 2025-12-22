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
 * @param {Array} options.hiddenMenus - Menu IDs to hide (for conditional menus)
 * @returns {Object} - { currentRole, isAuthenticated }
 */
export function initPage(options = {}) {
    const { activeMenu = "dashboard", onInit = null, requireAuth = true, hiddenMenus = [] } = options;

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
        sidebarPlaceholder.outerHTML = getSidebarHTML(currentRole, activeMenu, hiddenMenus);
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
 * Initialize page with async periode check for mahasiswa
 * Menu track, kelompok, bimbingan, proposal, laporan hidden jika tidak ada periode aktif
 * @param {Object} options - Same as initPage
 * @returns {Promise<Object>} - { currentRole, isAuthenticated, periodeAktif }
 */
export async function initPageWithPeriode(options = {}) {
    const { activeMenu = "dashboard", onInit = null, requireAuth = true } = options;

    const currentRole = sessionStorage.getItem("userRole") || "mahasiswa";
    const authToken = getToken();

    // Check authentication
    if (requireAuth && !authToken) {
        window.location.href = "/login.html";
        return { currentRole: null, isAuthenticated: false, periodeAktif: null };
    }

    // For mahasiswa, check periode aktif
    let hiddenMenus = [];
    let periodeAktif = null;

    if (currentRole === "mahasiswa") {
        try {
            const { mahasiswaAPI } = await import("../api.js");
            const result = await mahasiswaAPI.getPeriodeAktif();
            if (result.ok && result.data.active) {
                periodeAktif = result.data.periode;
                // Store in session for other pages
                sessionStorage.setItem("periodeAktif", JSON.stringify(result.data));
            } else {
                // No active period, hide proyek/internship related menus
                hiddenMenus = ["track", "kelompok", "bimbingan", "proposal", "laporan"];
                sessionStorage.setItem("periodeAktif", JSON.stringify({ active: false }));
            }
        } catch (err) {
            console.warn("Could not check periode aktif:", err);
            // On error, show all menus (fallback)
        }
    }

    // Inject sidebar with hidden menus
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        sidebarPlaceholder.outerHTML = getSidebarHTML(currentRole, activeMenu, hiddenMenus);
        bindSidebarEvents(createMenuHandler(currentRole));
        updateSidebarUser();
    }

    // Setup mobile sidebar toggle
    setupMobileSidebar();
    window.closeSidebar = closeSidebar;

    if (onInit && typeof onInit === "function") {
        onInit();
    }

    return { currentRole, isAuthenticated: true, periodeAktif };
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
            "kelola-periode": "/koordinator/kelola-periode.html",
            "validasi-proposal": "/koordinator/validasi-proposal.html",
            "approve-pembimbing": "/koordinator/approve-pembimbing.html",
            "daftar-mahasiswa": "/koordinator/daftar-mahasiswa.html",
            "jadwal-sidang": "/koordinator/jadwal-sidang.html",
            // Dosen pembimbing pages (koordinator juga dosen)
            "mahasiswa-bimbingan": "/dosen/mahasiswa-bimbingan.html",
            "bimbingan-approve": "/dosen/bimbingan-approve.html",
            "laporan-approve": "/dosen/laporan-approve.html",
        },
        kaprodi: {
            dashboard: "/kaprodi/dashboard.html",
            "kelola-koordinator": "/kaprodi/kelola-koordinator.html",
            "daftar-dosen": "/kaprodi/daftar-dosen.html",
            monitoring: "/kaprodi/monitoring.html",
        },
        admin: {
            dashboard: "/admin/dashboard.html",
            "kelola-users": "/admin/kelola-users.html",
            "kelola-dosen": "/admin/kelola-dosen.html",
            "kelola-mahasiswa": "/admin/kelola-mahasiswa.html",
            monitoring: "/admin/monitoring.html",
            laporan: "/admin/laporan.html",
            settings: "/admin/settings.html",
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
