(function () {

    "use strict";

    const KEY =
        "rr_theme_v3";


    const moon = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="
                M20.7 15.2
                A8.4 8.4 0 0 1
                8.8 3.3
                A8.8 8.8 0 1 0
                20.7 15.2
                Z
                "
            />
        </svg>
    `;


    const sun = `
        <svg viewBox="0 0 24 24" aria-hidden="true">

            <circle
                cx="12"
                cy="12"
                r="4"
                fill="currentColor"
            />

            <g
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <path d="M12 2V5"/>
                <path d="M12 19V22"/>

                <path d="M2 12H5"/>
                <path d="M19 12H22"/>

                <path d="M4.9 4.9L7 7"/>
                <path d="M17 17L19.1 19.1"/>

                <path d="M17 7L19.1 4.9"/>
                <path d="M4.9 19.1L7 17"/>
            </g>

        </svg>
    `;


    function savedTheme() {

        try {

            return localStorage.getItem(
                KEY
            );

        } catch (error) {

            return null;

        }

    }


    function setSavedTheme(
        theme
    ) {

        try {

            localStorage.setItem(
                KEY,
                theme
            );

        } catch (error) {}

    }


    function isDark() {

        return document.documentElement
            .classList
            .contains(
                "rr-dark"
            );

    }


    function updateButton() {

        const button =
            document.getElementById(
                "rrThemeToggle"
            );


        if (!button) {
            return;
        }


        if (isDark()) {

            button.innerHTML =
                sun;


            button.title =
                "Switch to Light Mode";


            button.setAttribute(
                "aria-label",
                "Switch to Light Mode"
            );

        } else {

            button.innerHTML =
                moon;


            button.title =
                "Switch to Dark Mode";


            button.setAttribute(
                "aria-label",
                "Switch to Dark Mode"
            );

        }

    }


    function applyTheme(
        theme
    ) {

        const dark =
            theme === "dark";


        document.documentElement
            .classList
            .toggle(
                "rr-dark",
                dark
            );


        if (document.body) {

            document.body
                .classList
                .toggle(
                    "rr-dark",
                    dark
                );

        }


        document.documentElement
            .setAttribute(
                "data-theme",
                dark
                    ? "dark"
                    : "light"
            );


        updateButton();

    }


    function toggleTheme() {

        const next =
            isDark()
                ? "light"
                : "dark";


        applyTheme(
            next
        );


        setSavedTheme(
            next
        );


        console.log(
            "Theme changed:",
            next
        );

    }


    function createButton() {

        let button =
            document.getElementById(
                "rrThemeToggle"
            );


        if (!button) {

            button =
                document.createElement(
                    "button"
                );


            button.id =
                "rrThemeToggle";


            button.type =
                "button";


            const subscribe =
                Array.from(
                    document.querySelectorAll(
                        "a, button"
                    )
                )
                .find(
                    function (element) {

                        return (
                            element.id
                            !== "rrThemeToggle"
                            &&
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

                document.body
                    .appendChild(
                        button
                    );


                button.style.position =
                    "fixed";


                button.style.right =
                    "20px";


                button.style.top =
                    "90px";

            }

        }


        updateButton();

    }


    function boot() {

        const saved =
            savedTheme();


        applyTheme(
            saved === "dark"
                ? "dark"
                : "light"
        );


        createButton();


        /*
         Direct button handler
        */

        const button =
            document.getElementById(
                "rrThemeToggle"
            );


        if (
            button
            &&
            !button.dataset.themeBound
        ) {

            button.dataset.themeBound =
                "1";


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleTheme();

                }
            );

        }

    }


    /*
     Event delegation fallback.
     Even if another script replaces the button,
     this will still work.
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest
                ? event.target.closest(
                    "#rrThemeToggle"
                )
                : null;


            if (!button) {
                return;
            }


            if (
                button.dataset.themeBound
                === "1"
            ) {

                return;

            }


            event.preventDefault();

            toggleTheme();

        }
    );


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


/* YOUTUBE_CHANNEL_CLASS_FIX_V4 */

(function () {

    function normalize(value) {

        return String(
            value || ""
        )
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    }


    function installChannelThemeClasses() {

        const headings =
            Array.from(
                document.querySelectorAll(
                    "h1, h2, h3"
                )
            );


        const heading =
            headings.find(
                function (item) {

                    return normalize(
                        item.textContent
                    ).includes(
                        "my youtube channels"
                    );

                }
            );


        if (!heading) {
            return;
        }


        heading.classList.add(
            "rr-channel-heading"
        );


        /*
         Find section containing heading
         and both Visit Channel buttons.
        */

        let section =
            heading.parentElement;


        while (
            section
            &&
            section !== document.body
        ) {

            const visitButtons =
                Array.from(
                    section.querySelectorAll(
                        "a, button"
                    )
                )
                .filter(
                    function (item) {

                        return normalize(
                            item.textContent
                        ).includes(
                            "visit channel"
                        );

                    }
                );


            if (
                visitButtons.length >= 2
            ) {

                break;

            }


            section =
                section.parentElement;

        }


        if (
            !section
            ||
            section === document.body
        ) {
            return;
        }


        section.classList.add(
            "rr-channel-section"
        );


        const visitButtons =
            Array.from(
                section.querySelectorAll(
                    "a, button"
                )
            )
            .filter(
                function (item) {

                    return normalize(
                        item.textContent
                    ).includes(
                        "visit channel"
                    );

                }
            );


        visitButtons.forEach(
            function (button) {

                let card =
                    button.parentElement;


                while (
                    card
                    &&
                    card.parentElement
                    &&
                    card.parentElement !== section
                ) {

                    /*
                     Stop at useful card containing
                     profile image + Visit Channel.
                    */

                    if (
                        card.querySelector(
                            "img"
                        )
                        &&
                        normalize(
                            card.textContent
                        ).includes(
                            "visit channel"
                        )
                    ) {

                        break;

                    }


                    card =
                        card.parentElement;

                }


                if (!card) {
                    return;
                }


                card.classList.add(
                    "rr-channel-card"
                );


                /*
                 Mark large numeric stats.
                */

                Array.from(
                    card.querySelectorAll(
                        "strong, h3, h4"
                    )
                )
                .forEach(
                    function (item) {

                        const text =
                            item.textContent
                            .trim()
                            .replace(/,/g, "");


                        if (
                            /^[0-9]+$/.test(
                                text
                            )
                        ) {

                            item.classList.add(
                                "rr-channel-stat-number"
                            );

                        }

                    }
                );

            }
        );

    }


    if (
        document.readyState
        === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            installChannelThemeClasses
        );

    } else {

        installChannelThemeClasses();

    }

})();
