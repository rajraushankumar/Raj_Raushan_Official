document.addEventListener("DOMContentLoaded", function () {

    const destinationEl =
        document.getElementById("rrStatDestinations");

    const playlistEl =
        document.getElementById("rrStatPlaylists");

    const videoEl =
        document.getElementById("rrStatVideos");

    const statusEl =
        document.getElementById("rrStatsStatus");

    if (
        !destinationEl ||
        !playlistEl ||
        !videoEl
    ) {
        return;
    }

    function formatNumber(value) {

        const number = Number(value || 0);

        return number.toLocaleString("en-IN");
    }

    fetch("/api/travel-stats", {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        cache: "no-store"
    })

    .then(function (response) {

        if (!response.ok) {
            throw new Error(
                "Stats request failed"
            );
        }

        return response.json();
    })

    .then(function (data) {

        if (
            !data ||
            data.status !== "success"
        ) {
            throw new Error(
                "Invalid stats response"
            );
        }

        destinationEl.textContent =
            formatNumber(
                data.destinations
            );

        playlistEl.textContent =
            formatNumber(
                data.public_playlists
            );

        videoEl.textContent =
            formatNumber(
                data.playlist_videos
            );

        if (statusEl) {

            statusEl.textContent =
                "Live data • Updated " +
                new Date().toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }

    })

    .catch(function () {

        /*
         * Do not break the homepage if the
         * YouTube/API service is temporarily
         * unavailable.
         */

        destinationEl.textContent = "—";
        playlistEl.textContent = "—";
        videoEl.textContent = "—";

        if (statusEl) {

            statusEl.textContent =
                "Travel stats are temporarily unavailable.";

            statusEl.classList.add(
                "rr-stats-error"
            );
        }

    });

});
