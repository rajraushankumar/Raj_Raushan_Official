document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".rr-live-stat-card");

    cards.forEach(function (card) {

        const text = card.innerText.toLowerCase();

        let icon = "";

        if (text.includes("destinations")) {
            icon = `
                <div class="rr-live-stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                              stroke="currentColor"
                              stroke-width="2"/>
                        <circle cx="12" cy="9" r="2.5"
                                stroke="currentColor"
                                stroke-width="2"/>
                    </svg>
                </div>
            `;
        }

        else if (text.includes("public playlists")) {
            icon = `
                <div class="rr-live-stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="14" height="16" rx="2"
                              stroke="currentColor"
                              stroke-width="2"/>
                        <path d="M7 8h6M7 12h6M7 16h4"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"/>
                        <path d="m19 8 2 1.5L19 11V8Z"
                              fill="currentColor"/>
                    </svg>
                </div>
            `;
        }

        else if (text.includes("playlist videos")) {
            icon = `
                <div class="rr-live-stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="13" height="14" rx="2"
                              stroke="currentColor"
                              stroke-width="2"/>
                        <path d="m16 10 5-3v10l-5-3v-4Z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linejoin="round"/>
                        <path d="m8 9 4 3-4 3V9Z"
                              fill="currentColor"/>
                    </svg>
                </div>
            `;
        }

        if (icon && !card.querySelector(".rr-live-stat-icon")) {
            card.insertAdjacentHTML("afterbegin", icon);
        }
    });
});
