
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "exploreSearch"
            );

        const wrapper =
            input
            ? input.closest(
                ".explore-search-wrap"
            )
            : null;


        if (!input || !wrapper) {
            return;
        }


        const dropdown =
            document.createElement(
                "div"
            );

        dropdown.id =
            "travelSearchSuggestions";

        dropdown.className =
            "travel-search-suggestions";

        dropdown.setAttribute(
            "role",
            "listbox"
        );

        wrapper.appendChild(
            dropdown
        );


        let searchData = [];
        let activeIndex = -1;


        function escapeHtml(value) {

            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

        }


        async function loadSearchData() {

            dropdown.innerHTML =
                '<div class="travel-search-state">Loading travel data...</div>';


            try {

                const [
                    destinationResponse,
                    playlistResponse
                ] = await Promise.all(
                    [
                        fetch(
                            "/api/destinations"
                        ),

                        fetch(
                            "/api/playlists"
                        )
                    ]
                );


                if (
                    !destinationResponse.ok
                    ||
                    !playlistResponse.ok
                ) {

                    throw new Error(
                        "API request failed"
                    );

                }


                const destinationData =
                    await destinationResponse.json();

                const playlistData =
                    await playlistResponse.json();


                const destinations =
                    (
                        destinationData.destinations
                        || []
                    ).map(
                        function (item) {

                            return {

                                type:
                                    "destination",

                                title:
                                    item.title
                                    || "",

                                meta:
                                    item.region
                                    || "",

                                search:
                                    (
                                        (
                                            item.title
                                            || ""
                                        )
                                        + " "
                                        +
                                        (
                                            item.region
                                            || ""
                                        )
                                        + " "
                                        +
                                        (
                                            item.category
                                            || ""
                                        )
                                    ).toLowerCase(),

                                url:
                                    item.url
                                    || "#"
                            };

                        }
                    );


                const playlists =
                    (
                        playlistData.playlists
                        || []
                    ).map(
                        function (item) {

                            return {

                                type:
                                    "playlist",

                                title:
                                    item.title
                                    || "",

                                meta:
                                    (
                                        item.video_count
                                        || 0
                                    )
                                    + " videos",

                                search:
                                    (
                                        item.title
                                        || ""
                                    ).toLowerCase(),

                                url:
                                    item.url
                                    || "#"
                            };

                        }
                    );


                searchData =
                    [
                        ...destinations,
                        ...playlists
                    ];


                dropdown.innerHTML =
                    "";

            } catch (error) {

                console.error(
                    "Autocomplete load error:",
                    error
                );


                dropdown.innerHTML =
                    '<div class="travel-search-state">Search suggestions are temporarily unavailable.</div>';

            }

        }


        function hideDropdown() {

            dropdown.classList.remove(
                "active"
            );

            activeIndex = -1;

        }


        function renderSuggestions(
            query
        ) {

            query =
                query
                .trim()
                .toLowerCase();


            if (
                query.length < 2
            ) {

                hideDropdown();

                dropdown.innerHTML =
                    "";

                return;

            }


            const matches =
                searchData
                .filter(
                    function (item) {

                        return item.search.includes(
                            query
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        const aStarts =
                            a.title
                            .toLowerCase()
                            .startsWith(
                                query
                            );

                        const bStarts =
                            b.title
                            .toLowerCase()
                            .startsWith(
                                query
                            );


                        if (
                            aStarts
                            &&
                            !bStarts
                        ) {
                            return -1;
                        }


                        if (
                            bStarts
                            &&
                            !aStarts
                        ) {
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

                    }
                )
                .slice(
                    0,
                    8
                );


            activeIndex = -1;


            if (
                matches.length === 0
            ) {

                dropdown.innerHTML =
                    '<div class="travel-search-state">No matching destination or playlist found.</div>';

                dropdown.classList.add(
                    "active"
                );

                return;

            }


            dropdown.innerHTML =
                matches.map(
                    function (
                        item
                    ) {

                        const external =
                            item.type
                            === "playlist";


                        return `
                            <a
                                class="travel-suggestion"
                                href="${escapeHtml(item.url)}"
                                ${external
                                    ? 'target="_blank" rel="noopener noreferrer"'
                                    : ''
                                }
                                role="option"
                            >

                                <span class="travel-suggestion-main">

                                    <span class="travel-suggestion-type">
                                        ${
                                            item.type
                                            === "destination"
                                            ? "DESTINATION"
                                            : "YOUTUBE PLAYLIST"
                                        }
                                    </span>

                                    <span class="travel-suggestion-title">
                                        ${escapeHtml(item.title)}
                                    </span>

                                    <span class="travel-suggestion-meta">
                                        ${escapeHtml(item.meta)}
                                    </span>

                                </span>

                                <span class="travel-suggestion-arrow">
                                    ?
                                </span>

                            </a>
                        `;

                    }
                ).join(
                    ""
                );


            dropdown.classList.add(
                "active"
            );

        }


        input.addEventListener(
            "input",
            function () {

                renderSuggestions(
                    input.value
                );

            }
        );


        input.addEventListener(
            "focus",
            function () {

                if (
                    input.value
                    .trim()
                    .length >= 2
                ) {

                    renderSuggestions(
                        input.value
                    );

                }

            }
        );


        input.addEventListener(
            "keydown",
            function (event) {

                const suggestions =
                    Array.from(
                        dropdown.querySelectorAll(
                            ".travel-suggestion"
                        )
                    );


                if (
                    !suggestions.length
                ) {
                    return;
                }


                if (
                    event.key
                    === "ArrowDown"
                ) {

                    event.preventDefault();

                    activeIndex =
                        (
                            activeIndex
                            + 1
                        )
                        %
                        suggestions.length;

                } else if (
                    event.key
                    === "ArrowUp"
                ) {

                    event.preventDefault();

                    activeIndex =
                        (
                            activeIndex
                            - 1
                            + suggestions.length
                        )
                        %
                        suggestions.length;

                } else if (
                    event.key
                    === "Enter"
                    &&
                    activeIndex >= 0
                ) {

                    event.preventDefault();

                    suggestions[
                        activeIndex
                    ].click();

                    return;

                } else if (
                    event.key
                    === "Escape"
                ) {

                    hideDropdown();

                    return;

                } else {

                    return;

                }


                suggestions.forEach(
                    function (
                        suggestion,
                        index
                    ) {

                        suggestion.classList.toggle(
                            "keyboard-active",
                            index === activeIndex
                        );

                    }
                );


                suggestions[
                    activeIndex
                ].scrollIntoView(
                    {
                        block:
                            "nearest"
                    }
                );

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !wrapper.contains(
                        event.target
                    )
                ) {

                    hideDropdown();

                }

            }
        );


        loadSearchData();

    }
);
