document.addEventListener(
    "DOMContentLoaded",
    function () {

        const csrf =
            document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || "";


        const leadList =
            document.getElementById(
                "leadList"
            );


        const search =
            document.getElementById(
                "leadSearch"
            );


        const filter =
            document.getElementById(
                "statusFilter"
            );


        const cards =
            Array.from(
                document.querySelectorAll(
                    ".lead-card"
                )
            );


        /* ==================================================
           EMPTY STATE
        ================================================== */

        let emptyMessage =
            document.getElementById(
                "leadFilterEmpty"
            );


        if (
            !emptyMessage
            &&
            leadList
        ) {

            emptyMessage =
                document.createElement(
                    "div"
                );


            emptyMessage.id =
                "leadFilterEmpty";


            emptyMessage.innerHTML = `
                <strong>
                    No leads found.
                </strong>

                <div style="
                    margin-top:7px;
                    font-size:12px;
                ">
                    Change the filter to
                    All Status.
                </div>
            `;


            emptyMessage.style.display =
                "none";


            leadList.appendChild(
                emptyMessage
            );

        }


        /* ==================================================
           FILTER
        ================================================== */

        function filterLeads() {

            const query =
                search
                ? search.value
                    .trim()
                    .toLowerCase()
                : "";


            const selected =
                filter
                ? filter.value
                    .trim()
                    .toLowerCase()
                : "all";


            let visible =
                0;


            cards.forEach(
                function (card) {

                    const searchText =
                        (
                            card.dataset.search
                            || ""
                        ).toLowerCase();


                    const status =
                        (
                            card.dataset.status
                            || ""
                        )
                        .trim()
                        .toLowerCase();


                    const searchMatch =
                        !query
                        ||
                        searchText.includes(
                            query
                        );


                    const statusMatch =
                        selected === "all"
                        ||
                        selected === status;


                    if (
                        searchMatch
                        &&
                        statusMatch
                    ) {

                        card.hidden =
                            false;


                        card.style.removeProperty(
                            "display"
                        );


                        visible += 1;

                    } else {

                        card.hidden =
                            true;


                        card.style.display =
                            "none";

                    }

                }
            );


            if (emptyMessage) {

                emptyMessage.style.display =
                    visible === 0
                    ? "block"
                    : "none";

            }

        }


        function resetFilters() {

            if (filter) {

                filter.value =
                    "all";

            }


            if (search) {

                search.value =
                    "";

            }


            filterLeads();

        }


        resetFilters();


        search?.addEventListener(
            "input",
            filterLeads
        );


        filter?.addEventListener(
            "change",
            filterLeads
        );


        window.addEventListener(
            "pageshow",
            resetFilters
        );


        /* ==================================================
           HELPERS
        ================================================== */

        function getCardValues(
            card
        ) {

            const status =
                card.querySelector(
                    ".lead-status"
                );


            const value =
                card.querySelector(
                    ".lead-value"
                );


            const notes =
                card.querySelector(
                    ".lead-notes"
                );


            return {

                status:
                    status
                    ? status.value
                    : "new",

                value:
                    value
                    ? value.value
                    : 0,

                notes:
                    notes
                    ? notes.value
                    : ""

            };

        }


        /* ==================================================
           SAVE API
        ================================================== */

        async function saveLead(
            card,
            newStatus,
            sourceButton
        ) {

            const leadId =
                card.dataset.leadId;


            const values =
                getCardValues(
                    card
                );


            const statusSelect =
                card.querySelector(
                    ".lead-status"
                );


            const valueInput =
                card.querySelector(
                    ".lead-value"
                );


            const normalStatus =
                card.querySelector(
                    ".save-status"
                );


            const quickStatus =
                card.querySelector(
                    ".pro-action-status"
                );


            const message =
                quickStatus
                ||
                normalStatus;


            let finalStatus =
                newStatus
                ||
                values.status;


            let finalValue =
                Number(
                    values.value
                    ||
                    0
                );


            /* WON requires actual deal value */

            if (
                finalStatus === "won"
                &&
                finalValue <= 0
            ) {

                if (valueInput) {

                    valueInput.focus();

                }


                if (message) {

                    message.style.color =
                        "#b54708";


                    message.textContent =
                        "Enter the actual deal value before marking this lead Won.";

                }


                return;

            }


            if (sourceButton) {

                sourceButton.disabled =
                    true;

            }


            if (message) {

                message.style.color =
                    "#667085";


                message.textContent =
                    "Saving...";

            }


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
                                            finalStatus,

                                        estimated_value:
                                            finalValue,

                                        notes:
                                            values.notes
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
                        data.status
                        ||
                        "Unable to save lead."
                    );

                }


                card.dataset.status =
                    finalStatus;


                if (statusSelect) {

                    statusSelect.value =
                        finalStatus;

                }


                if (message) {

                    message.style.color =
                        "#137a47";


                    message.textContent =
                        "Lead updated successfully.";

                }


                setTimeout(
                    function () {

                        window.location.reload();

                    },
                    450
                );


            } catch (error) {

                if (sourceButton) {

                    sourceButton.disabled =
                        false;

                }


                if (message) {

                    message.style.color =
                        "#c33131";


                    message.textContent =
                        error.message;

                }

            }

        }


        /* ==================================================
           NORMAL SAVE BUTTON
        ================================================== */

        document
            .querySelectorAll(
                ".save-lead"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const card =
                                button.closest(
                                    ".lead-card"
                                );


                            if (!card) {
                                return;
                            }


                            saveLead(
                                card,
                                null,
                                button
                            );

                        }
                    );

                }
            );


        /* ==================================================
           QUICK STATUS BUTTONS
        ================================================== */

        document
            .querySelectorAll(
                ".quick-status"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const card =
                                button.closest(
                                    ".lead-card"
                                );


                            if (!card) {
                                return;
                            }


                            const status =
                                button.dataset
                                .quickStatus;


                            saveLead(
                                card,
                                status,
                                button
                            );

                        }
                    );

                }
            );


        /* ==================================================
           DELETE LEAD
        ================================================== */

        document
            .querySelectorAll(
                ".delete-lead"
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


                            if (!card) {
                                return;
                            }


                            const leadId =
                                card.dataset.leadId;


                            const leadName =
                                card.dataset.leadName
                                ||
                                "this lead";


                            const confirmed =
                                window.confirm(
                                    `Delete ${leadName}?\n\nThis permanently removes this enquiry from the local dashboard.`
                                );


                            if (!confirmed) {
                                return;
                            }


                            button.disabled =
                                true;


                            button.textContent =
                                "Deleting...";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/lead/${leadId}/delete`,
                                        {
                                            method:
                                                "POST",

                                            headers:
                                                {
                                                    "X-CSRF-Token":
                                                        csrf
                                                }
                                        }
                                    );


                                const data =
                                    await response.json();


                                if (!response.ok) {

                                    throw new Error(
                                        data.status
                                        ||
                                        "Unable to delete lead."
                                    );

                                }


                                card.remove();


                                setTimeout(
                                    function () {

                                        window.location.reload();

                                    },
                                    250
                                );


                            } catch (error) {

                                button.disabled =
                                    false;


                                button.textContent =
                                    "Delete Lead";


                                const message =
                                    card.querySelector(
                                        ".pro-action-status"
                                    );


                                if (message) {

                                    message.style.color =
                                        "#c33131";


                                    message.textContent =
                                        error.message;

                                }

                            }

                        }
                    );

                }
            );

    }
);
