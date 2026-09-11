"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.querySelector(
            ".channels-section .channels-container"
        );

    if (!container) {
        console.warn("channels-container not found");
        return;
    }


    const youtubeCards =
        Array.from(
            container.querySelectorAll(
                ".channel-card:not(.rr-instagram-card)"
            )
        ).slice(0, 2);


    const instagramCards =
        Array.from(
            container.querySelectorAll(
                ".rr-instagram-card"
            )
        ).slice(0, 2);


    if (
        youtubeCards.length < 2 ||
        instagramCards.length < 2
    ) {
        console.warn(
            "YouTube or Instagram cards missing"
        );

        return;
    }


    /*
      FINAL ORDER

      Row 1:
      YouTube 1 | Instagram 1

      Row 2:
      YouTube 2 | Instagram 2
    */

    container.appendChild(
        youtubeCards[0]
    );

    container.appendChild(
        instagramCards[0]
    );

    container.appendChild(
        youtubeCards[1]
    );

    container.appendChild(
        instagramCards[1]
    );

});