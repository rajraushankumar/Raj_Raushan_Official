document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* ==================================================
           FIND ALL WATCH VLOG BUTTONS
        ================================================== */

        const allElements =
            Array.from(
                document.querySelectorAll(
                    "a, button"
                )
            );


        const vlogButtons =
            allElements.filter(
                function (element) {

                    return (
                        element.textContent
                        .trim()
                        .toLowerCase()
                        .includes(
                            "watch vlog"
                        )
                    );

                }
            );


        if (
            vlogButtons.length < 2
        ) {

            console.log(
                "Vlog grid: not enough cards."
            );

            return;

        }


        /* ==================================================
           FIND CARD FOR EACH BUTTON
        ================================================== */

        function findCard(
            button
        ) {

            const preferred =
                button.closest(
                    [
                        ".video-card",
                        ".vlog-card",
                        ".content-card",
                        ".youtube-card",
                        ".travel-card",
                        "article"
                    ].join(",")
                );


            if (preferred) {
                return preferred;
            }


            let current =
                button.parentElement;


            for (
                let depth = 0;
                depth < 6 && current;
                depth++
            ) {

                if (
                    current.querySelector(
                        "img"
                    )
                ) {

                    return current;

                }


                current =
                    current.parentElement;

            }


            return null;

        }


        const cards =
            vlogButtons
            .map(
                findCard
            )
            .filter(
                Boolean
            );


        const uniqueCards =
            Array.from(
                new Set(
                    cards
                )
            );


        if (
            uniqueCards.length < 2
        ) {
            return;
        }


        /* ==================================================
           FIND COMMON GRID CONTAINER
        ================================================== */

        function findCommonParent(
            elements
        ) {

            let parent =
                elements[0]
                .parentElement;


            while (
                parent
                &&
                parent !== document.body
            ) {

                const containsAll =
                    elements.every(
                        function (
                            element
                        ) {

                            return parent.contains(
                                element
                            );

                        }
                    );


                if (
                    containsAll
                ) {

                    const directCards =
                        elements.filter(
                            function (
                                element
                            ) {

                                return (
                                    element.parentElement
                                    === parent
                                );

                            }
                        );


                    if (
                        directCards.length
                        === elements.length
                    ) {

                        return parent;

                    }

                }


                parent =
                    parent.parentElement;

            }


            return (
                elements[0]
                .parentElement
            );

        }


        let container =
            findCommonParent(
                uniqueCards
            );


        if (!container) {
            return;
        }


        /* ==================================================
           IF CARDS ARE WRAPPED ONE LEVEL DEEP
        ================================================== */

        const normalizedCards = [];


        uniqueCards.forEach(
            function (card) {

                let target =
                    card;


                while (
                    target.parentElement
                    &&
                    target.parentElement
                    !== container
                ) {

                    target =
                        target.parentElement;

                }


                normalizedCards.push(
                    target
                );

            }
        );


        const finalCards =
            Array.from(
                new Set(
                    normalizedCards
                )
            );


        /* ==================================================
           APPLY PROFESSIONAL GRID
        ================================================== */

        container.classList.add(
            "rr-vlog-pro-grid"
        );


        container.classList.add(
            "rr-vlog-count-"
            +
            finalCards.length
        );


        if (
            finalCards.length % 2 !== 0
        ) {

            container.classList.add(
                "rr-vlog-odd"
            );

        }


        finalCards.forEach(
            function (
                card
            ) {

                card.classList.add(
                    "rr-vlog-pro-card"
                );

            }
        );


        console.log(
            "Professional vlog grid:",
            finalCards.length,
            "cards"
        );

    }
);
