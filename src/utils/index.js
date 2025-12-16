// ========================================
// UTILS INDEX - Export all utilities
// ========================================

export { initPage, setupMobileSidebar, closeSidebar, createMenuHandler, logout } from "./pageInit.js";

export {
    showFieldError,
    clearFieldError,
    clearAllErrors,
    setupErrorClearOnInput,
    isValidURL,
    setButtonLoading,
    resetButtonLoading,
} from "./formUtils.js";

export {
    formatDate,
    formatDateFull,
    formatDateShort,
    getTrackDisplayName,
    getStatusDisplay,
    truncateText,
    getInitials,
} from "./formatUtils.js";
