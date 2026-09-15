
document.addEventListener("DOMContentLoaded", function () {

    const youtubeCards =
        document.querySelectorAll(
            ".channels-container > .channel-card:not(.rr-instagram-card)"
        );


    youtubeCards.forEach(function (card) {

        /* -----------------------------------------------
           REAL YOUTUBE BADGE
        ------------------------------------------------ */

        if (!card.querySelector(".rr-youtube-label")) {

            const badge =
                document.createElement("span");

            badge.className =
                "rr-platform-label rr-youtube-label";

            badge.textContent =
                "YOUTUBE";


            const image =
                card.querySelector("img");


            if (image) {

                image.insertAdjacentElement(
                    "afterend",
                    badge
                );

            }
            else {

                card.prepend(badge);

            }

        }


        /* -----------------------------------------------
           BROKEN YOUTUBE PROFILE IMAGE FALLBACK
        ------------------------------------------------ */

        const image =
            card.querySelector("img");


        if (!image) {
            return;
        }


        function useFallback() {

            if (
                image.dataset.rrFallbackApplied === "1"
            ) {
                return;
            }


            image.dataset.rrFallbackApplied =
                "1";


            image.classList.add(
                "rr-channel-fallback"
            );


            image.src =
                "/static/images/rajraushan_dp.jpg";

        }


        image.addEventListener(
            "error",
            useFallback,
            {
                once: true
            }
        );


        /*
           Handle images that already failed
           before this script executed.
        */

        if (
            image.complete &&
            image.naturalWidth === 0
        ) {

            useFallback();

        }

    });


    /* -----------------------------------------------
       Normalize Instagram label
    ------------------------------------------------ */

    document
        .querySelectorAll(".rr-instagram-label")
        .forEach(function (label) {

            label.textContent =
                "INSTAGRAM";

        });

});
