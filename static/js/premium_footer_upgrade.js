
document.addEventListener("DOMContentLoaded", function () {

    const topButton =
        document.getElementById("rr-footer-top-btn");


    if (topButton) {

        topButton.addEventListener(
            "click",
            function () {

                const reducedMotion =
                    window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches;


                window.scrollTo({

                    top: 0,

                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth"

                });

            }
        );

    }


    /* Automatic copyright year */

    const year =
        document.getElementById("rr-footer-year");


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

});
