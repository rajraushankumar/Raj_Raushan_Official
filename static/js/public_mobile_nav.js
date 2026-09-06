
document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.querySelector(
                ".rr-mobile-menu-btn"
            )
        ) {
            return;
        }


        const navRoot =
            document.querySelector(
                ".travel-nav"
            )
            ||
            document.querySelector(
                ".playlist-nav-inner"
            )
            ||
            document.querySelector(
                ".playlist-nav"
            )
            ||
            document.querySelector(
                ".gallery-nav"
            )
            ||
            document.querySelector(
                "header"
            );


        if (navRoot) {
            navRoot.classList.add(
                "rr-nav-mobile-ready"
            );
        }


        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "rr-mobile-menu-btn";

        button.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.innerHTML =
            "<span></span><span></span><span></span>";


        const backdrop =
            document.createElement(
                "div"
            );

        backdrop.className =
            "rr-mobile-menu-backdrop";


        const panel =
            document.createElement(
                "aside"
            );

        panel.className =
            "rr-mobile-menu-panel";


        panel.innerHTML = `
            <a
                href="/"
                class="rr-mobile-brand"
            >
                <span class="rr-mobile-logo">
                    RR
                </span>

                <span>
                    <strong>
                        Raj Raushan
                    </strong>

                    <small>
                        OFFICIAL
                    </small>
                </span>
            </a>

            <nav class="rr-mobile-links">

                <a href="/" data-path="/">
                    Home
                </a>

                <a
                    href="/destinations"
                    data-path="/destinations"
                >
                    Destinations
                </a>

                <a
                    href="/playlists"
                    data-path="/playlists"
                >
                    Playlists
                </a>

                <a
                    href="/travel-map"
                    data-path="/travel-map"
                >
                    Travel Map
                </a>

                <a
                    href="/gallery"
                    data-path="/gallery"
                >
                    Gallery
                </a>

                <a
                    href="/about"
                    data-path="/about"
                >
                    About
                </a>

                <a
                    href="/collaborate"
                    data-path="/collaborate"
                >
                    Collaborate
                </a>

            </nav>

            <a
                href="https://www.youtube.com/@RajRaushanOfficial?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-mobile-subscribe"
            >
                Subscribe on YouTube
            </a>
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


        function openMenu() {

            button.classList.add(
                "active"
            );

            panel.classList.add(
                "active"
            );

            backdrop.classList.add(
                "active"
            );

            document.body.classList.add(
                "rr-menu-open"
            );

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeMenu() {

            button.classList.remove(
                "active"
            );

            panel.classList.remove(
                "active"
            );

            backdrop.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "rr-menu-open"
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
                } else {
                    openMenu();
                }

            }
        );


        backdrop.addEventListener(
            "click",
            closeMenu
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {
                    closeMenu();
                }

            }
        );


        panel
            .querySelectorAll("a")
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        closeMenu
                    );

                }
            );


        /* Active page */

        const currentPath =
            window.location.pathname;


        panel
            .querySelectorAll(
                "[data-path]"
            )
            .forEach(
                function (link) {

                    const path =
                        link.dataset.path;


                    let active =
                        currentPath === path;


                    if (
                        path === "/destinations"
                        &&
                        currentPath.startsWith(
                            "/destination/"
                        )
                    ) {
                        active = true;
                    }


                    if (active) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );

    }
);
