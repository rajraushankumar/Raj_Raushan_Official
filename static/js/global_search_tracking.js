(function () {

    // Prevent duplicate initialization
    if (window.__rrSearchTrackingLoaded) {
        return;
    }

    window.__rrSearchTrackingLoaded = true;

    let lastEventKey = "";
    let lastEventTime = 0;


    document.addEventListener(
        "click",
        function (event) {

            const result =
                event.target.closest(
                    ".rr-search-result"
                );

            if (!result) {
                return;
            }


            const input =
                document.getElementById(
                    "rrSearchInput"
                );

            const titleNode =
                result.querySelector(
                    ".rr-result-title"
                );

            const typeNode =
                result.querySelector(
                    ".rr-result-type"
                );


            const query =
                input
                ? input.value.trim()
                : "";


            const title =
                titleNode
                ? titleNode.textContent.trim()
                : "";


            const typeText =
                typeNode
                ? typeNode.textContent.trim()
                : "";


            const resultType =
                typeText.includes(
                    "PLAYLIST"
                )
                ? "playlist"
                : "destination";


            const url =
                result.getAttribute(
                    "href"
                )
                || "";


            // -----------------------------------------------
            // DUPLICATE PROTECTION
            // Same event inside 2 seconds = ignore
            // -----------------------------------------------

            const eventKey =
                query
                + "|"
                + resultType
                + "|"
                + title
                + "|"
                + url;


            const now =
                Date.now();


            if (
                eventKey === lastEventKey
                &&
                (
                    now - lastEventTime
                ) < 2000
            ) {

                return;
            }


            lastEventKey =
                eventKey;

            lastEventTime =
                now;


            const payload = {
                query:
                    query || title,

                result_type:
                    resultType,

                result_title:
                    title,

                result_url:
                    url
            };


            const json =
                JSON.stringify(
                    payload
                );


            if (
                navigator.sendBeacon
            ) {

                const blob =
                    new Blob(
                        [json],
                        {
                            type:
                                "application/json"
                        }
                    );


                if (
                    navigator.sendBeacon(
                        "/api/search-event",
                        blob
                    )
                ) {

                    return;
                }
            }


            fetch(
                "/api/search-event",
                {
                    method:
                        "POST",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        json,

                    keepalive:
                        true
                }
            ).catch(
                function () {}
            );

        }
    );

})();
