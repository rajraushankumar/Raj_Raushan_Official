import os
import hmac
import secrets
import sqlite3

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

load_dotenv(dotenv_path=".env", override=True)

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

    connection.row_factory = sqlite3.Row

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
            ADD COLUMN estimated_value REAL DEFAULT 0
            """
        )

    if "notes" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN notes TEXT DEFAULT ''
            """
        )

    if "updated_at" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN updated_at TEXT
            """
        )

    connection.commit()
    connection.close()


ensure_schema()


# ============================================================
# APP SECURITY
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
# LOGIN
# ============================================================

@monetization_admin_bp.route(
    "/monetization-login",
    methods=["GET", "POST"],
)
def monetization_login():

    if logged_in():

        return redirect(
            url_for(
                "monetization_admin.monetization_dashboard"
            )
        )

    error = None

    if request.method == "POST":

        supplied = request.form.get(
            "password",
            ""
        ).strip()

        expected = os.getenv(
            "MONETIZATION_ADMIN_PASSWORD",
            ""
        ).strip()

        if (
            expected
            and
            hmac.compare_digest(
                supplied,
                expected
            )
        ):

            session.clear()

            session[
                "monetization_admin"
            ] = True

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

        error = "Incorrect admin password."

    return render_template(
        "monetization_login.html",
        error=error,
    )


# ============================================================
# LOGOUT
# ============================================================

@monetization_admin_bp.route(
    "/monetization-logout"
)
def monetization_logout():

    session.clear()

    return redirect(
        url_for(
            "monetization_admin.monetization_login"
        )
    )


# ============================================================
# PRIVATE DASHBOARD
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

    leads = [
        dict(row)
        for row in rows
    ]

    total = len(leads)

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
        float(
            lead["estimated_value"]
            or 0
        )
        for lead in leads
        if lead["status"] not in (
            "closed",
        )
    )

    won_value = sum(
        float(
            lead["estimated_value"]
            or 0
        )
        for lead in leads
        if lead["status"] == "won"
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

    return render_template(
        "monetization_dashboard.html",

        leads=leads,

        total=total,

        new_count=new_count,

        contacted_count=contacted_count,

        negotiating_count=negotiating_count,

        won_count=won_count,

        potential_value=potential_value,

        won_value=won_value,

        top_services=[
            dict(row)
            for row in service_rows
        ],

        csrf_token=session.get(
            "monetization_csrf",
            ""
        ),
    )


# ============================================================
# UPDATE LEAD
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/lead/<int:lead_id>",
    methods=["POST"],
)
def update_lead(lead_id):

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

    lead = connection.execute(
        """
        SELECT id
        FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    ).fetchone()

    if not lead:

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
