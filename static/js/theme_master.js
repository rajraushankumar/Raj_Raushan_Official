(function () {

    "use strict";


    const STORAGE_KEY =
        "rr_master_theme";


    const moonIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="
                M20.6 15.4
                A8.5 8.5 0 0 1
                8.6 3.4
                A8.8 8.8 0 1 0
                20.6 15.4
                Z
                "
            />
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


    const playIcon = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M8.5 6.5L18 12L8.5 17.5Z"
                fill="currentColor"
            />
        </svg>
    `;


    function clean(
        value
    ) {

        return String(
            value || ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .toLowerCase();

    }


    function getStoredTheme() {

        try {

            return localStorage.getItem(
                STORAGE_KEY
            );

        } catch (error) {

            return null;

        }

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


    function isDark() {

        return document
            .documentElement
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
                sunIcon;


            button.title =
                "Switch to Light Mode";


            button.setAttribute(
                "aria-label",
                "Switch to Light Mode"
            );

        } else {

            button.innerHTML =
                moonIcon;


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


        document
            .documentElement
            .classList
            .toggle(
                "rr-dark",
                dark
            );


        document
            .documentElement
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


        saveTheme(
            next
        );

    }


    /* ======================================================
       CREATE THEME BUTTON
    ====================================================== */

    function createThemeButton() {

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

                        return clean(
                            element.textContent
                        ) === "subscribe";

                    }
                );


            if (subscribe) {

                subscribe.classList.add(
                    "rr-theme-subscribe"
                );


                if (
                    subscribe.parentElement
                ) {

                    subscribe
                        .parentElement
                        .insertBefore(
                            button,
                            subscribe
                        );

                }

            } else {

                document.body.appendChild(
                    button
                );


                button.style.position =
                    "fixed";


                button.style.top =
                    "90px";


                button.style.right =
                    "20px";

            }


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    toggleTheme();

                }
            );

        }


        updateButton();

    }


    /* ======================================================
       HELPERS
    ====================================================== */

    function findHeading(
        words
    ) {

        return Array
            .from(
                document.querySelectorAll(
                    "h1, h2, h3, h4, h5, strong"
                )
            )
            .find(
                function (element) {

                    const text =
                        clean(
                            element.textContent
                        );


                    return words.some(
                        function (word) {

                            return text.includes(
                                word
                            );

                        }
                    );

                }
            );

    }


    function findAncestor(
        start,
        tester
    ) {

        let current =
            start;


        for (
            let i = 0;
            i < 9 && current;
            i++
        ) {

            if (
                tester(
                    current
                )
            ) {

                return current;

            }


            current =
                current.parentElement;

        }


        return null;

    }


    function actionCount(
        root,
        phrase
    ) {

        if (!root) {
            return 0;
        }


        return Array
            .from(
                root.querySelectorAll(
                    "a, button"
                )
            )
            .filter(
                function (element) {

                    return clean(
                        element.textContent
                    ).includes(
                        phrase
                    );

                }
            )
            .length;

    }


    function findCard(
        element,
        stop,
        phrase
    ) {

        let current =
            element;


        for (
            let i = 0;
            i < 8 && current;
            i++
        ) {

            if (
                current === stop
            ) {
                break;
            }


            const hasImage =
                current.querySelector
                &&
                current.querySelector(
                    "img"
                );


            const text =
                clean(
                    current.textContent
                );


            if (
                hasImage
                &&
                (
                    !phrase
                    ||
                    text.includes(
                        phrase
                    )
                )
            ) {

                return current;

            }


            current =
                current.parentElement;

        }


        return null;

    }


    /* ======================================================
       STORIES BEYOND SCREEN
    ====================================================== */

    function tagFeatureSection() {

        const heading =
            findHeading(
                [
                    "stories beyond the screen"
                ]
            );


        if (!heading) {
            return;
        }


        const section =
            findAncestor(
                heading,
                function (element) {

                    const text =
                        clean(
                            element.textContent
                        );


                    return (
                        text.includes(
                            "original content"
                        )
                        &&
                        text.includes(
                            "real locations"
                        )
                        &&
                        text.includes(
                            "growing journey"
                        )
                        &&
                        text.includes(
                            "creator technology"
                        )
                    );

                }
            );


        if (!section) {
            return;
        }


        section.classList.add(
            "rr-theme-section",
            "rr-theme-feature-section"
        );


        [
            "original content",
            "real locations",
            "growing journey",
            "creator technology"
        ]
        .forEach(
            function (label) {

                const node =
                    Array.from(
                        section.querySelectorAll(
                            "h1, h2, h3, h4, strong"
                        )
                    )
                    .find(
                        function (item) {

                            return clean(
                                item.textContent
                            ).includes(
                                label
                            );

                        }
                    );


                if (!node) {
                    return;
                }


                let card =
                    node.closest(
                        "article, [class*='card']"
                    );


                if (!card) {

                    card =
                        node.parentElement;

                }


                if (
                    card
                    &&
                    card !== section
                ) {

                    card.classList.add(
                        "rr-theme-card",
                        "rr-theme-feature-card"
                    );

                }

            }
        );


        Array.from(
            section.querySelectorAll(
                "*"
            )
        )
        .forEach(
            function (element) {

                if (
                    element.children.length === 0
                    &&
                    /^0[1-4]$/.test(
                        element.textContent.trim()
                    )
                ) {

                    element.classList.add(
                        "rr-theme-number"
                    );

                }

            }
        );

    }


    /* ======================================================
       YOUTUBE CHANNELS
    ====================================================== */

    function tagChannels() {

        const heading =
            findHeading(
                [
                    "my youtube channels"
                ]
            );


        if (!heading) {
            return;
        }


        const section =
            findAncestor(
                heading,
                function (element) {

                    return (
                        actionCount(
                            element,
                            "visit channel"
                        )
                        >= 2
                    );

                }
            );


        if (!section) {
            return;
        }


        section.classList.add(
            "rr-theme-section",
            "rr-theme-channel-section"
        );


        heading.classList.add(
            "rr-theme-channel-heading"
        );


        Array.from(
            section.querySelectorAll(
                "a, button"
            )
        )
        .filter(
            function (element) {

                return clean(
                    element.textContent
                ).includes(
                    "visit channel"
                );

            }
        )
        .forEach(
            function (button) {

                const card =
                    findCard(
                        button,
                        section,
                        "subscribers"
                    );


                if (card) {

                    card.classList.add(
                        "rr-theme-card",
                        "rr-theme-channel-card"
                    );

                }

            }
        );

    }


    /* ======================================================
       FEATURED STORIES
    ====================================================== */

    function tagStories() {

        const heading =
            findHeading(
                [
                    "journeys worth watching"
                ]
            );


        if (!heading) {
            return;
        }


        const section =
            findAncestor(
                heading,
                function (element) {

                    return (
                        actionCount(
                            element,
                            "watch story"
                        )
                        >= 1
                    );

                }
            );


        if (!section) {
            return;
        }


        section.classList.add(
            "rr-theme-section",
            "rr-theme-story-section"
        );


        Array.from(
            section.querySelectorAll(
                "a, button"
            )
        )
        .filter(
            function (element) {

                return clean(
                    element.textContent
                ).includes(
                    "watch story"
                );

            }
        )
        .forEach(
            function (button) {

                button.textContent =
                    "Watch Story ?";


                const card =
                    findCard(
                        button,
                        section,
                        "watch story"
                    );


                if (!card) {
                    return;
                }


                card.classList.add(
                    "rr-theme-card",
                    "rr-theme-story-card"
                );


                Array.from(
                    card.querySelectorAll(
                        "*"
                    )
                )
                .forEach(
                    function (element) {

                        if (
                            element.children.length
                            === 0
                            &&
                            element.textContent
                                .trim()
                            === "?"
                        ) {

                            element.innerHTML =
                                playIcon;


                            element.classList.add(
                                "rr-theme-play"
                            );

                        }

                    }
                );

            }
        );

    }


    /* ======================================================
       LATEST VLOGS
    ====================================================== */

    function tagVlogs() {

        const heading =
            findHeading(
                [
                    "latest vlogs"
                ]
            );


        if (!heading) {
            return;
        }


        const section =
            findAncestor(
                heading,
                function (element) {

                    return (
                        actionCount(
                            element,
                            "watch vlog"
                        )
                        >= 1
                    );

                }
            );


        if (!section) {
            return;
        }


        section.classList.add(
            "rr-theme-section",
            "rr-theme-video-section"
        );


        Array.from(
            section.querySelectorAll(
                "a, button"
            )
        )
        .filter(
            function (element) {

                return clean(
                    element.textContent
                ).includes(
                    "watch vlog"
                );

            }
        )
        .forEach(
            function (button) {

                const card =
                    findCard(
                        button,
                        section,
                        "watch vlog"
                    );


                if (card) {

                    card.classList.add(
                        "rr-theme-card",
                        "rr-theme-video-card"
                    );

                }

            }
        );

    }


    /* ======================================================
       LATEST SHORTS
    ====================================================== */

    function tagShorts() {

        const heading =
            findHeading(
                [
                    "latest shorts"
                ]
            );


        if (!heading) {
            return;
        }


        const section =
            findAncestor(
                heading,
                function (element) {

                    return (
                        element.querySelectorAll(
                            "img"
                        ).length >= 4
                    );

                }
            );


        if (!section) {
            return;
        }


        section.classList.add(
            "rr-theme-section",
            "rr-theme-video-section"
        );


        Array.from(
            section.querySelectorAll(
                "a"
            )
        )
        .filter(
            function (element) {

                return Boolean(
                    element.querySelector(
                        "img"
                    )
                );

            }
        )
        .forEach(
            function (card) {

                card.classList.add(
                    "rr-theme-card",
                    "rr-theme-video-card"
                );

            }
        );

    }


    /* ======================================================
       CLEAN BROKEN ? ACTIONS
    ====================================================== */

    function cleanQuestionMarks() {

        Array.from(
            document.querySelectorAll(
                "a, button"
            )
        )
        .forEach(
            function (element) {

                const text =
                    element.textContent
                    .trim();


                if (
                    /view all vlogs\s*\?$/i
                    .test(
                        text
                    )
                ) {

                    element.textContent =
                        text.replace(
                            /\?$/,
                            "?"
                        );

                }


                if (
                    /watch story\s*\?$/i
                    .test(
                        text
                    )
                ) {

                    element.textContent =
                        text.replace(
                            /\?$/,
                            "?"
                        );

                }

            }
        );

    }


    /* ======================================================
       BOOT
    ====================================================== */

    function tagEverything() {

        tagFeatureSection();

        tagChannels();

        tagStories();

        tagVlogs();

        tagShorts();

        cleanQuestionMarks();

    }


    function boot() {

        const stored =
            getStoredTheme();


        if (
            stored === "dark"
            ||
            stored === "light"
        ) {

            applyTheme(
                stored
            );

        } else {

            applyTheme(
                "light"
            );

        }


        createThemeButton();

        tagEverything();


        /*
         Some YouTube content arrives later.
        */

        setTimeout(
            tagEverything,
            500
        );


        setTimeout(
            tagEverything,
            1400
        );

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
