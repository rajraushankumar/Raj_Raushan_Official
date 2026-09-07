import os
import hmac
import secrets
import sqlite3

from datetime import datetime

from dotenv import load_dotenv

from flask import (
    Blueprint,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

load_dotenv(
    dotenv_path=".env",
    override=True,
)


monetization_admin_bp = Blueprint(
    "monetization_admin",
    __name__,
)

DB_PATH = "creator_analytics.db"


# ============================================================
# DATABASE
# ============================================================

def get_connection():

    connection = sqlite3.connect(
        DB_PATH
    )

    connection.row_factory = (
        sqlite3.Row
    )

    return connection


def ensure_schema():

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS brand_enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            service TEXT NOT NULL,
            budget TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            estimated_value REAL DEFAULT 0,
            notes TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        )
        """
    )

    columns = {
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(brand_enquiries)"
        ).fetchall()
    }

    if "estimated_value" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN estimated_value
            REAL DEFAULT 0
            """
        )

    if "notes" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN notes
            TEXT DEFAULT ''
            """
        )

    if "updated_at" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN updated_at
            TEXT
            """
        )

    connection.commit()
    connection.close()


ensure_schema()


# ============================================================
# SESSION SECURITY
# ============================================================

@monetization_admin_bp.record_once
def configure_admin(state):

    secret = os.getenv(
        "FLASK_SECRET_KEY"
    )

    if secret:

        state.app.secret_key = secret


def logged_in():

    return (
        session.get(
            "monetization_admin"
        )
        is True
    )


def valid_csrf():

    provided = request.headers.get(
        "X-CSRF-Token",
        ""
    )

    stored = session.get(
        "monetization_csrf",
        ""
    )

    return (
        bool(provided)
        and
        bool(stored)
        and
        hmac.compare_digest(
            provided,
            stored
        )
    )


# ============================================================
# LOCAL CREATOR ACCESS
# ============================================================

@monetization_admin_bp.route(
    "/monetization-login"
)
def monetization_login():

    # Local development only.
    if request.remote_addr in (
        "127.0.0.1",
        "::1",
    ):

        session[
            "monetization_admin"
        ] = True

        if not session.get(
            "monetization_csrf"
        ):

            session[
                "monetization_csrf"
            ] = secrets.token_urlsafe(
                24
            )

        return redirect(
            url_for(
                "monetization_admin.monetization_dashboard"
            )
        )


    return render_template(
        "monetization_login.html",
        error=(
            "Creator dashboard is available "
            "only from the local creator system."
        ),
    )


@monetization_admin_bp.route(
    "/monetization-logout"
)
def monetization_logout():

    session.clear()

    return redirect("/")


# ============================================================
# AUTO VALUE ESTIMATION
# ============================================================

def estimate_budget_value(
    budget
):

    text = str(
        budget
        or ""
    ).lower()


    if "30,000+" in text:

        return 45000


    if (
        "15,000" in text
        and
        "30,000" in text
    ):

        return 22500


    if (
        "5,000" in text
        and
        "15,000" in text
    ):

        return 10000


    if "under" in text:

        return 3500


    if "discuss" in text:

        return 12000


    return 0


# ============================================================
# LEAD PRIORITY ENGINE
# ============================================================

