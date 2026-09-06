document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("rrGlobalSearchOverlay")) {
        return;
    }

    let searchData = [];
    let loaded = false;
    let activeIndex = -1;


    // --------------------------------------------------------
    // CREATE BUTTON
    // --------------------------------------------------------

    const button = document.createElement("button");

    button.type = "button";
    button.className = "rr-search-button";

    button.innerHTML = `
        <span>&#128269;</span>

        <span class="rr-search-text">
            Search
        </span>

        <span class="rr-search-key">
            Ctrl K
        </span>
    `;

    button.setAttribute(
        "aria-label",
        "Open global travel search"
    );


    // --------------------------------------------------------
    // CREATE OVERLAY
    // --------------------------------------------------------

    const overlay = document.createElement("div");

    overlay.id = "rrGlobalSearchOverlay";
    overlay.className = "rr-search-overlay";

    overlay.innerHTML = `
        <section class="rr-search-panel">

            <div class="rr-search-header">

                <span class="rr-search-symbol">
                    &#128269;
                </span>

                <input
                    id="rrSearchInput"
                    type="search"
                    placeholder="Search destinations or playlists..."
                    autocomplete="off"
                >

                <button
                    type="button"
                    class="rr-search-close"
                >
                    ESC
                </button>

            </div>


            <div
                class="rr-search-results"
                id="rrSearchResults"
            >

                <div class="rr-search-message">

                    <strong>
                        Search the Journey
                    </strong>

                    <span>
                        Try Patna, Ranchi,
                        Varanasi or Sasaram.
                    </span>

                </div>

            </div>


            <div class="rr-search-footer">

                <span>
                    Arrow Keys - Navigate
                </span>

                <span>
                    Enter - Open
                </span>

                <span>
                    Esc - Close
                </span>

            </div>

        </section>
    `;


    document.body.appendChild(button);
    document.body.appendChild(overlay);


    const input =
        document.getElementById("rrSearchInput");

    const results =
        document.getElementById("rrSearchResults");

    const closeButton =
        overlay.querySelector(".rr-search-close");


    // --------------------------------------------------------
    // SAFE HTML
    // --------------------------------------------------------

    function escapeHtml(value) {

        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    // --------------------------------------------------------
    // LOAD BACKEND API DATA
    // --------------------------------------------------------

    async function loadData() {

        if (loaded) {
            return;
        }

        results.innerHTML = `
            <div class="rr-search-message">
                <strong>
                    Loading travel data...
                </strong>
            </div>
        `;

        try {

            const responses = await Promise.all([
                fetch("/api/destinations"),
                fetch("/api/playlists")
            ]);

            if (
                !responses[0].ok ||
                !responses[1].ok
            ) {
                throw new Error("API error");
            }

            const destinationJson =
                await responses[0].json();

            const playlistJson =
                await responses[1].json();


            const destinations =
                (destinationJson.destinations || [])
                .map(function (item) {

                    return {
                        type: "destination",

                        title:
                            item.title || "",

                        meta:
                            item.region || "",

                        url:
                            item.url || "#",

                        search:
                            (
                                (item.title || "")
                                + " "
                                + (item.region || "")
                                + " "
                                + (item.category || "")
                            ).toLowerCase()
                    };
                });


            const playlists =
                (playlistJson.playlists || [])
                .map(function (item) {

                    return {
                        type: "playlist",

                        title:
                            item.title || "",

                        meta:
                            (item.video_count || 0)
                            + " videos",

                        url:
                            item.url || "#",

                        search:
                            (item.title || "")
                            .toLowerCase()
                    };
                });


            searchData = [
                ...destinations,
                ...playlists
            ];

            loaded = true;

            showInitial();

        } catch (error) {

            console.error(
                "Global Search:",
                error
            );

            results.innerHTML = `
                <div class="rr-search-message">

                    <strong>
                        Search unavailable
                    </strong>

                    <span>
                        Travel API could not
                        be loaded.
                    </span>

                </div>
            `;
        }
    }


    // --------------------------------------------------------
    // INITIAL SCREEN
    // --------------------------------------------------------

    function showInitial() {

        results.innerHTML = `
            <div class="rr-search-message">

                <strong>
                    Search the Journey
                </strong>

                <span>
                    ${searchData.length}
                    searchable destinations
                    and playlists.
                </span>

            </div>
        `;
    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    function renderSearch(query) {

        query =
            query
            .trim()
            .toLowerCase();

        activeIndex = -1;

        if (query.length < 2) {

            showInitial();
            return;
        }


        const matches =
            searchData
            .filter(function (item) {

                return item.search.includes(
                    query
                );
            })
            .sort(function (a, b) {

                const aStarts =
                    a.title
                    .toLowerCase()
                    .startsWith(query);

                const bStarts =
                    b.title
                    .toLowerCase()
                    .startsWith(query);

                if (aStarts && !bStarts) {
                    return -1;
                }

                if (bStarts && !aStarts) {
                    return 1;
                }

                if (
                    a.type === "destination"
                    &&
                    b.type !== "destination"
                ) {
                    return -1;
                }

                if (
                    b.type === "destination"
                    &&
                    a.type !== "destination"
                ) {
                    return 1;
                }

                return a.title.localeCompare(
                    b.title
                );
            })
            .slice(0, 10);


        if (!matches.length) {

            results.innerHTML = `
                <div class="rr-search-message">

                    <strong>
                        No result found
                    </strong>

                    <span>
                        Try another place
                        or playlist.
                    </span>

                </div>
            `;

            return;
        }


        results.innerHTML =
            matches.map(function (item) {

                const playlist =
                    item.type === "playlist";

                return `
                    <a
                        class="rr-search-result"
                        href="${escapeHtml(item.url)}"
                        ${
                            playlist
                            ? 'target="_blank" rel="noopener noreferrer"'
                            : ''
                        }
                    >

                        <span class="rr-result-badge">
                            ${
                                playlist
                                ? "YT"
                                : "TR"
                            }
                        </span>


                        <span class="rr-result-content">

                            <span class="rr-result-type">
                                ${
                                    playlist
                                    ? "YOUTUBE PLAYLIST"
                                    : "DESTINATION"
                                }
                            </span>

                            <span class="rr-result-title">
                                ${escapeHtml(item.title)}
                            </span>

                            <span class="rr-result-meta">
                                ${escapeHtml(item.meta)}
                            </span>

                        </span>


                        <span class="rr-result-arrow">
                            &nearr;
                        </span>

                    </a>
                `;
            })
            .join("");
    }


    // --------------------------------------------------------
    // OPEN / CLOSE
    // --------------------------------------------------------

    async function openSearch() {

        overlay.classList.add("active");

        document.body.style.overflow =
            "hidden";

        await loadData();

        setTimeout(function () {
            input.focus();
        }, 80);
    }


    function closeSearch() {

        overlay.classList.remove("active");

        document.body.style.overflow =
            "";

        input.value = "";

        activeIndex = -1;

        if (loaded) {
            showInitial();
        }
    }


    button.addEventListener(
        "click",
        openSearch
    );


    closeButton.addEventListener(
        "click",
        closeSearch
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (event.target === overlay) {
                closeSearch();
            }
        }
    );


    input.addEventListener(
        "input",
        function () {

            renderSearch(
                input.value
            );
        }
    );


    // --------------------------------------------------------
    // KEYBOARD
    // --------------------------------------------------------

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.ctrlKey || event.metaKey)
                &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                openSearch();
                return;
            }


            if (
                event.key === "Escape"
                &&
                overlay.classList.contains("active")
            ) {

                closeSearch();
                return;
            }


            if (
                !overlay.classList.contains("active")
            ) {
                return;
            }


            const items =
                Array.from(
                    results.querySelectorAll(
                        ".rr-search-result"
                    )
                );


            if (!items.length) {
                return;
            }


            if (event.key === "ArrowDown") {

                event.preventDefault();

                activeIndex =
                    (activeIndex + 1)
                    % items.length;

            } else if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();

                activeIndex =
                    (
                        activeIndex
                        - 1
                        + items.length
                    )
                    % items.length;

            } else if (
                event.key === "Enter"
                &&
                activeIndex >= 0
            ) {

                event.preventDefault();

                items[activeIndex].click();

                return;

            } else {

                return;
            }


            items.forEach(
                function (item, index) {

                    item.classList.toggle(
                        "active",
                        index === activeIndex
                    );
                }
            );


            items[
                activeIndex
            ].scrollIntoView({
                block: "nearest"
            });
        }
    );
});
