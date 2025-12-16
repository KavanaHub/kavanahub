// ========================================
// FORM UTILITIES
// Reusable form handling functions
// ========================================

/**
 * Show error message for a form field
 * @param {string} fieldId - The ID of the form field
 * @param {string} message - Error message to display
 */
export function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    }
    if (inputEl) {
        inputEl.classList.add("border-red-500");
    }
}

/**
 * Clear error message for a form field
 * @param {string} fieldId - The ID of the form field
 */
export function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.add("hidden");
    }
    if (inputEl) {
        inputEl.classList.remove("border-red-500");
    }
}

/**
 * Clear all form errors
 */
export function clearAllErrors() {
    document.querySelectorAll(".form-error").forEach((el) => {
        el.classList.add("hidden");
        el.textContent = "";
    });
    document.querySelectorAll("input, textarea, select").forEach((el) => {
        el.classList.remove("border-red-500");
    });
}

/**
 * Setup automatic error clearing on input
 * @param {string[]} fieldIds - Array of field IDs to setup
 */
export function setupErrorClearOnInput(fieldIds) {
    fieldIds.forEach((fieldId) => {
        const el = document.getElementById(fieldId);
        el?.addEventListener("input", () => clearFieldError(fieldId));
        el?.addEventListener("change", () => clearFieldError(fieldId));
    });
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Set submit button to loading state
 * @param {HTMLElement} button - Submit button element
 * @param {string} loadingText - Text to show while loading
 */
export function setButtonLoading(button, loadingText = "Mengirim...") {
    if (!button) return;

    button.disabled = true;
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = `
    <span class="flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
      ${loadingText}
    </span>
  `;
}

/**
 * Reset submit button from loading state
 * @param {HTMLElement} button - Submit button element
 */
export function resetButtonLoading(button) {
    if (!button) return;

    button.disabled = false;
    if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
    }
}
