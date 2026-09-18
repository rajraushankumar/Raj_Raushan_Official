(function () {
    "use strict";

    const storageKey = "rr_site_theme_final";
    const versionKey = "rr_reference_theme_v20";

    try {
        let theme = localStorage.getItem(storageKey);

        if (localStorage.getItem(versionKey) !== "1") {
            theme = "dark";
            localStorage.setItem(versionKey, "1");
            localStorage.setItem(storageKey, "dark");
        }

        if (theme !== "dark" && theme !== "light") {
            theme = "dark";
        }

        document.documentElement.setAttribute("data-rr-theme", theme);
    } catch (error) {
        document.documentElement.setAttribute("data-rr-theme", "dark");
    }
})();
