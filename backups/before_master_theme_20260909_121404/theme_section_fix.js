(function () {

    "use strict";


    function clean(value) {

        return String(
            value || ""
        )
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    }


    /* ======================================================
       YOUTUBE CHANNEL SECTION
    ====================================================== */

    function fixChannelSection() {

        const headings =
            Array.from(
                document.querySelectorAll(
                    "h1, h2, h3"
                )
            );


        const heading =
            headings.find(
                function (item) {

                    return clean(
                        item.textContent
                    ).includes(
                        "my youtube channels"
                    );

                }
            );


        if (!heading) {
            return;
        }


        heading.classList.add(
            "rr-v7-channel-heading"
        );


        let section =
            heading.parentElement;


        while (
            section
            &&
            section !== document.body
        ) {

            const buttons =
                Array.from(
                    section.querySelectorAll(
                        "a, button"
                    )
                )
                .filter(
                    function (item) {

                        return clean(
                            item.textContent
                        ).includes(
                            "visit channel"
                        );

                    }
                );


            if (
                buttons.length >= 2
            ) {
                break;
            }


            section =
                section.parentElement;

        }


        if (
            !section
            ||
            section === document.body
        ) {
            return;
        }


        section.classList.add(
            "rr-v7-channel-section"
        );


        const buttons =
            Array.from(
                section.querySelectorAll(
                    "a, button"
                )
            )
            .filter(
                function (item) {

                    return clean(
                        item.textContent
                    ).includes(
                        "visit channel"
                    );

                }
            );


        buttons.forEach(
            function (button) {

                let card =
                    button.parentElement;


                while (
                    card
                    &&
                    card !== section
                ) {

                    if (
                        card.querySelector(
                            "img"
                        )
                        &&
                        clean(
                            card.textContent
                        ).includes(
                            "subscribers"
                        )
                    ) {

                        card.classList.add(
                            "rr-v7-channel-card"
                        );

                        break;

                    }


                    card =
                        card.parentElement;

                }

            }
        );

    }


    /* ======================================================
       STORY CARDS
    ====================================================== */

    function fixStories() {

        const buttons =
            Array.from(
                document.querySelectorAll(
                    "a, button"
                )
            )
            .filter(
                function (item) {

                    return clean(
                        item.textContent
                    ).includes(
                        "watch story"
                    );

                }
            );


        buttons.forEach(
            function (button) {

                button.innerHTML =
                    "Watch Story &rarr;";


                let card =
                    button.parentElement;


                while (
                    card
                    &&
                    card !== document.body
                ) {

                    if (
                        card.querySelector(
                            "img"
                        )
                    ) {

                        card.classList.add(
                            "rr-v7-story-card"
                        );


                        Array.from(
                            card.querySelectorAll(
                                "*"
                            )
                        )
                        .forEach(
                            function (element) {

                                if (
                                    element.children.length
                                    === 0
                                    &&
                                    element.textContent
                                    .trim()
                                    === "?"
                                ) {

                                    element.innerHTML =
                                        "&#9654;";


                                    element.classList.add(
                                        "rr-v7-story-play"
                                    );

                                }

                            }
                        );


                        break;

                    }


                    card =
                        card.parentElement;

                }

            }
        );

    }


    function run() {

        fixChannelSection();

        fixStories();

    }


    if (
        document.readyState
        === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            run
        );

    } else {

        run();

    }


    setTimeout(
        run,
        500
    );

})();
