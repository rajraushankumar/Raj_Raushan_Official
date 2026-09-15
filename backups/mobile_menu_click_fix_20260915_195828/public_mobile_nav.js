
document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        /* ============================================
           HIDE OLD DESKTOP NAVIGATION ON MOBILE

           We mark only NAV/MENU groups.
           Hero buttons/chips are not touched.
        ============================================ */

        const routeKeys = new Set([
            "/",
            "/vlogs",
            "/shorts",
            "/explore",
            "/destinations",
            "/playlists",
            "/travel-map",
            "/gallery",
            "/about",
            "/collaborate",
            "#media-kit",
            "#rr-collaboration"
        ]);


        function getKey(anchor) {

            const href =
                anchor.getAttribute("href") || "";

            if (href.startsWith("#")) {
                return href.toLowerCase();
            }

            try {

                const url =
                    new URL(
                        href,
                        window.location.origin
                    );

                return (
                    url.pathname
                    .replace(/\/+$/, "")
                    || "/"
                );

            }
            catch (error) {

                return "";

            }

        }


        document
            .querySelectorAll("a[href]")
            .forEach(function (anchor) {

                const key =
                    getKey(anchor);

                if (!routeKeys.has(key)) {
                    return;
                }


                if (
                    anchor.closest(
                        "footer, " +
                        ".rr-canonical-mobile-panel"
                    )
                ) {
                    return;
                }


                const group =
                    anchor.closest(
                        "nav, ul, " +
                        ".nav-links, " +
                        ".navbar-links, " +
                        ".nav-menu, " +
                        ".menu-links, " +
                        "[class*='nav-links'], " +
                        "[class*='nav-menu']"
                    );


                if (!group) {
                    return;
                }


                /* Do not hide entire top header if Search lives there */

                const controls =
                    Array.from(
                        group.querySelectorAll(
                            "a, button"
                        )
                    );


                const hasSearch =
                    controls.some(function (el) {

                        return (
                            (el.textContent || "")
                            .trim()
                            .toLowerCase()
                            .includes("search")
                        );

                    });


                if (hasSearch) {

                    anchor.classList.add(
                        "rr-mobile-legacy-nav-item"
                    );

                }
                else {

                    group.classList.add(
                        "rr-mobile-legacy-nav"
                    );

                }

            });


        /* ============================================
           FIND SEARCH
        ============================================ */

        let searchControl = null;

        document
            .querySelectorAll(
                "header a, header button, " +
                ".navbar a, .navbar button, " +
                ".travel-nav a, .travel-nav button"
            )
            .forEach(function (element) {

                if (searchControl) {
                    return;
                }


                const text =
                    (element.textContent || "")
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLowerCase();


                if (text.includes("search")) {

                    searchControl =
                        element;

                }

            });


        if (searchControl) {

            searchControl.classList.add(
                "rr-mobile-search-space"
            );

        }


        /* ============================================
           CREATE SINGLE BUTTON
        ============================================ */

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "rr-canonical-mobile-btn";

        button.setAttribute(
            "aria-label",
            "Open website navigation"
        );

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.textContent =
            "⋮";


        /* ============================================
           BACKDROP
        ============================================ */

        const backdrop =
            document.createElement(
                "div"
            );

        backdrop.className =
            "rr-canonical-mobile-backdrop";


        /* ============================================
           SIDE PANEL
        ============================================ */

        const panel =
            document.createElement(
                "aside"
            );

        panel.className =
            "rr-canonical-mobile-panel";

        panel.setAttribute(
            "aria-label",
            "Website navigation"
        );


        panel.innerHTML = `

            <div class="rr-canonical-menu-title">

                <strong>
                    Raj Raushan Official
                </strong>

                <span>
                    TRAVEL • CULTURE • STORIES
                </span>

            </div>


            <nav class="rr-canonical-mobile-links">

                <a href="/">
                    Home
                </a>

                <a href="/vlogs">
                    Vlogs
                </a>

                <a href="/shorts">
                    Shorts
                </a>

                <a href="/explore">
                    Explore
                </a>

                <a href="/destinations">
                    Destinations
                </a>

                <a href="/playlists">
                    Playlists
                </a>

                <a href="/travel-map">
                    Travel Map
                </a>

                <a href="/gallery">
                    Gallery
                </a>

                <a href="/about">
                    About
                </a>

                <a href="#media-kit">
                    Media Kit
                </a>

                <a href="/collaborate">
                    Collaborate
                </a>

            </nav>
        `;


        document.body.appendChild(
            backdrop
        );

        document.body.appendChild(
            panel
        );

        document.body.appendChild(
            button
        );


        /* ============================================
           OPEN / CLOSE
        ============================================ */

        function openMenu() {

            panel.classList.add(
                "active"
            );

            backdrop.classList.add(
                "active"
            );

            document.body.classList.add(
                "rr-canonical-menu-open"
            );

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeMenu() {

            panel.classList.remove(
                "active"
            );

            backdrop.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "rr-canonical-menu-open"
            );

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        button.addEventListener(
            "click",
            function () {

                if (
                    panel.classList.contains(
                        "active"
                    )
                ) {

                    closeMenu();

                }
                else {

                    openMenu();

                }

            }
        );


        backdrop.addEventListener(
            "click",
            closeMenu
        );


        panel
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    closeMenu
                );

            });


        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    closeMenu();

                }

            }
        );

    }
);
