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