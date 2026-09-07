document.addEventListener(
    "DOMContentLoaded",
    function () {

        const csrf =
            document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || "";


        document
            .querySelectorAll(
                ".lead-card"
            )
            .forEach(
                function (card) {

                    const generate =
                        card.querySelector(
                            ".generate-proposal"
                        );


                    const copy =
                        card.querySelector(
                            ".copy-proposal"
                        );


                    const printButton =
                        card.querySelector(
                            ".print-proposal"
                        );


                    const sentButton =
                        card.querySelector(
                            ".mark-proposal-sent"
                        );


                    const textarea =
                        card.querySelector(
                            ".proposal-text"
                        );


                    const quote =
                        card.querySelector(
                            ".proposal-quote"
                        );


                    const timeline =
                        card.querySelector(
                            ".proposal-timeline"
                        );


                    const deliverables =
                        card.querySelector(
                            ".proposal-deliverables"
                        );


                    const status =
                        card.querySelector(
                            ".proposal-status"
                        );


                    if (!generate) {
                        return;
                    }


                    let proposalData =
                        null;


                    function formatMoney(
                        value
                    ) {

                        return (
                            "₹"
                            +
                            Number(
                                value || 0
                            ).toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits:
                                        0
                                }
                            )
                        );

                    }


                    generate.addEventListener(
                        "click",
                        async function () {

                            const leadId =
                                card.dataset.leadId;


                            generate.disabled =
                                true;


                            generate.textContent =
                                "Generating...";


                            status.textContent =
                                "";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/proposal/${leadId}`,
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
                                                "{}"
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
                                        "Unable to generate proposal."
                                    );

                                }


                                proposalData =
                                    data;


                                textarea.value =
                                    data.proposal;


                                quote.textContent =
                                    formatMoney(
                                        data.suggested_quote
                                    );


                                timeline.textContent =
                                    data.timeline
                                    || "-";


                                deliverables.innerHTML =
                                    "<strong>Recommended Deliverables</strong>"
                                    +
                                    data.deliverables
                                    .map(
                                        function (item) {

                                            return (
                                                "• "
                                                +
                                                item
                                                +
                                                "<br>"
                                            );

                                        }
                                    )
                                    .join("");


                                deliverables.classList.add(
                                    "active"
                                );


                                copy.disabled =
                                    false;


                                printButton.disabled =
                                    false;


                                sentButton.disabled =
                                    false;


                                status.style.color =
                                    "#137a47";


                                status.textContent =
                                    "Proposal generated successfully.";


                            } catch (error) {

                                status.style.color =
                                    "#c33131";


                                status.textContent =
                                    error.message;


                            } finally {

                                generate.disabled =
                                    false;


                                generate.textContent =
                                    "Generate Proposal";

                            }

                        }
                    );


                    copy.addEventListener(
                        "click",
                        async function () {

                            if (!textarea.value) {
                                return;
                            }


                            try {

                                await navigator
                                    .clipboard
                                    .writeText(
                                        textarea.value
                                    );


                                status.style.color =
                                    "#137a47";


                                status.textContent =
                                    "Proposal copied to clipboard.";


                            } catch (error) {

                                textarea.select();

                                document.execCommand(
                                    "copy"
                                );


                                status.textContent =
                                    "Proposal copied.";

                            }

                        }
                    );


                    printButton.addEventListener(
                        "click",
                        function () {

                            if (
                                !proposalData
                                ||
                                !textarea.value
                            ) {
                                return;
                            }


                            const popup =
                                window.open(
                                    "",
                                    "_blank",
                                    "width=900,height=900"
                                );


                            if (!popup) {

                                status.style.color =
                                    "#c33131";


                                status.textContent =
                                    "Please allow pop-ups to print the proposal.";

                                return;
                            }


                            const safeText =
                                textarea.value
                                .replaceAll(
                                    "&",
                                    "&amp;"
                                )
                                .replaceAll(
                                    "<",
                                    "&lt;"
                                )
                                .replaceAll(
                                    ">",
                                    "&gt;"
                                );


                            popup.document.write(
                                `
                                <!DOCTYPE html>

                                <html>

                                <head>

                                    <title>
                                        Collaboration Proposal
                                    </title>

                                    <style>

                                        body {
                                            font-family:
                                                Arial,
                                                sans-serif;

                                            max-width:
                                                800px;

                                            margin:
                                                50px auto;

                                            padding:
                                                30px;

                                            color:
                                                #101827;
                                        }

                                        .brand {
                                            margin-bottom:
                                                35px;

                                            font-size:
                                                22px;

                                            font-weight:
                                                800;
                                        }

                                        pre {
                                            white-space:
                                                pre-wrap;

                                            font-family:
                                                Arial,
                                                sans-serif;

                                            line-height:
                                                1.7;

                                            font-size:
                                                14px;
                                        }

                                        .footer {
                                            margin-top:
                                                40px;

                                            padding-top:
                                                18px;

                                            border-top:
                                                1px solid #ddd;

                                            color:
                                                #667085;

                                            font-size:
                                                11px;
                                        }

                                    </style>

                                </head>

                                <body>

                                    <div class="brand">
                                        Raj Raushan Official
                                    </div>

                                    <pre>${safeText}</pre>

                                    <div class="footer">
                                        Collaboration Proposal / Estimate
                                    </div>

                                </body>

                                </html>
                                `
                            );


                            popup.document.close();


                            setTimeout(
                                function () {

                                    popup.focus();

                                    popup.print();

                                },
                                300
                            );

                        }
                    );


                    sentButton.addEventListener(
                        "click",
                        async function () {

                            if (!proposalData) {
                                return;
                            }


                            const confirmed =
                                window.confirm(
                                    "Mark this proposal as sent?\n\nThe lead will move to Negotiating."
                                );


                            if (!confirmed) {
                                return;
                            }


                            sentButton.disabled =
                                true;


                            sentButton.textContent =
                                "Saving...";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/proposal/${card.dataset.leadId}/sent`,
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
                                                        proposal_value:
                                                            proposalData
                                                            .suggested_quote
                                                    }
                                                )
                                        }
                                    );


                                const data =
                                    await response.json();


                                if (!response.ok) {

                                    throw new Error(
                                        data.status
                                        ||
                                        "Unable to update proposal status."
                                    );

                                }


                                status.style.color =
                                    "#137a47";


                                status.textContent =
                                    "Proposal marked as sent. Lead moved to Negotiating.";


                                setTimeout(
                                    function () {

                                        window.location.reload();

                                    },
                                    650
                                );


                            } catch (error) {

                                sentButton.disabled =
                                    false;


                                sentButton.textContent =
                                    "Mark Proposal Sent";


                                status.style.color =
                                    "#c33131";


                                status.textContent =
                                    error.message;

                            }

                        }
                    );

                }
            );

    }
);
