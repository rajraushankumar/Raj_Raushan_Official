(function () {
    "use strict";

    const mobileQuery =
        window.matchMedia("(max-width: 950px)");

    function disableIfInactive(selector, activeCheck) {

        document
            .querySelectorAll(selector)
            .forEach(function (element) {

                if (!activeCheck(element)) {
                    element.style.setProperty(
                        "pointer-events",
                        "none",
                        "important"
                    );
                }
                else {
                    element.style.removeProperty(
                        "pointer-events"
                    );
                }
            });
    }


    function unlockMobileClicks() {

        if (!mobileQuery.matches) {
            return;
        }


        /* Public mobile navigation */

        disableIfInactive(
            ".rr-mobile-menu-backdrop",
            function (el) {
                return el.classList.contains("active");
            }
        );

        disableIfInactive(
            ".rr-mobile-menu-panel",
            function (el) {
                return el.classList.contains("active");
            }
        );


        /* Clean homepage mobile navigation */

        disableIfInactive(
            "#rr-clean-menu-overlay",
            function (el) {
                return el.classList.contains("open");
            }
        );

        disableIfInactive(
            "#rr-clean-menu-panel",
            function (el) {
                return el.classList.contains("open");
            }
        );


        /* Legacy mobile navigation */

        disableIfInactive(
            ".rr-mobile-nav-overlay, #rr-mobile-nav-overlay",
            function (el) {
                return (
                    el.classList.contains("rr-mobile-visible")
                    ||
                    el.classList.contains("open")
                );
            }
        );

        disableIfInactive(
            ".rr-mobile-nav-panel, #rr-mobile-nav-panel",
            function (el) {
                return (
                    el.classList.contains("rr-mobile-visible")
                    ||
                    el.classList.contains("open")
                );
            }
        );


        /* Global search */

        disableIfInactive(
            ".rr-search-overlay",
            function (el) {
                return el.classList.contains("active");
            }
        );


        /* Loader safety */

        const loader =
            document.getElementById("rr-site-loader");

        if (loader) {

            const style =
                window.getComputedStyle(loader);

            if (
                loader.classList.contains("rr-loader-hide")
                ||
                style.visibility === "hidden"
                ||
                Number(style.opacity) === 0
            ) {
                loader.style.setProperty(
                    "pointer-events",
                    "none",
                    "important"
                );
            }
        }
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            unlockMobileClicks
        );
    }
    else {
        unlockMobileClicks();
    }


    window.addEventListener(
        "pageshow",
        unlockMobileClicks
    );

    window.addEventListener(
        "resize",
        unlockMobileClicks,
        { passive: true }
    );

    window.addEventListener(
        "orientationchange",
        unlockMobileClicks
    );


    /*
       Menus/search are dynamically created,
       so re-check when new elements appear.
    */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            if (!document.body) {
                return;
            }

            const observer =
                new MutationObserver(function () {
                    unlockMobileClicks();
                });

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );

            setTimeout(unlockMobileClicks, 100);
            setTimeout(unlockMobileClicks, 500);
            setTimeout(unlockMobileClicks, 1500);
        }
    );

})();
/* FINAL MOBILE LINK SAFETY */

(function () {
    "use strict";

    function protectMobileLinks() {

        if (window.innerWidth > 950) {
            return;
        }

        const hiddenSelectors = [
            "#rr-clean-menu-overlay:not(.open)",
            "#rr-clean-menu-panel:not(.open)",
            ".rr-mobile-menu-backdrop:not(.active)",
            ".rr-mobile-menu-panel:not(.active)",
            ".rr-mobile-nav-overlay:not(.rr-mobile-visible)",
            ".rr-mobile-nav-panel:not(.rr-mobile-visible)",
            "#rr-mobile-nav-overlay:not(.rr-mobile-visible)",
            "#rr-mobile-nav-panel:not(.rr-mobile-visible)",
            ".rr-search-overlay:not(.active)",
            "#rr-site-loader.rr-loader-hide"
        ];

        hiddenSelectors.forEach(function (selector) {

            document.querySelectorAll(selector).forEach(function (el) {

                el.style.setProperty(
                    "pointer-events",
                    "none",
                    "important"
                );

            });

        });

        /* If loader is invisible, it can never block a tap */

        const loader =
            document.getElementById("rr-site-loader");

        if (loader) {

            const style =
                window.getComputedStyle(loader);

            if (
                loader.classList.contains("rr-loader-hide") ||
                style.visibility === "hidden" ||
                Number(style.opacity) === 0
            ) {
                loader.style.setProperty(
                    "pointer-events",
                    "none",
                    "important"
                );
            }
        }
    }

    function startProtection() {

        protectMobileLinks();

        setTimeout(protectMobileLinks, 100);
        setTimeout(protectMobileLinks, 500);
        setTimeout(protectMobileLinks, 1500);
        setTimeout(protectMobileLinks, 3000);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startProtection
        );
    } else {
        startProtection();
    }

    window.addEventListener(
        "pageshow",
        startProtection
    );

    window.addEventListener(
        "resize",
        protectMobileLinks,
        { passive: true }
    );

    window.addEventListener(
        "orientationchange",
        protectMobileLinks
    );

})();
