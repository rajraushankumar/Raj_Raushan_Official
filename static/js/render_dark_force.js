(function () {
    "use strict";

    function forceDarkTheme() {
        var html = document.documentElement;
        var body = document.body;

        html.setAttribute("data-theme", "dark");

        html.classList.remove(
            "light",
            "light-mode",
            "theme-light",
            "is-light"
        );

        html.classList.add(
            "dark",
            "dark-mode",
            "theme-dark"
        );

        if (body) {
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
            localStorage.setItem("theme", "dark");
            localStorage.setItem("site-theme", "dark");
            localStorage.setItem("rr-theme", "dark");
            localStorage.setItem("color-theme", "dark");
        } catch (e) {}
    }

    forceDarkTheme();

    document.addEventListener(
        "DOMContentLoaded",
        forceDarkTheme
    );

    window.addEventListener("load", function () {
        forceDarkTheme();

        setTimeout(forceDarkTheme, 100);
        setTimeout(forceDarkTheme, 500);
        setTimeout(forceDarkTheme, 1200);
    });
})();