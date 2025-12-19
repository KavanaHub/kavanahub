// Landing page script - Kavana

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    mobileMenuBtn?.addEventListener("click", () => {
        mobileMenu?.classList.toggle("hidden");
        const icon = mobileMenuBtn.querySelector(".material-icons");
        if (icon) {
            icon.textContent = mobileMenu?.classList.contains("hidden") ? "menu" : "close";
        }
    });

    // Close mobile menu when clicking a link
    const closeMobileMenu = () => {
        mobileMenu?.classList.add("hidden");
        const icon = mobileMenuBtn?.querySelector(".material-icons");
        if (icon) icon.textContent = "menu";
    };

    // Desktop Login button
    document.getElementById("btn-login")?.addEventListener("click", () => {
        window.location.href = "/login.html";
    });

    // Desktop Register button
    document.getElementById("btn-register")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Mobile Login button
    document.getElementById("btn-login-mobile")?.addEventListener("click", () => {
        closeMobileMenu();
        window.location.href = "/login.html";
    });

    // Mobile Register button
    document.getElementById("btn-register-mobile")?.addEventListener("click", () => {
        closeMobileMenu();
        window.location.href = "/register.html";
    });

    // Hero Start button
    document.getElementById("btn-hero-start")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Hero Demo button
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

    // CTA Register button
    document.getElementById("btn-cta-register")?.addEventListener("click", () => {
        window.location.href = "/register.html";
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

    // Add scroll effect to navbar
    const nav = document.querySelector("nav");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            nav?.classList.add("shadow-md");
        } else {
            nav?.classList.remove("shadow-md");
        }
    });
});
