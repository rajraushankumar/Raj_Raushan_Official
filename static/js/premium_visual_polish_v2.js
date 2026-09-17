(function () {
    "use strict";

    function normalize(text) {
        return (text || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function closestSection(el) {
        if (!el) return null;

        return el.closest(
            "section, .section, main > div, .container"
        );
    }


    function polishHero() {

        var heading = Array.from(
            document.querySelectorAll("h1")
        ).find(function (el) {

            var text = normalize(el.textContent);

            return (
                text.includes("raj raushan") &&
                text.includes("official")
            );
        });


        if (!heading) return;


        var hero = closestSection(heading);

        if (!hero) {
            hero = heading.parentElement;
        }

        hero.classList.add("rr-v2-hero");


        /* Highlight OFFICIAL without changing visible text */

        if (
            !heading.querySelector(".rr-v2-official") &&
            heading.textContent.includes("Official")
        ) {

            var html =
                heading.innerHTML;

            heading.innerHTML =
                html.replace(
                    /Official/g,
                    '<span class="rr-v2-official">Official</span>'
                );
        }


        /* Identify chips inside hero */

        hero.querySelectorAll(
            "a, button, span, div"
        ).forEach(function (el) {

            var text =
                normalize(el.textContent);

            var chipNames = [
                "travel",
                "destinations",
                "culture",
                "shorts",
                "vlogs"
            ];

            if (
                chipNames.includes(text) &&
                el.children.length === 0
            ) {
                el.classList.add("rr-v2-chip");
            }
        });
    }


    function polishStories() {

        var heading = Array.from(
            document.querySelectorAll("h1,h2")
        ).find(function (el) {

            return normalize(el.textContent)
                .includes("stories beyond the screen");
        });


        if (!heading) return;


        var section =
            closestSection(heading);

        if (!section) {
            section = heading.parentElement;
        }

        section.classList.add(
            "rr-v2-stories"
        );


        /* Find likely story cards */

        var candidates =
            section.querySelectorAll(
                "[class*='card'], article"
            );


        if (!candidates.length) {

            candidates =
                section.querySelectorAll(
                    "div"
                );
        }


        candidates.forEach(function (card) {

            var text =
                normalize(card.textContent);

            var titles = [
                "original content",
                "real locations",
                "growing journey",
                "creator technology"
            ];

            var isStory =
                titles.some(function (title) {
                    return text.includes(title);
                });


            if (!isStory) return;


            /* Prevent marking large parent wrappers */

            var nestedStoryCards =
                card.querySelectorAll(
                    "[class*='card']"
                );

            if (
                nestedStoryCards.length > 1
            ) {
                return;
            }


            card.classList.add(
                "rr-v2-story-card"
            );


            card.querySelectorAll(
                "span, small, div"
            ).forEach(function (el) {

                var t =
                    normalize(el.textContent);

                if (
                    /^(01|02|03|04)$/.test(t) &&
                    el.children.length === 0
                ) {
                    el.classList.add(
                        "rr-v2-number"
                    );
                }
            });


            var firstText =
                card.querySelector(
                    "span, div, p"
                );

            if (
                firstText &&
                /[\u{1F300}-\u{1FAFF}]/u
                    .test(firstText.textContent || "")
            ) {
                firstText.classList.add(
                    "rr-v2-icon"
                );
            }
        });


        var nextParagraph =
            heading.nextElementSibling;

        if (
            nextParagraph &&
            nextParagraph.tagName === "P"
        ) {
            nextParagraph.classList.add(
                "rr-v2-section-copy"
            );
        }
    }


    function init() {
        polishHero();
        polishStories();
    }


    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    }
    else {
        init();
    }

})();