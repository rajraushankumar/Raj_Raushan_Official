document.addEventListener(
    "DOMContentLoaded",
    function () {

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


        async function loadRevenueAnalytics() {

            try {

                const response =
                    await fetch(
                        "/api/monetization/revenue-analytics"
                    );


                if (!response.ok) {
                    return;
                }


                const data =
                    await response.json();


                /* STATS */

                const total =
                    document.getElementById(
                        "raTotalRevenue"
                    );


                const count =
                    document.getElementById(
                        "raPaymentCount"
                    );


                const average =
                    document.getElementById(
                        "raAveragePayment"
                    );


                const topService =
                    document.getElementById(
                        "raTopService"
                    );


                if (total) {

                    total.textContent =
                        money(
                            data.total_revenue
                        );

                }


                if (count) {

                    count.textContent =
                        data.payment_count
                        || 0;

                }


                if (average) {

                    average.textContent =
                        money(
                            data.average_payment
                        );

                }


                if (topService) {

                    if (data.top_service) {

                        topService.textContent =
                            data.top_service.service
                            +
                            " · "
                            +
                            money(
                                data.top_service.revenue
                            );

                    } else {

                        topService.textContent =
                            "No data yet";

                    }

                }


                /* MONTHLY CHART */

                const chart =
                    document.getElementById(
                        "raMonthlyChart"
                    );


                const monthly =
                    data.monthly_revenue
                    || [];


                if (chart) {

                    if (!monthly.length) {

                        chart.innerHTML =
                            '<div class="revenue-empty">No payment history yet.</div>';

                    } else {

                        const maximum =
                            Math.max(
                                ...monthly.map(
                                    item =>
                                        Number(
                                            item.revenue
                                            || 0
                                        )
                                ),
                                1
                            );


                        chart.innerHTML =
                            monthly
                            .map(
                                function (item) {

                                    const height =
                                        Math.max(
                                            4,
                                            (
                                                Number(
                                                    item.revenue
                                                    || 0
                                                )
                                                /
                                                maximum
                                            )
                                            *
                                            100
                                        );


                                    return `
                                        <div
                                            class="month-bar-item"
                                        >

                                            <span
                                                class="month-bar-value"
                                            >
                                                ${money(item.revenue)}
                                            </span>

                                            <div
                                                class="month-bar-track"
                                            >

                                                <div
                                                    class="month-bar-fill"
                                                    style="height:${height}%"
                                                ></div>

                                            </div>

                                            <span
                                                class="month-bar-label"
                                            >
                                                ${item.month}
                                            </span>

                                        </div>
                                    `;

                                }
                            )
                            .join("");

                    }

                }


                /* PAYMENT METHODS */

                const methodList =
                    document.getElementById(
                        "raPaymentMethods"
                    );


                const methods =
                    data.payment_methods
                    || [];


                if (methodList) {

                    if (!methods.length) {

                        methodList.innerHTML =
                            '<div class="revenue-empty">No payment data.</div>';

                    } else {

                        methodList.innerHTML =
                            methods
                            .map(
                                function (item) {

                                    return `
                                        <div
                                            class="payment-method-row"
                                        >

                                            <span>
                                                ${item.method}
                                            </span>

                                            <strong>
                                                ${money(item.amount)}
                                            </strong>

                                        </div>
                                    `;

                                }
                            )
                            .join("");

                    }

                }


                /* RECENT PAYMENTS */

                const recent =
                    document.getElementById(
                        "raRecentPayments"
                    );


                const recentPayments =
                    data.recent_payments
                    || [];


                if (recent) {

                    if (!recentPayments.length) {

                        recent.innerHTML =
                            '<div class="revenue-empty">No payments recorded.</div>';

                    } else {

                        recent.innerHTML =
                            recentPayments
                            .map(
                                function (item) {

                                    const client =
                                        item.company
                                        ||
                                        item.name
                                        ||
                                        "Client";


                                    return `
                                        <div
                                            class="recent-payment-row"
                                        >

                                            <strong>
                                                ${client}
                                            </strong>

                                            <span>
                                                ${item.service || "Collaboration"}
                                            </span>

                                            <span>
                                                ${item.paid_at || ""}
                                            </span>

                                            <strong>
                                                ${money(item.amount)}
                                            </strong>

                                        </div>
                                    `;

                                }
                            )
                            .join("");

                    }

                }


            } catch (error) {

                console.error(
                    "Revenue analytics:",
                    error
                );

            }

        }


        loadRevenueAnalytics();

    }
);
