(function () {

    "use strict";

    const KEY = "rr_clean_theme";

    const moon = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="
                M20.5 15.4
                A8.5 8.5 0 0 1
                8.6 3.4
                A8.8 8.8 0 1 0
                20.5 15.4
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

    const play = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M8 6.5L18 12L8 17.5Z"
            />
        </svg>
    `;


    function txt(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }


    function important(
        element,
        property,
        value
    ) {

        if (!element) {
            return;
        }

        element.style.setProperty(
            property,
            value,
            "important"
        );
    }


    function currentTheme() {
        return document.documentElement
            .classList
            .contains("rr-clean-dark")
            ? "dark"
            : "light";
    }


    function savedTheme() {

        try {
            return localStorage.getItem(KEY);
        } catch (error) {
            return null;
        }
    }


    function storeTheme(theme) {

        try {
            localStorage.setItem(KEY, theme);
        } catch (error) {}

    }


    function colours() {

        const dark =
            currentTheme() === "dark";

        return {
            dark: dark,
            bg: dark ? "#07111f" : "#f4f7fb",
            surface: dark ? "#111c2d" : "#ffffff",
            heading: dark ? "#ffffff" : "#0b1324",
            text: dark ? "#e7edf7" : "#1e293b",
            muted: dark ? "#9cacbf" : "#64748b",
            border: dark
                ? "rgba(255,255,255,.09)"
                : "#dce4ee",
            nav: dark ? "#07101d" : "#ffffff",
            accent: dark ? "#91a7ff" : "#617ff0"
        };

    }


    function buttonUpdate() {

        const button =
            document.getElementById(
                "rrCleanThemeToggle"
            );

        if (!button) {
            return;
        }

        const dark =
            currentTheme() === "dark";

        button.innerHTML =
            dark ? sun : moon;

        button.title =
            dark
                ? "Switch to Light Mode"
                : "Switch to Dark Mode";

        button.setAttribute(
            "aria-label",
            button.title
        );
    }


    function setTheme(theme) {

        document.documentElement
            .classList
            .toggle(
                "rr-clean-dark",
                theme === "dark"
            );

        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );

        buttonUpdate();

        decorate();

        paint();
    }


    function toggleTheme() {

        const next =
            currentTheme() === "dark"
                ? "light"
                : "dark";

        storeTheme(next);

        setTheme(next);
    }


    /* ======================================================
       FINDERS
    ====================================================== */

    function elementByText(
        selectors,
        phrase
    ) {

        return Array.from(
            document.querySelectorAll(
                selectors
            )
        )
        .find(
            function (element) {

                return txt(
                    element.textContent
                ).includes(
                    phrase
                );

            }
        );
    }


    function climb(
        start,
        test,
        maxDepth
    ) {

        let current = start;

        for (
            let i = 0;
            i < (maxDepth || 10) && current;
            i++
        ) {

            if (test(current)) {
                return current;
            }

            current =
                current.parentElement;
        }

        return null;
    }


    function actions(
        root,
        phrase
    ) {

        if (!root) {
            return [];
        }

        return Array.from(
            root.querySelectorAll(
                "a, button"
            )
        )
        .filter(
            function (element) {

                return txt(
                    element.textContent
                ).includes(
                    phrase
                );

            }
        );
    }


    function cardFromAction(
        button,
        section,
        phrase
    ) {

        let current =
            button.parentElement;

        let best =
            null;

        while (
            current
            &&
            current !== section
            &&
            current !== document.body
        ) {

            const hasImage =
                !!current.querySelector("img");

            const count =
                actions(
                    current,
                    phrase
                ).length;

            if (
                hasImage
                &&
                count === 1
            ) {

                best =
                    current;
            }

            const parent =
                current.parentElement;

            if (
                best
                &&
                parent
                &&
                parent !== section
                &&
                actions(
                    parent,
                    phrase
                ).length > 1
            ) {
                break;
            }

            current =
                parent;
        }

        return best;
    }


    function cardFromImage(
        image,
        section
    ) {

        let current =
            image.parentElement;

        let best =
            null;

        while (
            current
            &&
            current !== section
            &&
            current !== document.body
        ) {

            const images =
                current.querySelectorAll(
                    "img"
                ).length;

            if (images === 1) {
                best = current;
            }

            const parent =
                current.parentElement;

            if (
                best
                &&
                parent
                &&
                parent !== section
                &&
                parent.querySelectorAll(
                    "img"
                ).length > 1
            ) {
                break;
            }

            current =
                parent;
        }

        return best;
    }


    /* ======================================================
       HEADER
    ====================================================== */

    function decorateHeader() {

        const subscribe =
            elementByText(
                "a, button",
                "subscribe"
            );

        if (!subscribe) {
            return;
        }

        subscribe.classList.add(
            "rr-clean-subscribe"
        );

        const header =
            climb(
                subscribe,
                function (element) {

                    const text =
                        txt(
                            element.textContent
                        );

                    return (
                        text.includes("home")
                        &&
                        text.includes("shorts")
                        &&
                        text.includes("explore")
                        &&
                        text.includes("subscribe")
                    );

                },
                8
            );

        if (header) {

            header.classList.add(
                "rr-clean-header"
            );

        }
    }


    /* ======================================================
       HERO
    ====================================================== */

    function decorateHero() {

        const role =
            elementByText(
                "h1, h2, h3, strong",
                "travel content creator"
            );

        if (!role) {
            return;
        }

        const hero =
            climb(
                role,
                function (element) {

                    const text =
                        txt(
                            element.textContent
                        );

                    return (
                        text.includes(
                            "explore my journeys"
                        )
                        &&
                        text.includes(
                            "work with me"
                        )
                    );

                },
                9
            );

        if (!hero) {
            return;
        }

        hero.classList.add(
            "rr-clean-hero"
        );

        const name =
            Array.from(
                hero.querySelectorAll(
                    "h1, h2"
                )
            )
            .find(
                function (element) {

                    const text =
                        txt(
                            element.textContent
                        );

                    return (
                        text.includes(
                            "raj raushan"
                        )
                        &&
                        text.includes(
                            "official"
                        )
                    );

                }
            );

        if (name) {

            name.classList.add(
                "rr-clean-main-name"
            );

            const spans =
                name.querySelectorAll(
                    "span"
                );

            if (spans.length) {

                spans[
                    spans.length - 1
                ].classList.add(
                    "rr-clean-official"
                );
            }
        }
    }


    /* ======================================================
       STORIES BEYOND SCREEN
    ====================================================== */

    function decorateFeatureSection() {

        const heading =
            elementByText(
                "h1, h2, h3",
                "stories beyond the screen"
            );

        if (!heading) {
            return;
        }

        const section =
            climb(
                heading,
                function (element) {

                    const text =
                        txt(
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
                            "creator technology"
                        )
                    );

                },
                8
            );

        if (!section) {
            return;
        }

        section.classList.add(
            "rr-clean-section"
        );

        [
            "original content",
            "real locations",
            "growing journey",
            "creator technology"
        ]
        .forEach(
            function (label) {

                const title =
                    elementByText(
                        "h1, h2, h3, h4, strong",
                        label
                    );

                if (
                    !title
                    ||
                    !section.contains(title)
                ) {
                    return;
                }

                const card =
                    climb(
                        title,
                        function (element) {

                            const text =
                                txt(
                                    element.textContent
                                );

                            return (
                                text.includes(label)
                                &&
                                text.length < 500
                            );

                        },
                        5
                    );

                if (
                    card
                    &&
                    card !== section
                ) {

                    card.classList.add(
                        "rr-clean-card"
                    );
                }
            }
        );
    }


    /* ======================================================
       YOUTUBE CHANNELS
    ====================================================== */

    function decorateChannels() {

        const heading =
            elementByText(
                "h1, h2, h3",
                "my youtube channels"
            );

        if (!heading) {
            return;
        }

        const section =
            climb(
                heading,
                function (element) {

                    return (
                        actions(
                            element,
                            "visit channel"
                        ).length >= 2
                    );

                },
                9
            );

        if (!section) {
            return;
        }

        section.classList.add(
            "rr-clean-section"
        );

        actions(
            section,
            "visit channel"
        )
        .forEach(
            function (button) {

                const card =
                    cardFromAction(
                        button,
                        section,
                        "visit channel"
                    );

                if (card) {

                    card.classList.add(
                        "rr-clean-card"
                    );
                }
            }
        );
    }


    /* ======================================================
       FEATURED STORIES
    ====================================================== */

    function decorateStories() {

        const heading =
            elementByText(
                "h1, h2, h3",
                "journeys worth watching"
            );

        if (!heading) {
            return;
        }

        const section =
            climb(
                heading,
                function (element) {

                    return (
                        actions(
                            element,
                            "watch story"
                        ).length > 0
                    );

                },
                9
            );

        if (!section) {
            return;
        }

        section.classList.add(
            "rr-clean-section"
        );

        actions(
            section,
            "watch story"
        )
        .forEach(
            function (button) {

                button.textContent =
                    "Watch Story ?";

                const card =
                    cardFromAction(
                        button,
                        section,
                        "watch story"
                    );

                if (!card) {
                    return;
                }

                card.classList.add(
                    "rr-clean-card"
                );

                Array.from(
                    card.querySelectorAll("*")
                )
                .forEach(
                    function (element) {

                        if (
                            element.children.length === 0
                            &&
                            element.textContent
                                .trim() === "?"
                        ) {

                            element.innerHTML =
                                play;

                            element.classList.add(
                                "rr-clean-play"
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

    function decorateVlogs() {

        const heading =
            elementByText(
                "h1, h2, h3",
                "latest vlogs"
            );

        if (!heading) {
            return;
        }

        const section =
            climb(
                heading,
                function (element) {

                    return (
                        actions(
                            element,
                            "watch vlog"
                        ).length > 0
                    );

                },
                9
            );

        if (!section) {
            return;
        }

        section.classList.add(
            "rr-clean-section"
        );

        actions(
            section,
            "watch vlog"
        )
        .forEach(
            function (button) {

                const card =
                    cardFromAction(
                        button,
                        section,
                        "watch vlog"
                    );

                if (card) {

                    card.classList.add(
                        "rr-clean-card"
                    );
                }
            }
        );
    }


    /* ======================================================
       LATEST SHORTS
    ====================================================== */

    function decorateShorts() {

        const heading =
            elementByText(
                "h1, h2, h3",
                "latest shorts"
            );

        if (!heading) {
            return;
        }

        const section =
            climb(
                heading,
                function (element) {

                    return (
                        element.querySelectorAll(
                            "img"
                        ).length >= 4
                    );

                },
                8
            );

        if (!section) {
            return;
        }

        section.classList.add(
            "rr-clean-section"
        );

        Array.from(
            section.querySelectorAll(
                "img"
            )
        )
        .forEach(
            function (image) {

                const card =
                    cardFromImage(
                        image,
                        section
                    );

                if (card) {

                    card.classList.add(
                        "rr-clean-card"
                    );
                }
            }
        );
    }


    /* ======================================================
       SOCIAL
    ====================================================== */

    function decorateSocial() {

        const social =
            document.querySelector(
                ".rr-social-trust-links"
            );

        if (!social) {
            return;
        }

        const section =
            climb(
                social,
                function (element) {

                    return (
                        txt(
                            element.textContent
                        ).includes(
                            "find me online"
                        )
                    );

                },
                5
            );

        if (section) {

            section.classList.add(
                "rr-clean-section"
            );
        }
    }


    /* ======================================================
       PAINT STRONG INLINE OVERRIDES
    ====================================================== */

    function paint() {

        const c = colours();


        /* BODY */

        important(
            document.body,
            "background",
            c.bg
        );


        /* HEADER */

        const header =
            document.querySelector(
                ".rr-clean-header"
            );

        if (header) {

            important(
                header,
                "background",
                c.nav
            );

            important(
                header,
                "color",
                c.text
            );


            header.querySelectorAll(
                "nav, ul, [class*='nav'], [class*='menu']"
            )
            .forEach(
                function (element) {

                    important(
                        element,
                        "background",
                        "transparent"
                    );
                }
            );


            header.querySelectorAll(
                "a:not(.rr-clean-subscribe)"
            )
            .forEach(
                function (element) {

                    important(
                        element,
                        "color",
                        c.text
                    );
                }
            );
        }


        /* HERO */

        const hero =
            document.querySelector(
                ".rr-clean-hero"
            );

        if (hero) {

            important(
                hero,
                "background",
                c.dark
                    ? "linear-gradient(135deg,#071426,#11172f)"
                    : "linear-gradient(135deg,#f8fafc,#edf3ff)"
            );


            hero.querySelectorAll(
                "h1, h2, h3, strong"
            )
            .forEach(
                function (element) {

                    important(
                        element,
                        "color",
                        c.heading
                    );
                }
            );


            hero.querySelectorAll(
                "p"
            )
            .forEach(
                function (element) {

                    important(
                        element,
                        "color",
                        c.muted
                    );
                }
            );


            const name =
                hero.querySelector(
                    ".rr-clean-main-name"
                );

            if (name) {

                important(
                    name,
                    "color",
                    c.heading
                );


                name.querySelectorAll(
                    "span"
                )
                .forEach(
                    function (element) {

                        important(
                            element,
                            "color",
                            c.accent
                        );
                    }
                );
            }
        }


        /* CARDS */

        document.querySelectorAll(
            ".rr-clean-card"
        )
        .forEach(
            function (card) {

                important(
                    card,
                    "background",
                    c.surface
                );

                important(
                    card,
                    "color",
                    c.text
                );

                important(
                    card,
                    "border-color",
                    c.border
                );


                card.querySelectorAll(
                    "h1, h2, h3, h4, strong"
                )
                .forEach(
                    function (element) {

                        important(
                            element,
                            "color",
                            c.heading
                        );
                    }
                );


                card.querySelectorAll(
                    "p, small"
                )
                .forEach(
                    function (element) {

                        important(
                            element,
                            "color",
                            c.muted
                        );
                    }
                );
            }
        );


        /* SOCIAL CARDS */

        document.querySelectorAll(
            ".rr-social-trust-links > a"
        )
        .forEach(
            function (card) {

                important(
                    card,
                    "background",
                    c.surface
                );

                important(
                    card,
                    "border-color",
                    c.border
                );


                card.querySelectorAll(
                    "strong"
                )
                .forEach(
                    function (element) {

                        important(
                            element,
                            "color",
                            c.heading
                        );
                    }
                );


                card.querySelectorAll(
                    "small"
                )
                .forEach(
                    function (element) {

                        important(
                            element,
                            "color",
                            c.muted
                        );
                    }
                );
            }
        );


        buttonUpdate();
    }


    function decorate() {

        decorateHeader();
        decorateHero();
        decorateFeatureSection();
        decorateChannels();
        decorateStories();
        decorateVlogs();
        decorateShorts();
        decorateSocial();
    }


    /* ======================================================
       BUTTON
    ====================================================== */

    function createButton() {

        /* Remove previous theme buttons */

        document.querySelectorAll(
            "#rrThemeToggle"
        )
        .forEach(
            function (element) {

                element.remove();
            }
        );


        let button =
            document.getElementById(
                "rrCleanThemeToggle"
            );


        if (button) {
            return;
        }


        button =
            document.createElement(
                "button"
            );


        button.id =
            "rrCleanThemeToggle";


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
            elementByText(
                "a, button",
                "subscribe"
            );


        if (
            subscribe
            &&
            subscribe.parentElement
        ) {

            subscribe.classList.add(
                "rr-clean-subscribe"
            );


            subscribe.parentElement
                .insertBefore(
                    button,
                    subscribe
                );

        } else {

            button.style.position =
                "fixed";

            button.style.top =
                "90px";

            button.style.right =
                "20px";

            document.body.appendChild(
                button
            );
        }


        buttonUpdate();
    }


    /* ======================================================
       BOOT
    ====================================================== */

    function boot() {

        const stored =
            savedTheme();


        document.documentElement
            .classList
            .toggle(
                "rr-clean-dark",
                stored === "dark"
            );


        createButton();

        decorate();

        paint();


        setTimeout(
            function () {

                decorate();
                paint();

            },
            500
        );


        setTimeout(
            function () {

                decorate();
                paint();

            },
            1500
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();
    }

})();
