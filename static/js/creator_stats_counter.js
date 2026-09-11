"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const statsSection =
        document.querySelector(".rr-creator-stats") ||
        document.querySelector(".rr-stats-grid") ||
        document.querySelector(
            ".rr-creator-identity .rr-stat-card"
        )?.parentElement;


    if (!statsSection) {
        console.warn(
            "Creator stats section not found."
        );

        return;
    }


    statsSection.classList.add(
        "rr-premium-stats"
    );


    const cards =
        Array.from(
            statsSection.querySelectorAll(
                ".rr-stat-card"
            )
        ).slice(0, 4);


    if (!cards.length) {
        return;
    }


    const stats = [

        {
            target: 500,
            suffix: "+",
            label: "Videos"
        },

        {
            target: 450,
            suffix: "K+",
            label: "Total Views"
        },

        {
            target: 11,
            suffix: "",
            label: "Destinations"
        },

        {
            target: 2,
            suffix: "",
            label: "Live Channels"
        }

    ];


    cards.forEach(
        (card, index) => {

            const config =
                stats[index];

            if (!config) {
                return;
            }


            let number =
                card.querySelector(
                    ".rr-counter"
                ) ||
                card.querySelector(
                    "strong"
                );


            if (!number) {

                number =
                    document.createElement(
                        "strong"
                    );

                card.prepend(number);
            }


            number.classList.add(
                "rr-counter"
            );


            number.dataset.target =
                String(config.target);

            number.dataset.suffix =
                config.suffix;

            number.textContent =
                "0";


            let label =
                card.querySelector(
                    ".rr-stat-label"
                ) ||
                card.querySelector(
                    "span"
                ) ||
                card.querySelector(
                    "small"
                ) ||
                card.querySelector(
                    "p"
                );


            if (!label) {

                label =
                    document.createElement(
                        "span"
                    );

                card.appendChild(label);
            }


            label.classList.add(
                "rr-stat-label"
            );

            label.textContent =
                config.label;

        }
    );


    const counters =
        statsSection.querySelectorAll(
            ".rr-counter"
        );


    const duration =
        2000;


    function setFinalValues() {

        counters.forEach(counter => {

            const target =
                Number(
                    counter.dataset.target ||
                    0
                );

            const suffix =
                counter.dataset.suffix ||
                "";

            counter.textContent =
                target.toLocaleString() +
                suffix;

        });

    }


    function animateCounter(counter) {

        const target =
            Number(
                counter.dataset.target ||
                0
            );


        const suffix =
            counter.dataset.suffix ||
            "";


        const start =
            performance.now();


        function frame(now) {

            const elapsed =
                now - start;


            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
             Smooth ease-out cubic.
            */

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const current =
                Math.floor(
                    target * eased
                );


            counter.textContent =
                current.toLocaleString() +
                suffix;


            if (progress < 1) {

                requestAnimationFrame(
                    frame
                );

            }
            else {

                counter.textContent =
                    target.toLocaleString() +
                    suffix;

            }

        }


        requestAnimationFrame(
            frame
        );

    }


    let started =
        false;


    function startCounters() {

        if (started) {
            return;
        }


        started =
            true;


        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            setFinalValues();

            return;
        }


        counters.forEach(
            animateCounter
        );

    }


    const observer =
        new IntersectionObserver(

            entries => {

                for (
                    const entry
                    of entries
                ) {

                    if (
                        entry.isIntersecting
                    ) {

                        startCounters();

                        observer.disconnect();

                        break;
                    }

                }

            },

            {
                threshold: 0.30
            }

        );


    observer.observe(
        statsSection
    );

});