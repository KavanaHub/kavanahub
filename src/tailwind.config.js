// ========================================
// SHARED TAILWIND CONFIGURATION
// ========================================
// This file contains the shared Tailwind config
// that can be loaded by all HTML pages via script tag

tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Primary colors
                "primary": "#2596be",
                "primary-dark": "#1d7a9b",

                // Background colors
                "background-light": "#e8f4f8",
                "background-dark": "#121c20",

                // Surface colors
                "surface-light": "#ffffff",
                "surface-dark": "#1a1d2d",

                // Text colors
                "text-main": "#1e2134",
                "text-primary": "#1e2134",
                "text-secondary": "#548192",

                // Border colors
                "border-light": "#e5e7eb",
                "border-dark": "#2d3245"
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "sans": ["Inter", "system-ui", "Segoe UI", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
};
