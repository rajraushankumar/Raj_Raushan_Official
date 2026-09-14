
document.addEventListener("DOMContentLoaded", function () {

    const progress =
        document.getElementById("rr-scroll-progress");


    /* ======================================================
       SCROLL PROGRESS
    ====================================================== */

    function updateProgress() {

        if (!progress) return;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        let percentage = 0;

        if (documentHeight > 0) {

            percentage =
                (window.scrollY / documentHeight) * 100;

        }

        percentage =
            Math.max(
                0,
                Math.min(100, percentage)
            );

        progress.style.width =
            percentage + "%";

    }


    /* ======================================================
       FIND MAIN NAVBAR
    ====================================================== */

    const navbar =
        document.querySelector(
            "nav, .navbar, .nav-container, header"
        );


    function updateNavbar() {

        if (!navbar) return;

        if (window.scrollY > 30) {

            navbar.classList.add(
                "rr-nav-scrolled"
            );

        }
        else {

            navbar.classList.remove(
                "rr-nav-scrolled"
            );

        }

    }


    /* ======================================================
       SMOOTH INTERNAL LINKS
    ====================================================== */

    const navLinks =
        document.querySelectorAll(
            'a[href^="#"]:not([href="#"])'
        );


    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const selector =
                    link.getAttribute("href");

                if (!selector) return;

                let target = null;

                try {

                    target =
                        document.querySelector(selector);

                }
                catch (error) {

                    return;

                }

                if (!target) return;


                event.preventDefault();


                const reducedMotion =
                    window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches;


                target.scrollIntoView({

                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth",

                    block:
                        "start"

                });


                history.replaceState(
                    null,
                    "",
                    selector
                );

            }
        );

    });


    /* ======================================================
       ACTIVE NAV SECTION
    ====================================================== */

    const trackedLinks = [];

    navLinks.forEach(function (link) {

        const selector =
            link.getAttribute("href");

        if (!selector) return;

        let section = null;

        try {

            section =
                document.querySelector(selector);

        }
        catch (error) {

            return;

        }

        if (!section) return;


        trackedLinks.push({

            link: link,
            section: section

        });

    });


    if (
        trackedLinks.length > 0 &&
        "IntersectionObserver" in window
    ) {

        const sectionObserver =
            new IntersectionObserver(

                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }


                            trackedLinks.forEach(
                                function (item) {

                                    item.link.classList.remove(
                                        "rr-nav-active"
                                    );

                                }
                            );


                            const match =
                                trackedLinks.find(
                                    function (item) {

                                        return (
                                            item.section ===
                                            entry.target
                                        );

                                    }
                                );


                            if (match) {

                                match.link.classList.add(
                                    "rr-nav-active"
                                );

                            }

                        }
                    );

                },

                {
                    rootMargin:
                        "-25% 0px -60% 0px",

                    threshold:
                        0
                }

            );


        trackedLinks.forEach(
            function (item) {

                sectionObserver.observe(
                    item.section
                );

            }
        );

    }


    /* ======================================================
       SCROLL EVENTS
    ====================================================== */

    let ticking = false;


    function requestUpdate() {

        if (ticking) return;

        ticking = true;


        window.requestAnimationFrame(
            function () {

                updateProgress();
                updateNavbar();

                ticking = false;

            }
        );

    }


    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestUpdate
    );


    updateProgress();
    updateNavbar();

});
