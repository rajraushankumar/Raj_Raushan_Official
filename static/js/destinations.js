document.addEventListener(
    "DOMContentLoaded",
    function () {

        const buttons =
            document.querySelectorAll(
                ".destination-filter"
            );

        const cards =
            document.querySelectorAll(
                ".destination-card"
            );

        const search =
            document.getElementById(
                "destinationSearch"
            );

        const empty =
            document.getElementById(
                "destinationEmpty"
            );

        let activeFilter =
            "all";


        function updateCards() {

            const query =
                search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";

            let visible =
                0;


            cards.forEach(
                function (card) {

                    const title =
                        card.dataset.title
                        || "";

                    const tags =
                        card.dataset.tags
                        || "";


                    const filterMatch =
                        activeFilter === "all"
                        ||
                        tags.includes(
                            activeFilter
                        );


                    const searchMatch =
                        !query
                        ||
                        title.includes(
                            query
                        )
                        ||
                        tags.includes(
                            query
                        );


                    if (
                        filterMatch
                        &&
                        searchMatch
                    ) {

                        card.style.display =
                            "flex";

                        visible += 1;

                    } else {

                        card.style.display =
                            "none";

                    }

                }
            );


            if (empty) {

                empty.style.display =
                    visible === 0
                    ? "block"
                    : "none";

            }

        }


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        activeFilter =
                            button.dataset.filter;


                        buttons.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        updateCards();

                    }
                );

            }
        );


        if (search) {

            search.addEventListener(
                "input",
                updateCards
            );

        }

    }
);


// ==========================================================
// DESTINATION STAT CARD CLICK FALLBACK
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const publicCard =
            document.getElementById(
                "publicPlaylistsCard"
            );

        const connectedCard =
            document.getElementById(
                "connectedDestinationsCard"
            );


        if (publicCard) {

            publicCard.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    window.location.href =
                        "/playlists";

                }
            );

        }


        if (connectedCard) {

            connectedCard.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    const grid =
                        document.getElementById(
                            "destinationGrid"
                        );

                    if (grid) {

                        grid.scrollIntoView(
                            {
                                behavior:
                                    "smooth",

                                block:
                                    "start"
                            }
                        );

                    }

                }
            );

        }

    }
);