def calculate_lead_intelligence(
    lead
):

    budget = str(
        lead.get(
            "budget",
            ""
        )
        or ""
    )


    service = str(
        lead.get(
            "service",
            ""
        )
        or ""
    ).lower()


    status = str(
        lead.get(
            "status",
            "new"
        )
        or "new"
    ).lower()


    message = str(
        lead.get(
            "message",
            ""
        )
        or ""
    )


    manual_value = float(
        lead.get(
            "estimated_value",
            0
        )
        or 0
    )


    automatic_value = (
        estimate_budget_value(
            budget
        )
    )


    effective_value = (
        manual_value
        if manual_value > 0
        else automatic_value
    )


    score = 10


    # --------------------------------------------------------
    # BUDGET SCORE
    # --------------------------------------------------------

    budget_lower = (
        budget.lower()
    )


    if "30,000+" in budget_lower:

        score += 40


    elif (
        "15,000" in budget_lower
        and
        "30,000" in budget_lower
    ):

        score += 30


    elif (
        "5,000" in budget_lower
        and
        "15,000" in budget_lower
    ):

        score += 20


    elif "under" in budget_lower:

        score += 10


    elif "discuss" in budget_lower:

        score += 15


    else:

        score += 5


    # --------------------------------------------------------
    # SERVICE SCORE
    # --------------------------------------------------------

    if "custom travel campaign" in service:

        score += 25


    elif "youtube" in service:

        score += 20


    elif (
        "hotel" in service
        or
        "hospitality" in service
    ):

        score += 18


    elif "destination" in service:

        score += 18


    elif "ugc" in service:

        score += 16


    elif "short" in service:

        score += 15


    else:

        score += 10


    # --------------------------------------------------------
    # PIPELINE STATUS
    # --------------------------------------------------------

    if status == "negotiating":

        score += 20


    elif status == "contacted":

        score += 12


    elif status == "new":

        score += 10


    elif status in (
        "won",
        "closed",
    ):

        score = 0


    # --------------------------------------------------------
    # FRESHNESS
    # --------------------------------------------------------

    created_text = str(
        lead.get(
            "created_at",
            ""
        )
        or ""
    )


    try:

        created = datetime.fromisoformat(
            created_text
        )

        age_days = max(
            0,
            (
                datetime.now()
                -
                created
            ).days
        )


        if age_days <= 1:

            score += 15


        elif age_days <= 3:

            score += 10


        elif age_days <= 7:

            score += 5


    except (
        ValueError,
        TypeError,
    ):

        age_days = None


    # --------------------------------------------------------
    # CAMPAIGN DETAIL QUALITY
    # --------------------------------------------------------

    if len(message) >= 200:

        score += 5


    score = min(
        100,
        max(
            0,
            score
        )
    )


    # --------------------------------------------------------
    # PRIORITY LABEL
    # --------------------------------------------------------

    if status in (
        "won",
        "closed",
    ):

        priority = "complete"


    elif score >= 70:

        priority = "high"


    elif score >= 45:

        priority = "medium"


    else:

        priority = "low"


    # --------------------------------------------------------
    # NEXT ACTION
    # --------------------------------------------------------

    if status == "negotiating":

        action = (
            "Follow up and close the deal"
        )


    elif status == "contacted":

        action = (
            "Send a follow-up message"
        )


    elif (
        status == "new"
        and
        score >= 70
    ):

        action = (
            "Contact this lead first"
        )


    elif status == "new":

        action = (
            "Send the first response"
        )


    elif status == "won":

        action = (
            "Prepare campaign delivery"
        )


    else:

        action = (
            "No immediate action"
        )


    return {
        "priority_score":
            score,

        "priority_label":
            priority,

        "recommended_action":
            action,

        "effective_value":
            effective_value,

        "auto_estimated":
            (
                manual_value <= 0
                and
                automatic_value > 0
            ),

        "age_days":
            age_days,
    }


# ============================================================
# BUILD DASHBOARD DATA
# ============================================================

