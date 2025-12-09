import "./style.css";

// ---------- LANDING PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    // Tombol Login
    document.getElementById("btn-login")?.addEventListener("click", () => {
        window.location.href = "/login.html";
    });

    // Tombol Register
    document.getElementById("btn-register")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Tombol Hero
    document.getElementById("btn-hero-start")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    document.getElementById("btn-hero-demo")?.addEventListener("click", () => {
        window.location.href = "/dashboard.html";
    });

    // Tombol CTA
    document.getElementById("btn-cta-register")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Smooth scroll untuk anchor links
    document.querySelectorAll('.landing-nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});
