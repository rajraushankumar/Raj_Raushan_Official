
(function () {

    "use strict";

    const BREAKPOINT = 780;

    const legacyLabels = new Set([
        "home",
        "vlogs",
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


    function isModernMobileNav(element) {

        return Boolean(
            element.closest(
                ".rr-mobile-nav, " +
                ".rr-mobile-nav-toggle, " +
                ".rr-mobile-menu, " +
                ".rr-mobile-menu-panel, " +
                ".rr-mobile-overlay"
            )
        );

    }


    function getLegacyLinks() {

        const selector = [

            "header nav a",
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
            ".desktop-navigation a"

        ].join(",");


        return Array
            .from(document.querySelectorAll(selector))
            .filter(function (element) {

                if (isModernMobileNav(element)) {
                    return false;
                }

                return legacyLabels.has(
                    cleanText(element)
                );

            });

    }


    function markLegacyNavigation() {

        const links = getLegacyLinks();


        links.forEach(function (link) {

            link.classList.add(
                "rr-legacy-nav-link"
            );


            /*
              Hide nearest list wrapper too.
              This prevents empty spacing after the link disappears.
            */

            const wrapper =
                link.closest("li");


            if (
                wrapper &&
                !isModernMobileNav(wrapper)
            ) {

                wrapper.classList.add(
                    "rr-legacy-nav-wrapper"
                );

            }

        });

    }


    function clearHiddenState() {

        document
            .querySelectorAll(".rr-legacy-nav-hide")
            .forEach(function (element) {

                element.classList.remove(
                    "rr-legacy-nav-hide"
                );

            });

    }


    function applyResponsiveNavigation() {

        const mobile =
            window.innerWidth <= BREAKPOINT;


        document.documentElement.classList.toggle(
            "rr-phone-layout",
            mobile
        );


        markLegacyNavigation();

        clearHiddenState();


        if (!mobile) {
            return;
        }


        document
            .querySelectorAll(
                ".rr-legacy-nav-link, " +
                ".rr-legacy-nav-wrapper"
            )
            .forEach(function (element) {

                if (!isModernMobileNav(element)) {

                    element.classList.add(
                        "rr-legacy-nav-hide"
                    );

                }

            });

    }


    let resizeFrame = null;


    function scheduleUpdate() {

        if (resizeFrame) {
            cancelAnimationFrame(resizeFrame);
        }


        resizeFrame =
            requestAnimationFrame(
                applyResponsiveNavigation
            );

    }


    /* Initial page load */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            applyResponsiveNavigation,
            { once: true }
        );

    }
    else {

        applyResponsiveNavigation();

    }


    /* Desktop <-> mobile DevTools switching */

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


    /* Handles menu DOM/classes changing after load */

    const observer =
        new MutationObserver(function () {

            scheduleUpdate();

        });


    function startObserver() {

        if (!document.body) {
            return;
        }


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startObserver,
            { once: true }
        );

    }
    else {

        startObserver();

    }

})();
