
document.addEventListener("DOMContentLoaded", function () {

    const toggle =
        document.getElementById("rr-mobile-nav-toggle");

    const panel =
        document.getElementById("rr-mobile-nav-panel");

    const overlay =
        document.getElementById("rr-mobile-nav-overlay");


    if (!toggle || !panel || !overlay) {
        return;
    }


    function openMenu() {

        toggle.classList.add(
            "rr-mobile-open"
        );

        panel.classList.add(
            "rr-mobile-visible"
        );

        overlay.classList.add(
            "rr-mobile-visible"
        );

        document.body.classList.add(
            "rr-mobile-menu-lock"
        );

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    function closeMenu() {

        toggle.classList.remove(
            "rr-mobile-open"
        );

        panel.classList.remove(
            "rr-mobile-visible"
        );

        overlay.classList.remove(
            "rr-mobile-visible"
        );

        document.body.classList.remove(
            "rr-mobile-menu-lock"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    toggle.addEventListener(
        "click",
        function () {

            if (
                panel.classList.contains(
                    "rr-mobile-visible"
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


    panel.querySelectorAll("a").forEach(
        function (link) {

            link.addEventListener(
                "click",
                closeMenu
            );

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 780) {
                closeMenu();
            }

        }
    );

});
