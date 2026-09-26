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
/* ==========================================================
   RR FINAL INVISIBLE OVERLAY DETECTOR V2
========================================================== */

(function () {

    "use strict";

    function rrDisableHiddenBlockers() {

        if (window.innerWidth > 950) {
            return;
        }

        const viewportWidth =
            window.innerWidth;

        const viewportHeight =
            window.innerHeight;


        /*
           Known overlay systems.
        */

        const knownSelectors = [
            ".rr-search-overlay",
            ".rr-mobile-menu-backdrop",
            ".rr-mobile-menu-panel",
            "#rr-clean-menu-overlay",
            "#rr-clean-menu-panel",
            "#rr-mobile-nav-overlay",
            "#rr-mobile-nav-panel",
            "#rr-site-loader"
        ];


        document
            .querySelectorAll(
                knownSelectors.join(",")
            )
            .forEach(function (element) {

                const style =
                    window.getComputedStyle(element);

                const hidden =
                    style.display === "none"
                    ||
                    style.visibility === "hidden"
                    ||
                    Number(style.opacity) <= 0.01;

                const inactive =
                    !element.classList.contains("active")
                    &&
                    !element.classList.contains("open")
                    &&
                    !element.classList.contains("rr-mobile-visible")
                    &&
                    !element.classList.contains("rr-loader-show");


                if (hidden || inactive) {

                    element.style.setProperty(
                        "pointer-events",
                        "none",
                        "important"
                    );
                }

            });


        /*
           Detect accidental invisible full-screen
           fixed/absolute elements.
        */

        document
            .querySelectorAll("body *")
            .forEach(function (element) {

                if (
                    element === document.body
                    ||
                    element === document.documentElement
                ) {
                    return;
                }


                const style =
                    window.getComputedStyle(element);

                if (
                    style.position !== "fixed"
                    &&
                    style.position !== "absolute"
                ) {
                    return;
                }


                if (
                    style.pointerEvents === "none"
                ) {
                    return;
                }


                const rect =
                    element.getBoundingClientRect();


                const coversWidth =
                    rect.width >= viewportWidth * 0.85;

                const coversHeight =
                    rect.height >= viewportHeight * 0.85;


                if (
                    !coversWidth
                    ||
                    !coversHeight
                ) {
                    return;
                }


                const hidden =
                    style.visibility === "hidden"
                    ||
                    style.display === "none"
                    ||
                    Number(style.opacity) <= 0.01;


                /*
                   Only disable clearly invisible
                   full-screen blockers.
                */

                if (hidden) {

                    element.style.setProperty(
                        "pointer-events",
                        "none",
                        "important"
                    );

                }

            });

    }


    /*
       Run at several stages because some project
       scripts create overlays dynamically.
    */

    function rrStartTouchProtection() {

        rrDisableHiddenBlockers();

        window.setTimeout(
            rrDisableHiddenBlockers,
            100
        );

        window.setTimeout(
            rrDisableHiddenBlockers,
            500
        );

        window.setTimeout(
            rrDisableHiddenBlockers,
            1200
        );

        window.setTimeout(
            rrDisableHiddenBlockers,
            2500
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            rrStartTouchProtection
        );

    }
    else {

        rrStartTouchProtection();

    }


    window.addEventListener(
        "pageshow",
        rrDisableHiddenBlockers
    );


    window.addEventListener(
        "resize",
        rrDisableHiddenBlockers,
        { passive: true }
    );


    window.addEventListener(
        "orientationchange",
        rrDisableHiddenBlockers
    );


    /*
       Watch dynamically created menus/overlays.
    */

    if (document.body) {

        const observer =
            new MutationObserver(
                function () {
                    rrDisableHiddenBlockers();
                }
            );


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "class",
                    "style"
                ]
            }
        );

    }

})();

/* ==========================================================
   END RR FINAL INVISIBLE OVERLAY DETECTOR V2
========================================================== */

/* =========================================================
   RR FINAL MOBILE TOUCH FIX V3
   Computed full-screen blocker protection
========================================================= */

(function () {
    "use strict";

    function isMobile() {
        return window.matchMedia("(max-width: 950px)").matches;
    }

    function isKnownInteractiveOverlay(el) {

        if (!el || !el.matches) return false;

        return el.matches(
            [
                "#rr-clean-menu-btn",
                "#rr-clean-menu-panel.open",
                "#rr-clean-menu-overlay.open",
                ".rr-mobile-menu-btn",
                ".rr-mobile-menu-panel.active",
                ".rr-mobile-menu-backdrop.active",
                ".rr-mobile-nav-toggle",
                ".rr-mobile-nav-panel.rr-mobile-visible",
                ".rr-mobile-nav-overlay.rr-mobile-visible",
                ".rr-search-overlay.active"
            ].join(",")
        );
    }

    function isImportantElement(el) {

        if (!el || !el.matches) return false;

        return el.matches(
            [
                "a",
                "button",
                "input",
                "select",
                "textarea",
                "video",
                "iframe",
                "[role='button']",
                "[role='link']"
            ].join(",")
        );
    }

    function cleanFullScreenBlockers() {

        if (!isMobile()) return;

        var vw = window.innerWidth;
        var vh = window.innerHeight;

        document.querySelectorAll("body *").forEach(function (el) {

            if (!el || !el.getBoundingClientRect) return;

            if (isKnownInteractiveOverlay(el)) return;

            var style = window.getComputedStyle(el);
            var rect = el.getBoundingClientRect();

            if (
                style.position !== "fixed" &&
                style.position !== "absolute"
            ) {
                return;
            }

            if (
                rect.width < vw * 0.80 ||
                rect.height < vh * 0.80
            ) {
                return;
            }

            /*
             * Never touch the actual page itself.
             */
            if (
                el === document.body ||
                el === document.documentElement ||
                el === document.querySelector("main")
            ) {
                return;
            }

            /*
             * Keep real visible full-screen interactive panels.
             */
            if (
                style.visibility === "visible" &&
                style.display !== "none" &&
                parseFloat(style.opacity || "1") > 0 &&
                (
                    el.id === "rr-clean-menu-panel" ||
                    el.classList.contains("rr-mobile-menu-panel") ||
                    el.classList.contains("rr-mobile-nav-panel") ||
                    el.classList.contains("rr-search-overlay")
                )
            ) {
                return;
            }

            /*
             * This is the important part:
             * A full-screen fixed/absolute layer that is not
             * a real active interactive panel must not steal taps.
             */
            el.style.setProperty(
                "pointer-events",
                "none",
                "important"
            );
        });
    }

    function forceLinksAboveDecorations() {

        if (!isMobile()) return;

        document.querySelectorAll(
            "main a[href], section a[href], footer a[href], .rr-journey-social-card"
        ).forEach(function (link) {

            link.style.setProperty(
                "pointer-events",
                "auto",
                "important"
            );

            link.style.setProperty(
                "touch-action",
                "manipulation",
                "important"
            );
        });
    }

    function run() {
        cleanFullScreenBlockers();
        forceLinksAboveDecorations();
    }

    document.addEventListener("DOMContentLoaded", run);
    window.addEventListener("load", run);
    window.addEventListener("pageshow", run);
    window.addEventListener("resize", run);
    window.addEventListener("orientationchange", run);

    setTimeout(run, 300);
    setTimeout(run, 1000);
    setTimeout(run, 2000);
    setTimeout(run, 4000);

})();

