document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* ==================================================
           REVEAL EFFECT
        ================================================== */

        const revealItems =
            document.querySelectorAll(
                "[data-creator-reveal]"
            );


        if (
            "IntersectionObserver"
            in window
        ) {

            const observer =
                new IntersectionObserver(
                    function (
                        entries
                    ) {

                        entries.forEach(
                            function (
                                entry
                            ) {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target
                                        .classList
                                        .add(
                                            "rr-revealed"
                                        );

                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },
                    {
                        threshold:
                            0.12
                    }
                );


            revealItems.forEach(
                function (
                    element
                ) {

                    observer.observe(
                        element
                    );

                }
            );

        } else {

            revealItems.forEach(
                function (
                    element
                ) {

                    element.classList.add(
                        "rr-revealed"
                    );

                }
            );

        }


        /* ==================================================
           NUMBER FORMAT
        ================================================== */

        function formatNumber(
            number
        ) {

            const value =
                Number(
                    number || 0
                );


            if (
                value >= 1000000
            ) {

                return (
                    (
                        value
                        /
                        1000000
                    )
                    .toFixed(1)
                    .replace(
                        ".0",
                        ""
                    )
                    +
                    "M"
                );

            }


            if (
                value >= 1000
            ) {

                return (
                    (
                        value
                        /
                        1000
                    )
                    .toFixed(1)
                    .replace(
                        ".0",
                        ""
                    )
                    +
                    "K"
                );

            }


            return (
                value
                .toLocaleString(
                    "en-IN"
                )
            );

        }


        function findValue(
            object,
            keys
        ) {

            for (
                const key
                of keys
            ) {

                if (
                    object
                    &&
                    object[key]
                    !== undefined
                    &&
                    object[key]
                    !== null
                ) {

                    return object[key];

                }

            }

            return null;

        }


        /* ==================================================
           REAL CREATOR STATS
        ================================================== */

        async function loadCreatorStats() {

            try {

                const response =
                    await fetch(
                        "/api/travel-stats",
                        {
                            cache:
                                "no-store"
                        }
                    );


                if (
                    !response.ok
                ) {

                    return;

                }


                const data =
                    await response.json();


                const stats =
                    data.stats
                    ||
                    data.channel
                    ||
                    data;


                const videos =
                    findValue(
                        stats,
                        [
                            "total_videos",
                            "video_count",
                            "videos"
                        ]
                    );


                const views =
                    findValue(
                        stats,
                        [
                            "total_views",
                            "view_count",
                            "views"
                        ]
                    );


                const destinations =
                    findValue(
                        stats,
                        [
                            "destinations",
                            "destination_count",
                            "total_destinations"
                        ]
                    );


                const videoCard =
                    document.querySelector(
                        '[data-stat="videos"] strong'
                    );


                const viewsCard =
                    document.querySelector(
                        '[data-stat="views"] strong'
                    );


                const destinationCard =
                    document.querySelector(
                        '[data-stat="destinations"] strong'
                    );


                if (
                    videoCard
                    &&
                    Number.isFinite(
                        Number(
                            videos
                        )
                    )
                ) {

                    videoCard.textContent =
                        formatNumber(
                            videos
                        );

                }


                if (
                    viewsCard
                    &&
                    Number.isFinite(
                        Number(
                            views
                        )
                    )
                ) {

                    viewsCard.textContent =
                        formatNumber(
                            views
                        );

                }


                if (
                    destinationCard
                    &&
                    Number.isFinite(
                        Number(
                            destinations
                        )
                    )
                ) {

                    destinationCard.textContent =
                        formatNumber(
                            destinations
                        );

                }


            } catch (
                error
            ) {

                console.log(
                    "Creator stats unavailable."
                );

            }

        }


        loadCreatorStats();

    }
);

/* CREATOR_VISUAL_FORCE_V6 */

