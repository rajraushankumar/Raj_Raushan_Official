
document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const mobileWidth = 780;

    /*
       These exact labels are navigation only.

       Important:
       "Explore My Journeys"
       "Watch on YouTube"
       "Work With Me"
       Travel chips etc. are NOT exact matches,
       so they stay untouched.
    */

    const navNames = new Set([
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
        "collaborate",
        "collaborations"
    ]);


    function normalizeText(element) {

        return (element.textContent || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }


    function removeOldMobileButtons() {

        if (window.innerWidth > mobileWidth) {
            return;
        }

        document
            .querySelectorAll("button")
            .forEach(function (button) {

                if (button.id === "rr-clean-menu-btn") {
                    return;
                }

                const label =
                    (
                        button.getAttribute("aria-label")
                        || ""
                    ).toLowerCase();

                const spans =
                    button.querySelectorAll("span").length;

                const rect =
                    button.getBoundingClientRect();

                const looksLikeMenu =
                    label.includes("menu")
                    || label.includes("navigation")
                    || spans >= 3;

                const topRight =
                    rect.top < 100
                    && rect.right > window.innerWidth * 0.70;

                const floating =
                    rect.top > 100
                    && rect.width <= 90
                    && rect.height <= 90;


                if (
                    looksLikeMenu
                    && (topRight || floating)
                ) {

                    button.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );
                }
            });
    }


    function hideStrayNavigation() {

        if (window.innerWidth > mobileWidth) {
            return;
        }

        document
            .querySelectorAll("a")
            .forEach(function (anchor) {

                if (
                    anchor.closest(
                        "#rr-clean-menu-panel"
                    )
                ) {
                    return;
                }

                if (
                    anchor.closest("footer")
                ) {
                    return;
                }

                const text =
                    normalizeText(anchor);

                if (!navNames.has(text)) {
                    return;
                }

                anchor.classList.add(
                    "rr-hide-stray-mobile-nav"
                );

                const li =
                    anchor.closest("li");

                if (li) {

                    li.classList.add(
                        "rr-hide-stray-mobile-nav"
                    );
                }
            });
    }


    function cleanup() {

        hideStrayNavigation();
        removeOldMobileButtons();
    }


    /* ==============================
       CREATE ONE CLEAN MENU
    ============================== */

    const button =
        document.createElement("button");

    button.id =
        "rr-clean-menu-btn";

    button.className =
        "rr-clean-menu-btn";

    button.type =
        "button";

    button.setAttribute(
        "aria-label",
        "Open site options"
    );

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    button.textContent =
        "⋮";


    const overlay =
        document.createElement("div");

    overlay.id =
        "rr-clean-menu-overlay";

    overlay.className =
        "rr-clean-menu-overlay";


    const panel =
        document.createElement("aside");

    panel.id =
        "rr-clean-menu-panel";

    panel.className =
        "rr-clean-menu-panel";


    panel.innerHTML = `

        <div class="rr-clean-menu-title">

            <strong>
                Raj Raushan Official
            </strong>

            <span>
                TRAVEL • CULTURE • STORIES
            </span>

        </div>


        <nav class="rr-clean-menu-links">

            <a href="/">Home</a>

            <a href="/vlogs">Vlogs</a>

            <a href="/shorts">Shorts</a>

            <a href="/explore">Explore</a>

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
        overlay
    );

    document.body.appendChild(
        panel
    );

    document.body.appendChild(
        button
    );


    function openMenu() {

        panel.classList.add("open");
        overlay.classList.add("open");

        document.body.classList.add(
            "rr-clean-menu-open"
        );

        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    function closeMenu() {

        panel.classList.remove("open");
        overlay.classList.remove("open");

        document.body.classList.remove(
            "rr-clean-menu-open"
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
                    "open"
                )
            ) {
                closeMenu();
            }
            else {
                openMenu();
            }
        }
    );


    overlay.addEventListener(
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


    /*
       Old scripts may add navigation after load.
       Catch those too.
    */

    const observer =
        new MutationObserver(function () {

            cleanup();
        });


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    cleanup();

    window.addEventListener(
        "resize",
        cleanup,
        { passive: true }
    );

});

/* MENU SEARCH SPACING V2 */

document.addEventListener("DOMContentLoaded", function () {

    const controls = document.querySelectorAll(
        "header a, header button, .navbar a, .navbar button, .travel-nav a, .travel-nav button"
    );

    for (const control of controls) {

        const text = (control.textContent || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

        if (text.includes("search")) {

            control.style.setProperty(
                "margin-right",
                "50px",
                "important"
            );

            break;
        }
    }

});
