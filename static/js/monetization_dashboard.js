document.addEventListener(
    "DOMContentLoaded",
    function () {

        const csrf =
            document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || "";

        const cards =
            Array.from(
                document.querySelectorAll(
                    ".lead-card"
                )
            );

        const search =
            document.getElementById(
                "leadSearch"
            );

        const filter =
            document.getElementById(
                "statusFilter"
            );


        function updateFilter() {

            const query =
                search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";

            const status =
                filter
                ? filter.value
                : "all";

            cards.forEach(
                function (card) {

                    const matchesSearch =
                        !query
                        ||
                        (
                            card.dataset.search
                            || ""
                        ).includes(
                            query
                        );

                    const matchesStatus =
                        status === "all"
                        ||
                        card.dataset.status
                        === status;

                    card.style.display =
                        (
                            matchesSearch
                            &&
                            matchesStatus
                        )
                        ? "block"
                        : "none";
                }
            );
        }


        search?.addEventListener(
            "input",
            updateFilter
        );

        filter?.addEventListener(
            "change",
            updateFilter
        );


        document
            .querySelectorAll(
                ".save-lead"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            const card =
                                button.closest(
                                    ".lead-card"
                                );

                            const leadId =
                                card.dataset.leadId;

                            const status =
                                card.querySelector(
                                    ".lead-status"
                                ).value;

                            const value =
                                card.querySelector(
                                    ".lead-value"
                                ).value;

                            const notes =
                                card.querySelector(
                                    ".lead-notes"
                                ).value;

                            const message =
                                card.querySelector(
                                    ".save-status"
                                );


                            button.disabled = true;

                            button.textContent =
                                "Saving...";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/lead/${leadId}`,
                                        {
                                            method:
                                                "POST",

                                            headers:
                                                {
                                                    "Content-Type":
                                                        "application/json",

                                                    "X-CSRF-Token":
                                                        csrf
                                                },

                                            body:
                                                JSON.stringify(
                                                    {
                                                        status:
                                                            status,

                                                        estimated_value:
                                                            value,

                                                        notes:
                                                            notes
                                                    }
                                                )
                                        }
                                    );

                                const data =
                                    await response.json();

                                if (!response.ok) {

                                    throw new Error(
                                        data.message
                                        ||
                                        "Unable to save."
                                    );
                                }

                                message.style.color =
                                    "#137a47";

                                message.textContent =
                                    "Saved successfully.";

                                setTimeout(
                                    function () {

                                        window.location.reload();

                                    },
                                    500
                                );

                            } catch (error) {

                                message.style.color =
                                    "#c33131";

                                message.textContent =
                                    error.message;

                                button.disabled =
                                    false;

                                button.textContent =
                                    "Save Lead";
                            }

                        }
                    );

                }
            );

    }
);
