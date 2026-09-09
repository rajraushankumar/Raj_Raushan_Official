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
