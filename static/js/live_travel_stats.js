document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".rr-live-stat-card");

    if (!cards.length) {
        console.warn("Live travel stat cards not found.");
        return;
    }

    cards.forEach(function (card) {

        const text = card.innerText.toLowerCase();

        let target = null;

        if (text.includes("destinations")) {
            target = "/destinations";
        }
        else if (text.includes("public playlists")) {
            target = "/playlists";
        }
        else if (text.includes("playlist videos")) {
            target = "/vlogs";
        }

        if (!target) return;

        card.style.cursor = "pointer";

        card.addEventListener("click", function (event) {

            // If an actual link/button inside the card was clicked,
            // allow that normal link to work.
            if (event.target.closest("a, button")) {
                return;
            }

            window.location.href = target;
        });

        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");

        card.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                window.location.href = target;
            }

        });

        console.log("Stats card linked:", target);
    });
});