(function () {

    function applyCreatorVisualV6() {

        /* ==============================================
           HERO NAME
        ============================================== */

        const heroName =
            document.querySelector(
                ".rr-creator-name"
            );


        if (heroName) {

            heroName.innerHTML = `
                Raj Raushan
                <span>
                    Official
                </span>
            `;

        }


        /* ==============================================
           PROFILE ALT
        ============================================== */

        const profile =
            document.querySelector(
                ".rr-profile-image"
            );


        if (profile) {

            profile.alt =
                "Raj Raushan Official - Travel Content Creator";

        }


        /* ==============================================
           LOCATION SEPARATOR
        ============================================== */

        const locationSeparator =
            document.querySelector(
                ".rr-creator-location span"
            );


        if (locationSeparator) {

            locationSeparator.innerHTML =
                "&bull;";

        }


        /* ==============================================
           SOCIAL MEDIA SECTION
        ============================================== */

        const social =
            document.querySelector(
                ".rr-social-trust-links"
            );


        if (!social) {
            return;
        }


        social.innerHTML = `

            <!-- YOUTUBE -->

            <a
                href="https://www.youtube.com/@RajRaushanOfficial"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-v6-social-card rr-v6-youtube"
                aria-label="YouTube"
            >

                <span class="rr-v6-logo">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <rect
                            x="2"
                            y="5"
                            width="20"
                            height="14"
                            rx="4"
                            fill="currentColor"
                        ></rect>

                        <path
                            d="M10 9L16 12L10 15Z"
                            fill="#ffffff"
                        ></path>
                    </svg>

                </span>


                <span class="rr-v6-social-copy">

                    <strong>
                        YouTube
                    </strong>

                    <small>
                        Travel Videos &amp; Vlogs
                    </small>

                </span>


                <span class="rr-v6-open">
                    &#8599;
                </span>

            </a>


            <!-- INSTAGRAM -->

            <a
                href="https://www.instagram.com/rajraushanofficial/"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-v6-social-card rr-v6-instagram"
                aria-label="Instagram"
            >

                <span class="rr-v6-logo">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        ></rect>

                        <circle
                            cx="12"
                            cy="12"
                            r="4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        ></circle>

                        <circle
                            cx="17.5"
                            cy="6.8"
                            r="1.2"
                            fill="currentColor"
                        ></circle>
                    </svg>

                </span>


                <span class="rr-v6-social-copy">

                    <strong>
                        Instagram
                    </strong>

                    <small>
                        Reels &amp; Travel Updates
                    </small>

                </span>


                <span class="rr-v6-open">
                    &#8599;
                </span>

            </a>


            <!-- FACEBOOK -->

            <a
                href="https://www.facebook.com/rajraushanofficial/"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-v6-social-card rr-v6-facebook"
                aria-label="Facebook"
            >

                <span class="rr-v6-logo">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="
                                M13.7 21
                                V13.2
                                H16.3
                                L16.7 10.2
                                H13.7
                                V8.3
                                C13.7 7.4 14 6.8 15.3 6.8
                                H16.9
                                V4.1
                                C16.2 4 15.4 4 14.5 4
                                C11.9 4 10.2 5.6 10.2 8.5
                                V10.2
                                H7.8
                                V13.2
                                H10.2
                                V21
                                Z
                            "
                            fill="currentColor"
                        ></path>
                    </svg>

                </span>


                <span class="rr-v6-social-copy">

                    <strong>
                        Facebook
                    </strong>

                    <small>
                        Creator Page
                    </small>

                </span>


                <span class="rr-v6-open">
                    &#8599;
                </span>

            </a>


            <!-- LINKEDIN -->

            <a
                href="https://www.linkedin.com/in/rajraushankumar/"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-v6-social-card rr-v6-linkedin"
                aria-label="LinkedIn"
            >

                <span class="rr-v6-logo">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="
                            M20.447 20.452
                            H16.893
                            V14.883
                            C16.893 13.555 16.866 11.846 15.041 11.846
                            C13.188 11.846 12.905 13.291 12.905 14.785
                            V20.452
                            H9.351
                            V9
                            H12.765
                            V10.561
                            H12.811
                            C13.288 9.661 14.448 8.711 16.181 8.711
                            C19.782 8.711 20.448 11.081 20.448 14.166
                            V20.452
                            Z

                            M5.337 7.433
                            C4.193 7.433 3.274 6.507 3.274 5.368
                            C3.274 4.23 4.194 3.305 5.337 3.305
                            C6.477 3.305 7.401 4.23 7.401 5.368
                            C7.401 6.507 6.476 7.433 5.337 7.433
                            Z

                            M7.119 20.452
                            H3.555
                            V9
                            H7.119
                            V20.452
                            Z
                            "
                            fill="currentColor"
                        ></path>
                    </svg>

                </span>


                <span class="rr-v6-social-copy">

                    <strong>
                        LinkedIn
                    </strong>

                    <small>
                        Professional Network
                    </small>

                </span>


                <span class="rr-v6-open">
                    &#8599;
                </span>

            </a>


            <!-- GITHUB -->

            <a
                href="https://github.com/rajraushankumar"
                target="_blank"
                rel="noopener noreferrer"
                class="rr-v6-social-card rr-v6-github"
                aria-label="GitHub"
            >

                <span class="rr-v6-logo">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            fill="currentColor"
                            d="
                            M12 .297
                            C5.37 .297 0 5.67 0 12.297
                            C0 17.6 3.438 22.097 8.205 23.682
                            C8.805 23.795 9.025 23.424 9.025 23.105
                            C9.025 22.82 9.015 22.065 9.01 21.065
                            C5.672 21.789 4.968 19.455 4.968 19.455
                            C4.422 18.068 3.635 17.698 3.635 17.698
                            C2.546 16.953 3.719 16.969 3.719 16.969
                            C4.924 17.053 5.559 18.206 5.559 18.206
                            C6.629 20.041 8.368 19.511 9.054 19.204
                            C9.162 18.428 9.472 17.899 9.816 17.599
                            C7.151 17.299 4.35 16.267 4.35 11.669
                            C4.35 10.359 4.815 9.289 5.585 8.449
                            C5.45 8.146 5.045 6.926 5.69 5.273
                            C5.69 5.273 6.695 4.951 8.99 6.503
                            C9.95 6.236 10.97 6.104 12 6.098
                            C13.02 6.104 14.04 6.236 15 6.503
                            C17.28 4.951 18.285 5.273 18.285 5.273
                            C18.93 6.926 18.525 8.146 18.405 8.449
                            C19.17 9.289 19.635 10.359 19.635 11.669
                            C19.635 16.279 16.83 17.294 14.16 17.589
                            C14.58 17.949 14.97 18.685 14.97 19.809
                            C14.97 21.415 14.955 22.705 14.955 23.095
                            C14.955 23.41 15.165 23.785 15.78 23.665
                            C20.565 22.092 24 17.592 24 12.297
                            C24 5.67 18.627 .297 12 .297
                            Z
                            "
                        ></path>
                    </svg>

                </span>


                <span class="rr-v6-social-copy">

                    <strong>
                        GitHub
                    </strong>

                    <small>
                        Projects &amp; Code
                    </small>

                </span>


                <span class="rr-v6-open">
                    &#8599;
                </span>

            </a>
        `;

    }


    if (
        document.readyState
        === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            applyCreatorVisualV6
        );

    } else {

        applyCreatorVisualV6();

    }

})();
