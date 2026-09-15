
(function () {

    "use strict";

    const BREAKPOINT = 780;


    /*
       These are OLD navigation labels that must never
       appear over the mobile hero after desktop -> phone resize.
    */

    const legacyLabels = new Set([
        "home",
        "vlogs",
        "shorts",
        "explore",
        "destinations",
        "playlists",
        "travel map",
        "gallery",
        "about",
        "media kit",
        "collaborate"
    ]);


    function cleanText(element) {

        return (
            element.textContent || ""
        )
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    }


    function insideModernMobilePanel(element) {

        return Boolean(
            element.closest(
                ".rr-mobile-menu-panel, " +
                ".rr-mobile-overlay"
            )
        );

    }


    function findLegacyNavItems() {

        const selector = [
            "header nav a",
            "header nav button",
            "header .nav-links a",
            "header .navbar-links a",
            "header .nav-menu a",
            "header .menu-links a",

            ".navbar .nav-links a",
            ".navbar .navbar-links a",
            ".navbar .nav-menu a",

            ".site-header .nav-links a",
            ".site-header .navbar-links a",
            ".site-header .nav-menu a",

            ".desktop-nav a",
            ".desktop-menu a",
            ".desktop-navigation a",

            "nav a"
        ].join(",");


        return Array
            .from(document.querySelectorAll(selector))
            .filter(function (element) {

                if (insideModernMobilePanel(element)) {
                    return false;
                }

                return legacyLabels.has(
                    cleanText(element)
                );

            });

    }


    function clearLegacyClasses() {

        document
            .querySelectorAll(".rr-legacy-nav-hide")
            .forEach(function (element) {

                element.classList.remove(
                    "rr-legacy-nav-hide"
                );

            });

    }


    function hideLegacyNavigation() {

        if (window.innerWidth > BREAKPOINT) {
            return;
        }


        findLegacyNavItems()
            .forEach(function (element) {

                element.classList.add(
                    "rr-legacy-nav-hide"
                );


                const li =
                    element.closest("li");


                if (
                    li &&
                    !insideModernMobilePanel(li)
                ) {

                    li.classList.add(
                        "rr-legacy-nav-hide"
                    );

                }

            });

    }


    /*
       Hide only a floating hamburger that appears lower
       on the screen.

       The top-right navbar hamburger is kept.
    */

    function clearFloatingToggleClasses() {

        document
            .querySelectorAll(".rr-extra-floating-toggle")
            .forEach(function (element) {

                element.classList.remove(
                    "rr-extra-floating-toggle"
                );

            });

    }


    function hideExtraFloatingHamburger() {

        if (window.innerWidth > BREAKPOINT) {
            return;
        }


        const candidates =
            document.querySelectorAll(
                ".rr-mobile-nav-toggle, " +
                ".mobile-nav-toggle, " +
                ".floating-menu-toggle"
            );


        candidates.forEach(function (element) {

            const rect =
                element.getBoundingClientRect();


            const style =
                window.getComputedStyle(element);


            /*
               Bottom floating button:
               - fixed/sticky
               - positioned well below navbar
            */

            const isFloating =
                (
                    style.position === "fixed" ||
                    style.position === "sticky"
                ) &&
                rect.top > 110;


            if (isFloating) {

                element.classList.add(
                    "rr-extra-floating-toggle"
                );

            }

        });

    }


    function applyResponsiveFix() {

        clearLegacyClasses();
        clearFloatingToggleClasses();


        if (window.innerWidth > BREAKPOINT) {

            document.documentElement.classList.remove(
                "rr-phone-layout"
            );

            return;
        }


        document.documentElement.classList.add(
            "rr-phone-layout"
        );


        hideLegacyNavigation();
        hideExtraFloatingHamburger();

    }


    let frame = null;


    function scheduleUpdate() {

        if (frame) {
            cancelAnimationFrame(frame);
        }


        frame =
            requestAnimationFrame(
                applyResponsiveFix
            );

    }


    /*
       Initial load
    */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            applyResponsiveFix,
            { once: true }
        );

    }
    else {

        applyResponsiveFix();

    }


    /*
       DevTools desktop <-> mobile switching
    */

    window.addEventListener(
        "resize",
        scheduleUpdate,
        { passive: true }
    );


    window.addEventListener(
        "orientationchange",
        scheduleUpdate,
        { passive: true }
    );


    /*
       Run once more after complete page load
    */

    window.addEventListener(
        "load",
        function () {

            setTimeout(
                applyResponsiveFix,
                100
            );

        },
        { once: true }
    );

})();
