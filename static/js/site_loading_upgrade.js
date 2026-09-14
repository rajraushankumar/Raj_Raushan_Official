
(function () {

    const html =
        document.documentElement;

    html.classList.add("rr-page-loading");


    function optimizeImages() {

        const images =
            document.querySelectorAll("img");


        images.forEach(function (image, index) {

            /*
             * Keep explicitly eager images untouched.
             * Everything else below the initial area can lazy load.
             */

            if (!image.hasAttribute("decoding")) {
                image.setAttribute("decoding", "async");
            }


            if (
                !image.hasAttribute("loading") &&
                index > 2
            ) {
                image.setAttribute("loading", "lazy");
            }

        });

    }


    function hideLoader() {

        const loader =
            document.getElementById("rr-site-loader");

        if (!loader) {

            html.classList.remove("rr-page-loading");
            return;

        }


        loader.classList.add("rr-loader-hide");

        html.classList.remove("rr-page-loading");


        window.setTimeout(function () {

            if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }

        }, 650);

    }


    document.addEventListener(
        "DOMContentLoaded",
        optimizeImages
    );


    /*
     * Hide when resources are loaded.
     * Short delay prevents abrupt flashing.
     */

    window.addEventListener(
        "load",
        function () {

            window.setTimeout(
                hideLoader,
                350
            );

        }
    );


    /*
     * Safety fallback:
     * Loader can never trap the user.
     */

    window.setTimeout(
        hideLoader,
        4500
    );

})();
