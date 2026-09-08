document.addEventListener(
    "DOMContentLoaded",
    function () {

        const csrf =
            document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || "";


        function money(
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


        /* ==================================================
           GLOBAL EARNINGS SUMMARY
        ================================================== */

        async function loadSummary() {

            try {

                const response =
                    await fetch(
                        "/api/monetization/earnings-summary"
                    );


                if (!response.ok) {
                    return;
                }


                const data =
                    await response.json();


                const total =
                    document.getElementById(
                        "rrTotalReceived"
                    );


                const month =
                    document.getElementById(
                        "rrMonthReceived"
                    );


                const pending =
                    document.getElementById(
                        "rrPendingBalance"
                    );


                const fullyPaid =
                    document.getElementById(
                        "rrFullyPaid"
                    );


                if (total) {

                    total.textContent =
                        money(
                            data.total_received
                        );

                }


                if (month) {

                    month.textContent =
                        money(
                            data.this_month_received
                        );

                }


                if (pending) {

                    pending.textContent =
                        money(
                            data.pending_balance
                        );

                }


                if (fullyPaid) {

                    fullyPaid.textContent =
                        data.fully_paid_deals
                        || 0;

                }


            } catch (error) {

                console.error(
                    "Earnings summary error:",
                    error
                );

            }

        }


        /* ==================================================
           EACH LEAD PAYMENT TRACKER
        ================================================== */

        document
            .querySelectorAll(
                ".lead-card"
            )
            .forEach(
                function (card) {

                    const leadId =
                        card.dataset.leadId;


                    const box =
                        card.querySelector(
                            ".lead-payment-box"
                        );


                    if (!box) {
                        return;
                    }


                    const target =
                        box.querySelector(
                            ".payment-target"
                        );


                    const received =
                        box.querySelector(
                            ".payment-received"
                        );


                    const outstanding =
                        box.querySelector(
                            ".payment-outstanding"
                        );


                    const badge =
                        box.querySelector(
                            ".payment-status-badge"
                        );


                    const amount =
                        box.querySelector(
                            ".payment-amount"
                        );


                    const method =
                        box.querySelector(
                            ".payment-method"
                        );


                    const date =
                        box.querySelector(
                            ".payment-date"
                        );


                    const reference =
                        box.querySelector(
                            ".payment-reference"
                        );


                    const notes =
                        box.querySelector(
                            ".payment-notes"
                        );


                    const addButton =
                        box.querySelector(
                            ".add-payment"
                        );


                    const message =
                        box.querySelector(
                            ".payment-message"
                        );


                    const history =
                        box.querySelector(
                            ".payment-history-list"
                        );


                    if (date && !date.value) {

                        const today =
                            new Date();


                        const localDate =
                            today.getFullYear()
                            + "-"
                            + String(
                                today.getMonth() + 1
                            ).padStart(
                                2,
                                "0"
                            )
                            + "-"
                            + String(
                                today.getDate()
                            ).padStart(
                                2,
                                "0"
                            );


                        date.value =
                            localDate;

                    }


                    function updateBadge(
                        paymentStatus
                    ) {

                        badge.classList.remove(
                            "payment-unpaid",
                            "payment-partial",
                            "payment-paid"
                        );


                        badge.classList.add(
                            "payment-"
                            +
                            paymentStatus
                        );


                        badge.textContent =
                            paymentStatus
                            .toUpperCase();

                    }


                    async function loadPayments() {

                        try {

                            const response =
                                await fetch(
                                    `/api/monetization/payments/${leadId}`
                                );


                            if (!response.ok) {
                                return;
                            }


                            const data =
                                await response.json();


                            target.textContent =
                                money(
                                    data.target_value
                                );


                            received.textContent =
                                money(
                                    data.received
                                );


                            outstanding.textContent =
                                money(
                                    data.outstanding
                                );


                            updateBadge(
                                data.payment_status
                            );


                            const payments =
                                data.payments
                                || [];


                            if (!payments.length) {

                                history.innerHTML =
                                    "No payments recorded.";

                                return;

                            }


                            history.innerHTML =
                                payments
                                .map(
                                    function (item) {

                                        const metaParts =
                                            [];


                                        if (item.method) {

                                            metaParts.push(
                                                item.method
                                            );

                                        }


                                        if (item.reference) {

                                            metaParts.push(
                                                "Ref: "
                                                +
                                                item.reference
                                            );

                                        }


                                        return `
                                            <div
                                                class="payment-history-item"
                                            >

                                                <div>

                                                    <strong>
                                                        ${money(item.amount)}
                                                    </strong>

                                                    <div
                                                        class="payment-history-meta"
                                                    >
                                                        ${item.paid_at}
                                                        ${
                                                            metaParts.length
                                                            ? " • " + metaParts.join(" • ")
                                                            : ""
                                                        }
                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    class="delete-payment"
                                                    data-payment-id="${item.id}"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        `;

                                    }
                                )
                                .join("");


                        } catch (error) {

                            console.error(
                                "Payment data error:",
                                error
                            );

                        }

                    }


                    /* ADD PAYMENT */

                    addButton.addEventListener(
                        "click",
                        async function () {

                            const paymentAmount =
                                Number(
                                    amount.value
                                    || 0
                                );


                            if (
                                paymentAmount <= 0
                            ) {

                                message.style.color =
                                    "#b54708";


                                message.textContent =
                                    "Enter a payment amount.";

                                amount.focus();

                                return;

                            }


                            addButton.disabled =
                                true;


                            addButton.textContent =
                                "Recording...";


                            message.textContent =
                                "";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/payments/${leadId}`,
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
                                                        amount:
                                                            paymentAmount,

                                                        method:
                                                            method.value,

                                                        paid_at:
                                                            date.value,

                                                        reference:
                                                            reference.value
                                                            .trim(),

                                                        notes:
                                                            notes.value
                                                            .trim()
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
                                        "Unable to record payment."
                                    );

                                }


                                message.style.color =
                                    "#137a47";


                                message.textContent =
                                    "Payment recorded successfully.";


                                amount.value =
                                    "";


                                reference.value =
                                    "";


                                notes.value =
                                    "";


                                await loadPayments();

                                await loadSummary();


                                setTimeout(
                                    function () {

                                        window.location.reload();

                                    },
                                    650
                                );


                            } catch (error) {

                                message.style.color =
                                    "#c33131";


                                message.textContent =
                                    error.message;


                            } finally {

                                addButton.disabled =
                                    false;


                                addButton.textContent =
                                    "Record Payment";

                            }

                        }
                    );


                    /* DELETE PAYMENT */

                    history.addEventListener(
                        "click",
                        async function (event) {

                            const button =
                                event.target.closest(
                                    ".delete-payment"
                                );


                            if (!button) {
                                return;
                            }


                            const confirmed =
                                window.confirm(
                                    "Delete this payment record?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            const paymentId =
                                button.dataset
                                .paymentId;


                            button.disabled =
                                true;


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/payment/${paymentId}/delete`,
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


                                if (!response.ok) {

                                    throw new Error(
                                        "Unable to delete payment."
                                    );

                                }


                                await loadPayments();

                                await loadSummary();


                            } catch (error) {

                                message.style.color =
                                    "#c33131";


                                message.textContent =
                                    error.message;

                            }

                        }
                    );


                    loadPayments();

                }
            );


        loadSummary();

    }
);