def build_dashboard_data():

    connection = get_connection()


    rows = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            company,
            service,
            budget,
            message,
            status,
            estimated_value,
            notes,
            created_at,
            updated_at
        FROM brand_enquiries
        ORDER BY id DESC
        """
    ).fetchall()


    leads = []


    for row in rows:

        lead = dict(row)

        intelligence = (
            calculate_lead_intelligence(
                lead
            )
        )

        lead.update(
            intelligence
        )

        leads.append(
            lead
        )


    service_rows = connection.execute(
        """
        SELECT
            service,
            COUNT(*) AS enquiries
        FROM brand_enquiries
        GROUP BY service
        ORDER BY enquiries DESC
        LIMIT 5
        """
    ).fetchall()


    connection.close()


    total = len(
        leads
    )


    new_count = sum(
        1
        for lead in leads
        if lead["status"] == "new"
    )


    contacted_count = sum(
        1
        for lead in leads
        if lead["status"] == "contacted"
    )


    negotiating_count = sum(
        1
        for lead in leads
        if lead["status"] == "negotiating"
    )


    won_count = sum(
        1
        for lead in leads
        if lead["status"] == "won"
    )


    potential_value = sum(
        lead["effective_value"]
        for lead in leads
        if lead["status"]
        not in (
            "won",
            "closed",
        )
    )


    won_value = sum(
        lead["effective_value"]
        for lead in leads
        if lead["status"]
        == "won"
    )


    auto_estimated_count = sum(
        1
        for lead in leads
        if lead["auto_estimated"]
    )


    open_leads = [
        lead
        for lead in leads
        if lead["status"]
        not in (
            "won",
            "closed",
        )
    ]


    follow_up_lead = None


    if open_leads:

        follow_up_lead = max(
            open_leads,
            key=lambda item:
                item[
                    "priority_score"
                ],
        )


    return {
        "leads":
            leads,

        "total":
            total,

        "new_count":
            new_count,

        "contacted_count":
            contacted_count,

        "negotiating_count":
            negotiating_count,

        "won_count":
            won_count,

        "potential_value":
            potential_value,

        "won_value":
            won_value,

        "auto_estimated_count":
            auto_estimated_count,

        "follow_up_lead":
            follow_up_lead,

        "top_services":
            [
                dict(row)
                for row
                in service_rows
            ],
    }


# ============================================================
# DASHBOARD
# ============================================================

@monetization_admin_bp.route(
    "/monetization-dashboard"
)
def monetization_dashboard():

    if not logged_in():

        return redirect(
            url_for(
                "monetization_admin.monetization_login"
            )
        )


    data = (
        build_dashboard_data()
    )


    return render_template(
        "monetization_dashboard.html",

        **data,

        csrf_token=session.get(
            "monetization_csrf",
            ""
        ),
    )


# ============================================================
# PRIVATE INTELLIGENCE API
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/intelligence"
)
def monetization_intelligence_api():

    if not logged_in():

        return jsonify(
            {
                "status":
                    "unauthorized"
            }
        ), 401


    data = (
        build_dashboard_data()
    )


    follow_up = (
        data[
            "follow_up_lead"
        ]
    )


    follow_up_data = None


    if follow_up:

        follow_up_data = {
            "id":
                follow_up["id"],

            "name":
                follow_up["name"],

            "company":
                follow_up["company"],

            "service":
                follow_up["service"],

            "priority_score":
                follow_up[
                    "priority_score"
                ],

            "recommended_action":
                follow_up[
                    "recommended_action"
                ],

            "estimated_value":
                follow_up[
                    "effective_value"
                ],
        }


    return jsonify(
        {
            "status":
                "success",

            "potential_pipeline":
                data[
                    "potential_value"
                ],

            "won_value":
                data[
                    "won_value"
                ],

            "auto_estimated_leads":
                data[
                    "auto_estimated_count"
                ],

            "follow_up_first":
                follow_up_data,
        }
    )


# ============================================================
# UPDATE LEAD
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/lead/<int:lead_id>",
    methods=["POST"],
)
def update_lead(
    lead_id
):

    if not logged_in():

        return jsonify(
            {
                "status":
                    "unauthorized"
            }
        ), 401


    if not valid_csrf():

        return jsonify(
            {
                "status":
                    "invalid_csrf"
            }
        ), 403


    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    allowed = {
        "new",
        "contacted",
        "negotiating",
        "won",
        "closed",
    }


    status = str(
        data.get(
            "status",
            "new"
        )
    ).strip().lower()


    if status not in allowed:

        return jsonify(
            {
                "status":
                    "error",

                "message":
                    "Invalid status."
            }
        ), 400


    try:

        value = max(
            0,
            float(
                data.get(
                    "estimated_value",
                    0
                )
                or 0
            )
        )

    except (
        ValueError,
        TypeError,
    ):

        value = 0


    notes = str(
        data.get(
            "notes",
            ""
        )
    ).strip()[:2000]


    connection = get_connection()


    exists = connection.execute(
        """
        SELECT id
        FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    ).fetchone()


    if not exists:

        connection.close()

        return jsonify(
            {
                "status":
                    "not_found"
            }
        ), 404


    connection.execute(
        """
        UPDATE brand_enquiries

        SET
            status = ?,
            estimated_value = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        """,
        (
            status,
            value,
            notes,
            lead_id,
        )
    )


    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "success"
        }
    )
