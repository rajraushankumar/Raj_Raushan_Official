(function () {
    "use strict";

    const keys = [
        "rr_site_theme_final",
        "rr_clean_theme",
        "rr_master_theme",
        "rr_theme_v3",
        "rr_site_theme",
        "theme",
        "site-theme",
        "rr-theme",
        "color-theme"
    ];

    function forceDarkTheme() {
        const html = document.documentElement;
        const body = document.body;

        html.setAttribute("data-rr-theme", "dark");
        html.setAttribute("data-theme", "dark");

        html.classList.remove(
            "light",
            "light-mode",
            "theme-light",
            "is-light",
            "rr-clean-light"
        );

        html.classList.add(
            "dark",
            "dark-mode",
            "theme-dark"
        );

        if (body) {
            body.setAttribute("data-rr-theme", "dark");
            body.setAttribute("data-theme", "dark");

            body.classList.remove(
                "light",
                "light-mode",
                "theme-light",
                "is-light"
            );

            body.classList.add(
                "dark",
                "dark-mode",
                "theme-dark"
            );
        }

        try {
            keys.forEach(function (key) {
                localStorage.setItem(key, "dark");
            });
        } catch (error) {}

        [
            "rrFinalThemeToggle",
            "rrThemeToggle",
            "rrCleanThemeToggle"
        ].forEach(function (id) {
            const button = document.getElementById(id);

            if (button) {
                button.remove();
            }
        });

        const meta = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (meta) {
            meta.setAttribute(
                "content",
                "#101010"
            );
        }
    }

    forceDarkTheme();

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            forceDarkTheme
        );
    } else {
        forceDarkTheme();
    }

    window.addEventListener(
        "load",
        forceDarkTheme
    );
})();