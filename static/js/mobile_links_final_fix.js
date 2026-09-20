(function () {
    "use strict";

    const MOBILE_MAX = 800;

    function isMobile() {
        return window.innerWidth <= MOBILE_MAX;
    }

    function cleanClosedState() {
        if (!isMobile()) {
            return;
        }

        /* Clean menu system */
        const cleanPanel =
            document.getElementById("rr-clean-menu-panel");

        const cleanOverlay =
            document.getElementById("rr-clean-menu-overlay");

        if (
            cleanPanel &&
            !cleanPanel.classList.contains("open")
        ) {
            cleanPanel.style.pointerEvents = "none";
        }

        if (
            cleanOverlay &&
            !cleanOverlay.classList.contains("open")
        ) {
            cleanOverlay.style.pointerEvents = "none";
        }


        /* Public mobile menu system */
        document
            .querySelectorAll(".rr-mobile-menu-panel")
            .forEach(function (panel) {

                if (!panel.classList.contains("active")) {
                    panel.style.pointerEvents = "none";
                }
                else {
                    panel.style.pointerEvents = "auto";
                }
            });

        document
            .querySelectorAll(".rr-mobile-menu-backdrop")
            .forEach(function (overlay) {

                if (!overlay.classList.contains("active")) {
                    overlay.style.pointerEvents = "none";
                }
                else {
                    overlay.style.pointerEvents = "auto";
                }
            });


        /* Old static mobile system */
        const oldPanel =
            document.getElementById("rr-mobile-nav-panel");

        const oldOverlay =
            document.getElementById("rr-mobile-nav-overlay");

        if (
            oldPanel &&
            !oldPanel.classList.contains("rr-mobile-visible")
        ) {
            oldPanel.style.pointerEvents = "none";
        }

        if (
            oldOverlay &&
            !oldOverlay.classList.contains("rr-mobile-visible")
        ) {
            oldOverlay.style.pointerEvents = "none";
        }
    }


    function closeEveryMobileMenu() {

        document.body.classList.remove(
            "rr-clean-menu-open",
            "rr-menu-open",
            "rr-mobile-menu-lock"
        );


        const cleanPanel =
            document.getElementById("rr-clean-menu-panel");

        const cleanOverlay =
            document.getElementById("rr-clean-menu-overlay");

        if (cleanPanel) {
            cleanPanel.classList.remove("open");
            cleanPanel.style.pointerEvents = "none";
        }

        if (cleanOverlay) {
            cleanOverlay.classList.remove("open");
            cleanOverlay.style.pointerEvents = "none";
        }


        document
            .querySelectorAll(".rr-mobile-menu-panel")
            .forEach(function (panel) {

                panel.classList.remove("active");
                panel.style.pointerEvents = "none";
            });


        document
            .querySelectorAll(".rr-mobile-menu-backdrop")
            .forEach(function (overlay) {

                overlay.classList.remove("active");
                overlay.style.pointerEvents = "none";
            });


        const oldPanel =
            document.getElementById("rr-mobile-nav-panel");

        const oldOverlay =
            document.getElementById("rr-mobile-nav-overlay");

        const oldToggle =
            document.getElementById("rr-mobile-nav-toggle");

        if (oldPanel) {
            oldPanel.classList.remove("rr-mobile-visible");
            oldPanel.style.pointerEvents = "none";
        }

        if (oldOverlay) {
            oldOverlay.classList.remove("rr-mobile-visible");
            oldOverlay.style.pointerEvents = "none";
        }

        if (oldToggle) {
            oldToggle.classList.remove("rr-mobile-open");

            oldToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    /*
       FINAL NAVIGATION HANDLER

       Capture phase is intentional:
       old scripts cannot cancel these mobile menu links.
    */

    document.addEventListener(
        "click",
        function (event) {

            if (!isMobile()) {
                return;
            }

            const link =
                event.target.closest(
                    [
                        "#rr-clean-menu-panel a",
                        ".rr-mobile-menu-panel a",
                        "#rr-mobile-nav-panel a"
                    ].join(",")
                );

            if (!link) {
                return;
            }

            const href =
                link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href.startsWith("javascript:")
            ) {
                return;
            }


            /*
               External links:
               allow normal browser behavior.
            */

            if (
                link.target === "_blank" ||
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) {

                closeEveryMobileMenu();

                return;
            }


            /*
               Same-page anchors.
            */

            if (href.startsWith("#")) {

                event.preventDefault();
                event.stopImmediatePropagation();

                closeEveryMobileMenu();

                const target =
                    document.querySelector(href);

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    history.replaceState(
                        null,
                        "",
                        href
                    );
                }

                return;
            }


            /*
               Internal pages.
            */

            if (href.startsWith("/")) {

                event.preventDefault();
                event.stopImmediatePropagation();

                closeEveryMobileMenu();

                window.location.assign(href);
            }

        },
        true
    );


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            closeEveryMobileMenu();
            cleanClosedState();

        }
    );


    window.addEventListener(
        "pageshow",
        function () {

            closeEveryMobileMenu();
            cleanClosedState();

        }
    );


    window.addEventListener(
        "resize",
        cleanClosedState,
        { passive: true }
    );

})();