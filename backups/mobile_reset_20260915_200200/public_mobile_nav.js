
document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        /* Remove old generated panel if any */

        document
            .querySelectorAll(
                ".rr-working-menu-panel, " +
                ".rr-working-menu-backdrop"
            )
            .forEach(function (el) {
                el.remove();
            });


        /* ==================================================
           FIND THE ALREADY VISIBLE TOP-RIGHT HAMBURGER
        ================================================== */

        const buttons =
            Array.from(
                document.querySelectorAll("button")
            );


        let menuButton =
            buttons
            .filter(function (button) {

                const rect =
                    button.getBoundingClientRect();

                const label =
                    (
                        button.getAttribute(
                            "aria-label"
                        ) || ""
                    ).toLowerCase();

                const spanCount =
                    button.querySelectorAll(
                        "span"
                    ).length;


                const topRight =
                    rect.width >= 30 &&
                    rect.height >= 30 &&
                    rect.top >= 0 &&
                    rect.top < 100 &&
                    rect.right >
                        window.innerWidth * .75;


                const looksLikeMenu =
                    label.includes("menu") ||
                    label.includes("navigation") ||
                    spanCount >= 3;


                return (
                    topRight &&
                    looksLikeMenu
                );

            })
            .sort(function (a, b) {

                return (
                    b.getBoundingClientRect().right -
                    a.getBoundingClientRect().right
                );

            })[0];


        if (!menuButton) {

            console.error(
                "Top mobile menu button not found."
            );

            return;
        }


        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        /* ==================================================
           CREATE BACKDROP
        ================================================== */

        const backdrop =
            document.createElement("div");

        backdrop.className =
            "rr-working-menu-backdrop";


        /* ==================================================
           CREATE PANEL
        ================================================== */

        const panel =
            document.createElement("aside");

        panel.className =
            "rr-working-menu-panel";

        panel.setAttribute(
            "aria-label",
            "Website navigation"
        );


        panel.innerHTML = `

            <div class="rr-working-menu-title">

                <strong>
                    Raj Raushan Official
                </strong>

                <span>
                    TRAVEL • CULTURE • STORIES
                </span>

            </div>


            <nav class="rr-working-menu-links">

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


        /* ==================================================
           OPEN / CLOSE
        ================================================== */

        function openMenu() {

            panel.classList.add(
                "open"
            );

            backdrop.classList.add(
                "open"
            );

            document.body.classList.add(
                "rr-working-menu-open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeMenu() {

            panel.classList.remove(
                "open"
            );

            backdrop.classList.remove(
                "open"
            );

            document.body.classList.remove(
                "rr-working-menu-open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        function toggleMenu(event) {

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();


            if (
                panel.classList.contains(
                    "open"
                )
            ) {

                closeMenu();

            }
            else {

                openMenu();

            }

        }


        /*
           CAPTURE=true so this handler wins
           even if an old dead listener exists.
        */

        menuButton.addEventListener(
            "click",
            toggleMenu,
            true
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
