// ========================================
// FORMAT UTILITIES
// Reusable formatting functions
// ========================================

/**
 * Format date to Indonesian locale
 * @param {string|Date} dateStr - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(dateStr, options = {}) {
    if (!dateStr) return "-";

    const date = new Date(dateStr);

    const defaultOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...options,
    };

    return date.toLocaleDateString("id-ID", defaultOptions);
}

/**
 * Format date with day name
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} - Formatted date with weekday
 */
export function formatDateFull(dateStr) {
    return formatDate(dateStr, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/**
 * Format date short (for compact display)
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} - Formatted date short
 */
export function formatDateShort(dateStr) {
    return formatDate(dateStr, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Get track display name from track ID
 * @param {string} trackId - Track ID (supports 'proyek1' and 'proyek-1' formats)
 * @returns {string} - Display name
 */
export function getTrackDisplayName(trackId) {
    const names = {
        // Frontend format (with dash)
        "proyek-1": "Proyek 1",
        "proyek-2": "Proyek 2",
        "proyek-3": "Proyek 3",
        "internship-1": "Internship 1",
        "internship-2": "Internship 2",
        // Backend format (without dash)
        "proyek1": "Proyek 1",
        "proyek2": "Proyek 2",
        "proyek3": "Proyek 3",
        "internship1": "Internship 1",
        "internship2": "Internship 2",
    };
    return names[trackId] || trackId || "Tidak diketahui";
}

/**
 * Get status display info (text, color, icon)
 * @param {string} status - Status string
 * @returns {Object} - { text, color, icon }
 */
export function getStatusDisplay(status) {
    const statusMap = {
        approved: { text: "Disetujui", color: "green", icon: "check_circle" },
        pending: { text: "Pending", color: "yellow", icon: "pending" },
        rejected: { text: "Ditolak", color: "red", icon: "cancel" },
        completed: { text: "Selesai", color: "green", icon: "verified" },
        scheduled: { text: "Terjadwal", color: "blue", icon: "event" },
        lulus: { text: "Lulus", color: "green", icon: "celebration" },
        tidak_lulus: { text: "Tidak Lulus", color: "red", icon: "sentiment_dissatisfied" },
    };

    return statusMap[status] || { text: status || "Belum", color: "slate", icon: "draft" };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export function getInitials(name) {
    if (!name) return "?";

    const words = name.trim().split(" ");
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Remove academic titles from name
 * @param {string} name - Full name with titles
 * @returns {string} - Name without academic titles
 */
export function removeAcademicTitles(name) {
    if (!name) return "";

    // Common Indonesian academic titles (before and after name)
    const titlesToRemove = [
        // Prefix titles
        /^(Prof\.|Dr\.|Ir\.|Drs\.|Dra\.|H\.|Hj\.|Rd\.|R\.)\s*/gi,
        // Suffix titles - degree abbreviations
        /,?\s*(S\.Kom\.?|S\.T\.?|S\.Pd\.?|S\.S\.?|S\.H\.?|S\.E\.?|S\.I\.?|S\.Sos\.?|S\.Psi\.?|S\.Ked\.?|S\.Farm\.?|S\.Hum\.?)/gi,
        /,?\s*(M\.Kom\.?|M\.T\.?|M\.Pd\.?|M\.Hum\.?|M\.Sc\.?|M\.Si\.?|M\.M\.?|M\.H\.?|M\.Eng\.?|MT\.?|MM\.?|MBA\.?)/gi,
        /,?\s*(Ph\.?D\.?|Dr\.?|Sp\.?)/gi,
        // Professional certifications
        /,?\s*(CAIP|SFPC|CDSP|SFPE|CEH|CISSP|PMP|CFA|EBDP\.CDSP)/gi,
        // Clean up extra commas and spaces
        /,\s*,/g,
        /,\s*$/,
        /^\s*,/,
    ];

    let cleanName = name;

    for (const pattern of titlesToRemove) {
        cleanName = cleanName.replace(pattern, "");
    }

    // Clean up extra whitespace
    cleanName = cleanName.replace(/\s+/g, " ").trim();

    return cleanName;
}
