import "./style.css"; // Landing page uses original CSS

// ---------- LANDING PAGE INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const landingNav = document.getElementById("landing-nav");

    mobileMenuBtn?.addEventListener("click", () => {
        mobileMenuBtn.classList.toggle("active");
        landingNav.classList.toggle("active");
        document.body.style.overflow = landingNav.classList.contains("active") ? "hidden" : "";
    });

    // Close mobile menu when clicking a nav link
    const closeMobileMenu = () => {
        mobileMenuBtn?.classList.remove("active");
        landingNav?.classList.remove("active");
        document.body.style.overflow = "";
    };

    // Tombol Login
    document.getElementById("btn-login")?.addEventListener("click", () => {
        closeMobileMenu();
        window.location.href = "/login.html";
    });

    // Tombol Register
    document.getElementById("btn-register")?.addEventListener("click", () => {
        closeMobileMenu();
        window.location.href = "/register.html";
    });

    // Tombol Hero
    document.getElementById("btn-hero-start")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    document.getElementById("btn-hero-demo")?.addEventListener("click", () => {
        const role = sessionStorage.getItem("userRole") || "mahasiswa";
        const dashboardUrls = {
            mahasiswa: "/mahasiswa/dashboard.html",
            dosen: "/dosen/dashboard.html",
            koordinator: "/koordinator/dashboard.html",
            kaprodi: "/kaprodi/dashboard.html",
        };
        window.location.href = dashboardUrls[role] || dashboardUrls.mahasiswa;
    });

    // Tombol CTA
    document.getElementById("btn-cta-register")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Smooth scroll untuk anchor links
    document.querySelectorAll('.landing-nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            closeMobileMenu();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});
