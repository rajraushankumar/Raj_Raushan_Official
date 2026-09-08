document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById(
                "rrBusinessNotificationBell"
            )
        ) {
            return;
        }


        /* ==================================================
           CREATE BELL
        ================================================== */

        const bell =
            document.createElement(
                "button"
            );


        bell.type =
            "button";


        bell.id =
            "rrBusinessNotificationBell";


        bell.className =
            "rr-business-bell";


        bell.setAttribute(
            "aria-label",
            "Open business notifications"
        );


        bell.innerHTML = `
            <span>
                &#128276;
            </span>

            <span
                class="rr-business-badge"
                id="rrBusinessBadge"
            >
                0
            </span>
        `;


        /* ==================================================
           CREATE PANEL
        ================================================== */

        const panel =
            document.createElement(
                "section"
            );


        panel.id =
            "rrBusinessNotificationPanel";


        panel.className =
            "rr-notification-panel";


        panel.innerHTML = `
            <div
                class="rr-notification-header"
            >

                <div>

                    <span>
                        CREATOR BUSINESS
                    </span>

                    <strong>
                        What Needs Attention
                    </strong>

                </div>


                <button
                    type="button"
                    class="rr-refresh-notifications"
                >
                    Refresh
                </button>

            </div>


            <div
                class="rr-notification-summary"
                id="rrNotificationSummary"
            ></div>


            <div
                class="rr-notification-list"
                id="rrNotificationList"
            >

                <div
                    class="rr-notification-empty"
                >

                    <strong>
                        Checking business activity...
                    </strong>

                </div>

            </div>


            <div
                class="rr-notification-footer"
                id="rrNotificationFooter"
            >
                Creator notification center
            </div>
        `;


        document.body.appendChild(
            bell
        );


        document.body.appendChild(
            panel
        );


        const badge =
            document.getElementById(
                "rrBusinessBadge"
            );


        const list =
            document.getElementById(
                "rrNotificationList"
            );


        const summary =
            document.getElementById(
                "rrNotificationSummary"
            );


        const footer =
            document.getElementById(
                "rrNotificationFooter"
            );


        const refresh =
            panel.querySelector(
                ".rr-refresh-notifications"
            );


        /* ==================================================
           SAFE HTML
        ================================================== */

        function escapeHtml(
            value
        ) {

            return String(
                value || ""
            )
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
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

        }


        /* ==================================================
           LOAD NOTIFICATIONS
        ================================================== */

        async function loadNotifications() {

            try {

                const response =
                    await fetch(
                        "/api/monetization/notifications",
                        {
                            cache:
                                "no-store"
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to load notifications."
                    );

                }


                const data =
                    await response.json();


                const notifications =
                    data.notifications
                    || [];


                const counts =
                    data.counts
                    || {};


                /* BADGE */

                const total =
                    Number(
                        counts.total
                        || 0
                    );


                badge.textContent =
                    total > 99
                    ? "99+"
                    : String(
                        total
                    );


                badge.classList.toggle(
                    "active",
                    total > 0
                );


                /* SUMMARY */

                summary.innerHTML = `
                    <span
                        class="rr-summary-total"
                    >
                        ${total} Total
                    </span>

                    <span
                        class="rr-summary-high"
                    >
                        ${Number(counts.high || 0)}
                        High
                    </span>

                    <span
                        class="rr-summary-medium"
                    >
                        ${Number(counts.medium || 0)}
                        Medium
                    </span>
                `;


                /* EMPTY */

                if (
                    notifications.length
                    === 0
                ) {

                    list.innerHTML = `
                        <div
                            class="rr-notification-empty"
                        >

                            <strong>
                                All caught up
                            </strong>

                            <span>
                                No business action
                                needs attention right now.
                            </span>

                        </div>
                    `;

                } else {

                    list.innerHTML =
                        notifications
                        .map(
                            function (item) {

                                return `
                                    <button
                                        type="button"
                                        class="
                                            rr-notification-item
                                            rr-notification-${escapeHtml(item.severity)}
                                        "
                                        data-lead-id="${Number(item.lead_id)}"
                                    >

                                        <span
                                            class="rr-notification-indicator"
                                        ></span>


                                        <span
                                            class="rr-notification-content"
                                        >

                                            <span
                                                class="rr-notification-category"
                                            >
                                                ${escapeHtml(item.category).toUpperCase()}
                                            </span>

                                            <span
                                                class="rr-notification-title"
                                            >
                                                ${escapeHtml(item.title)}
                                            </span>

                                            <span
                                                class="rr-notification-message"
                                            >
                                                ${escapeHtml(item.message)}
                                            </span>

                                            <span
                                                class="rr-notification-action"
                                            >
                                                ${escapeHtml(item.action)}
                                                &#8594;
                                            </span>

                                        </span>

                                    </button>
                                `;

                            }
                        )
                        .join("");

                }


                footer.textContent =
                    "Last checked: "
                    +
                    new Date()
                    .toLocaleTimeString(
                        [],
                        {
                            hour:
                                "2-digit",

                            minute:
                                "2-digit"
                        }
                    );


            } catch (error) {

                list.innerHTML = `
                    <div
                        class="rr-notification-empty"
                    >

                        <strong>
                            Notification check failed
                        </strong>

                        <span>
                            Use Refresh to try again.
                        </span>

                    </div>
                `;


                console.error(
                    "Business notifications:",
                    error
                );

            }

        }


        /* ==================================================
           OPEN / CLOSE
        ================================================== */

        bell.addEventListener(
            "click",
            function () {

                panel.classList.toggle(
                    "active"
                );


                if (
                    panel.classList.contains(
                        "active"
                    )
                ) {

                    loadNotifications();

                }

            }
        );


        refresh.addEventListener(
            "click",
            loadNotifications
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    panel.classList.contains(
                        "active"
                    )
                    &&
                    !panel.contains(
                        event.target
                    )
                    &&
                    !bell.contains(
                        event.target
                    )
                ) {

                    panel.classList.remove(
                        "active"
                    );

                }

            }
        );


        /* ==================================================
           CLICK ALERT -> OPEN LEAD
        ================================================== */

        list.addEventListener(
            "click",
            function (event) {

                const item =
                    event.target.closest(
                        ".rr-notification-item"
                    );


                if (!item) {
                    return;
                }


                const leadId =
                    item.dataset.leadId;


                const filter =
                    document.getElementById(
                        "statusFilter"
                    );


                const search =
                    document.getElementById(
                        "leadSearch"
                    );


                if (filter) {

                    filter.value =
                        "all";


                    filter.dispatchEvent(
                        new Event(
                            "change"
                        )
                    );

                }


                if (search) {

                    search.value =
                        "";


                    search.dispatchEvent(
                        new Event(
                            "input"
                        )
                    );

                }


                const lead =
                    document.querySelector(
                        `.lead-card[data-lead-id="${leadId}"]`
                    );


                if (!lead) {
                    return;
                }


                lead.hidden =
                    false;


                lead.style.removeProperty(
                    "display"
                );


                panel.classList.remove(
                    "active"
                );


                lead.scrollIntoView(
                    {
                        behavior:
                            "smooth",

                        block:
                            "center"
                    }
                );


                lead.classList.remove(
                    "rr-lead-attention"
                );


                void lead.offsetWidth;


                lead.classList.add(
                    "rr-lead-attention"
                );

            }
        );


        /* ==================================================
           AUTO REFRESH
           Only while dashboard tab is open.
        ================================================== */

        loadNotifications();


        window.setInterval(
            function () {

                if (
                    document.visibilityState
                    === "visible"
                ) {

                    loadNotifications();

                }

            },
            60000
        );

    }
);
