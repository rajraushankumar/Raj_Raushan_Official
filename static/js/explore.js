document.addEventListener(
    "DOMContentLoaded",
    function () {

        const search =
            document.getElementById(
                "exploreSearch"
            );

        const cards =
            Array.from(
                document.querySelectorAll(
                    ".explore-card"
                )
            );

        const buttons =
            document.querySelectorAll(
                ".explore-filter"
            );

        const sections =
            document.querySelectorAll(
                ".explore-section"
            );

        const empty =
            document.getElementById(
                "exploreEmpty"
            );

        let activeType =
            "all";


        function updateExplorer() {

            const query =
                search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";


            let visibleCount =
                0;


            cards.forEach(
                function (card) {

                    const type =
                        card.dataset.type
                        || "";

                    const searchable =
                        card.dataset.search
                        || "";


                    const typeMatch =
                        activeType === "all"
                        ||
                        type === activeType;


                    const searchMatch =
                        !query
                        ||
                        searchable.includes(
                            query
                        );


                    const visible =
                        typeMatch
                        &&
                        searchMatch;


                    card.style.display =
                        visible
                        ? "flex"
                        : "none";


                    if (visible) {
                        visibleCount += 1;
                    }

                }
            );


            sections.forEach(
                function (section) {

                    const visibleCards =
                        section.querySelectorAll(
                            ".explore-card"
                        );

                    const anyVisible =
                        Array.from(
                            visibleCards
                        ).some(
                            function (card) {

                                return (
                                    card.style.display
                                    !== "none"
                                );

                            }
                        );


                    section.style.display =
                        anyVisible
                        ? "block"
                        : "none";

                }
            );


            if (empty) {

                empty.style.display =
                    visibleCount === 0
                    ? "block"
                    : "none";

            }

        }


        if (search) {

            search.addEventListener(
                "input",
                updateExplorer
            );

        }


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        activeType =
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


                        updateExplorer();

                    }
                );

            }
        );

    }
);
