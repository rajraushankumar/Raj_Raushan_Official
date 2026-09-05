document.addEventListener(
    "DOMContentLoaded",
    function () {

        const mapElement =
            document.getElementById(
                "travelMap"
            );

        if (
            !mapElement ||
            typeof L === "undefined"
        ) {
            return;
        }


        const cards =
            Array.from(
                document.querySelectorAll(
                    ".map-place-card"
                )
            );


        const destinations =
            cards.map(
                function (card) {

                    return {

                        slug:
                            card.dataset.slug,

                        title:
                            card.querySelector(
                                "strong"
                            ).textContent.trim(),

                        region:
                            card.querySelector(
                                "small"
                            ).textContent.trim(),

                        lat:
                            Number(
                                card.dataset.lat
                            ),

                        lng:
                            Number(
                                card.dataset.lng
                            )

                    };

                }
            );


        const map =
            L.map(
                "travelMap",
                {
                    scrollWheelZoom:
                        false
                }
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom:
                    19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);


        const markerMap =
            new Map();


        destinations.forEach(
            function (destination) {

                const marker =
                    L.marker(
                        [
                            destination.lat,
                            destination.lng
                        ]
                    )
                    .addTo(map);


                marker.bindPopup(
                    `
                    <strong>
                        ${destination.title}
                    </strong>

                    <br>

                    ${destination.region}

                    <br><br>

                    <a href="/destination/${destination.slug}">
                        Explore Destination &rarr;
                    </a>
                    `
                );


                markerMap.set(
                    destination.slug,
                    marker
                );

            }
        );


        if (destinations.length > 1) {

            const bounds =
                L.latLngBounds(
                    destinations.map(
                        function (destination) {

                            return [
                                destination.lat,
                                destination.lng
                            ];

                        }
                    )
                );


            map.fitBounds(
                bounds,
                {
                    padding:
                        [40, 40]
                }
            );

        } else if (
            destinations.length === 1
        ) {

            map.setView(
                [
                    destinations[0].lat,
                    destinations[0].lng
                ],
                10
            );

        } else {

            map.setView(
                [25, 84],
                6
            );

        }


        cards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        cards.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        card.classList.add(
                            "active"
                        );


                        const lat =
                            Number(
                                card.dataset.lat
                            );

                        const lng =
                            Number(
                                card.dataset.lng
                            );

                        const slug =
                            card.dataset.slug;


                        map.flyTo(
                            [lat, lng],
                            11,
                            {
                                duration:
                                    1
                            }
                        );


                        const marker =
                            markerMap.get(
                                slug
                            );


                        if (marker) {

                            setTimeout(
                                function () {

                                    marker.openPopup();

                                },
                                550
                            );

                        }

                    }
                );

            }
        );


        if (cards.length > 0) {

            cards[0].classList.add(
                "active"
            );

        }


        setTimeout(
            function () {

                map.invalidateSize();

            },
            200
        );

    }
);
