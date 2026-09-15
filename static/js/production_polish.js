
document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       EXTERNAL LINK SECURITY
    ====================================================== */

    document.querySelectorAll('a[href^="http"]').forEach(
        function (link) {

            try {

                const url =
                    new URL(link.href, window.location.href);

                if (url.origin !== window.location.origin) {

                    link.setAttribute(
                        "target",
                        "_blank"
                    );


                    const relValues =
                        new Set(
                            (
                                link.getAttribute("rel") || ""
                            )
                            .split(/\s+/)
                            .filter(Boolean)
                        );


                    relValues.add("noopener");
                    relValues.add("noreferrer");


                    link.setAttribute(
                        "rel",
                        Array.from(relValues).join(" ")
                    );

                }

            }
            catch (error) {
                /* Ignore malformed links safely */
            }

        }
    );


    /* ======================================================
       IMAGE PERFORMANCE
    ====================================================== */

    const images =
        document.querySelectorAll("img");


    images.forEach(
        function (image, index) {

            if (!image.hasAttribute("decoding")) {

                image.setAttribute(
                    "decoding",
                    "async"
                );

            }


            /*
             * Keep first important images eager.
             * Other images lazy load.
             */

            if (
                index > 3 &&
                !image.hasAttribute("loading")
            ) {

                image.setAttribute(
                    "loading",
                    "lazy"
                );

            }


            image.addEventListener(
                "error",
                function () {

                    image.classList.add(
                        "rr-image-error"
                    );

                },
                {
                    once: true
                }
            );

        }
    );


    /* ======================================================
       IFRAME PERFORMANCE
    ====================================================== */

    document.querySelectorAll("iframe").forEach(
        function (frame) {

            if (!frame.hasAttribute("loading")) {

                frame.setAttribute(
                    "loading",
                    "lazy"
                );

            }


            if (!frame.hasAttribute("referrerpolicy")) {

                frame.setAttribute(
                    "referrerpolicy",
                    "strict-origin-when-cross-origin"
                );

            }

        }
    );


    /* ======================================================
       BUTTON ACCESSIBILITY
    ====================================================== */

    document.querySelectorAll("button").forEach(
        function (button) {

            if (!button.hasAttribute("type")) {

                button.setAttribute(
                    "type",
                    "button"
                );

            }

        }
    );


    /* ======================================================
       SAFE HASH LINKS
    ====================================================== */

    document.querySelectorAll('a[href="#"]').forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                }
            );

        }
    );

});
