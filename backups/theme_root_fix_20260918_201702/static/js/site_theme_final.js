(function () {

    "use strict";


    const STORAGE_KEY =
        "rr_site_theme_final";


    const THEME_VERSION_KEY =
        "rr_reference_theme_v20";


    const oldKeys = [
        "rr_clean_theme",
        "rr_master_theme",
        "rr_theme_v3",
        "rr_site_theme"
    ];


    const moonIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="
                M20.5 15.3
                A8.4 8.4 0 0 1
                8.7 3.5
                A8.8 8.8 0 1 0
                20.5 15.3
                Z
                "
            ></path>
        </svg>
    `;


    const sunIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="4"
                fill="currentColor"
            ></circle>

            <g
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <path d="M12 2V5"></path>
                <path d="M12 19V22"></path>
                <path d="M2 12H5"></path>
                <path d="M19 12H22"></path>
                <path d="M4.9 4.9L7 7"></path>
                <path d="M17 17L19.1 19.1"></path>
                <path d="M17 7L19.1 4.9"></path>
                <path d="M4.9 19.1L7 17"></path>
            </g>
        </svg>
    `;


    function getSavedTheme() {

        try {

            /*
             Force the new reference theme once so old accidental
             light-mode values from localhost/Render do not win.
            */

            if (
                localStorage.getItem(
                    THEME_VERSION_KEY
                )
                !== "1"
            ) {

                localStorage.setItem(
                    THEME_VERSION_KEY,
                    "1"
                );

                localStorage.setItem(
                    STORAGE_KEY,
                    "dark"
                );

                return "dark";
            }


            const value =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                value === "dark"
                ||
                value === "light"
            ) {
                return value;
            }

        } catch (error) {}


        return "dark";

    }


    function saveTheme(
        theme
    ) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                theme
            );

        } catch (error) {}

    }


    function currentTheme() {

        return (
            document.documentElement
            .getAttribute(
                "data-rr-theme"
            )
            ||
            "dark"
        );

    }


    function updateButton() {

        const button =
            document.getElementById(
                "rrFinalThemeToggle"
            );


        if (!button) {
            return;
        }


        const dark =
            currentTheme()
            === "dark";


        button.innerHTML =
            dark
                ? sunIcon
                : moonIcon;


        button.title =
            dark
                ? "Switch to Light Mode"
                : "Switch to Dark Mode";


        button.setAttribute(
            "aria-label",
            button.title
        );

    }


    function applyTheme(
        theme
    ) {

        const finalTheme =
            theme === "dark"
                ? "dark"
                : "light";


        /*
         Remove old theme state.
        */

        document.documentElement
            .classList
            .remove(
                "rr-dark",
                "rr-clean-dark"
            );


        document.documentElement
            .setAttribute(
                "data-rr-theme",
                finalTheme
            );


        const meta =
            document.querySelector(
                'meta[name="theme-color"]'
            );


        if (meta) {

            meta.setAttribute(
                "content",
                finalTheme === "dark"
                    ? "#101010"
                    : "#f4f1e9"
            );

        }


        saveTheme(
            finalTheme
        );


        updateButton();

    }


    function toggleTheme() {

        applyTheme(
            currentTheme()
            === "dark"
                ? "light"
                : "dark"
        );

    }


    function createButton() {

        /*
         Remove old theme buttons
         if browser has stale DOM scripts.
        */

        [
            "rrThemeToggle",
            "rrCleanThemeToggle"
        ]
        .forEach(
            function (id) {

                const old =
                    document.getElementById(
                        id
                    );


                if (old) {
                    old.remove();
                }

            }
        );


        let button =
            document.getElementById(
                "rrFinalThemeToggle"
            );


        if (button) {

            updateButton();

            return;

        }


        button =
            document.createElement(
                "button"
            );


        button.id =
            "rrFinalThemeToggle";


        button.type =
            "button";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                toggleTheme();

            }
        );


        const subscribe =
            document.querySelector(
                ".raj-subscribe-nav"
            )
            ||
            Array.from(
                document.querySelectorAll(
                    "a, button"
                )
            )
            .find(
                function (element) {

                    return (
                        element.textContent
                        .trim()
                        .toLowerCase()
                        === "subscribe"
                    );

                }
            );


        if (
            subscribe
            &&
            subscribe.parentElement
        ) {

            subscribe.parentElement
                .insertBefore(
                    button,
                    subscribe
                );

        } else {

            button.style.position =
                "fixed";

            button.style.top =
                "85px";

            button.style.right =
                "18px";

            button.style.zIndex =
                "99999";

            document.body.appendChild(
                button
            );

        }


        updateButton();

    }


    function boot() {

        applyTheme(
            getSavedTheme()
        );


        createButton();

    }


    if (
        document.readyState
        === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }

})();
