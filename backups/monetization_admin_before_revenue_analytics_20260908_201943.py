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
# SMART BRAND REPLY ASSISTANT
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/reply/<int:lead_id>",
    methods=["POST"],
)
def generate_brand_reply(
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


    tone = str(
        data.get(
            "tone",
            "professional"
        )
    ).strip().lower()


    if tone not in {
        "professional",
        "warm",
        "concise",
    }:

        tone = "professional"


    connection = get_connection()


    row = connection.execute(
        """
        SELECT
            name,
            email,
            company,
            service,
            budget,
            message,
            status
        FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    ).fetchone()


    connection.close()


    if not row:

        return jsonify(
            {
                "status":
                    "not_found"
            }
        ), 404


    lead = dict(
        row
    )


    name = (
        lead.get(
            "name"
        )
        or "there"
    )


    company = str(
        lead.get(
            "company",
            ""
        )
        or ""
    ).strip()


    service = (
        lead.get(
            "service"
        )
        or "collaboration"
    )


    budget = (
        lead.get(
            "budget"
        )
        or ""
    )


    # --------------------------------------------------------
    # DO NOT TREAT CREATOR NAME AS COMPANY
    # --------------------------------------------------------

    personal_names = {
        "rajraushan kumar",
        "raj raushan kumar",
        "rajraushan singh rajput",
        "raj raushan singh rajput",
        "rajraushan official",
        "raj raushan official",
    }


    if company.lower() in personal_names:

        company = ""


    company_phrase = (
        f" for {company}"
        if company
        else ""
    )


    # --------------------------------------------------------
    # OPTIONAL BUDGET LINE
    # --------------------------------------------------------

    budget_line = ""


    if (
        budget
        and
        "prefer not" not in budget.lower()
    ):

        budget_line = (
            "\n\n"
            "I have also noted the indicated "
            f"budget range of {budget}."
        )


    # --------------------------------------------------------
    # CONCISE
    # --------------------------------------------------------

    if tone == "concise":

        reply = (
            f"Hi {name},\n\n"
            "Thank you for reaching out regarding "
            f"{service}{company_phrase}. "
            "I would be happy to discuss the campaign, "
            "deliverables, timeline and pricing."
            f"{budget_line}"
            "\n\n"
            "Please share any additional requirements "
            "or preferred timeline, and we can take "
            "the discussion forward."
            "\n\n"
            "Best regards,\n"
            "Rajraushan Kumar"
        )


    # --------------------------------------------------------
    # WARM
    # --------------------------------------------------------

    elif tone == "warm":

        reply = (
            f"Hi {name},\n\n"
            "Thank you for getting in touch. "
            f"The idea of working together on {service}"
            f"{company_phrase} sounds interesting."
            f"{budget_line}"
            "\n\n"
            "I would be glad to understand the campaign "
            "goals, expected deliverables, timeline and "
            "content requirements in more detail."
            "\n\n"
            "Looking forward to discussing the collaboration."
            "\n\n"
            "Best regards,\n"
            "Rajraushan Kumar"
        )


    # --------------------------------------------------------
    # PROFESSIONAL
    # --------------------------------------------------------

    else:

        reply = (
            f"Hi {name},\n\n"
            "Thank you for your collaboration enquiry "
            f"regarding {service}{company_phrase}."
            "\n\n"
            "I appreciate you sharing the campaign details. "
            "I would be happy to discuss the proposed "
            "deliverables, content format, timeline, "
            "usage requirements and final commercial terms."
            f"{budget_line}"
            "\n\n"
            "Please feel free to share any additional "
            "campaign brief, preferred publishing dates "
            "or specific requirements so that we can "
            "discuss the next steps."
            "\n\n"
            "Best regards,\n"
            "Rajraushan Kumar"
        )


    subject = (
        "Re: "
        + service
        + " Collaboration"
    )


    return jsonify(
        {
            "status":
                "success",

            "subject":
                subject,

            "reply":
                reply,

            "email":
                lead.get(
                    "email",
                    ""
                )
        }
    )





# ============================================================
# DELETE MONETIZATION LEAD
# PRIVATE + CSRF PROTECTED
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/lead/<int:lead_id>/delete",
    methods=["POST"],
)
def delete_monetization_lead(
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


    connection = get_connection()


    lead = connection.execute(
        """
        SELECT
            id,
            name,
            email
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
        DELETE FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    )


    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "lead_id":
                lead_id
        }
    )





# ============================================================
# AUTO PROPOSAL / QUOTATION SYSTEM
# ============================================================

def ensure_proposal_schema():

    connection = get_connection()

    columns = {
        row["name"]
        for row in connection.execute(
            "PRAGMA table_info(brand_enquiries)"
        ).fetchall()
    }


    if "proposal_value" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN proposal_value
            REAL DEFAULT 0
            """
        )


    if "proposal_sent_at" not in columns:

        connection.execute(
            """
            ALTER TABLE brand_enquiries
            ADD COLUMN proposal_sent_at
            TEXT
            """
        )


    connection.commit()
    connection.close()


ensure_proposal_schema()


def recommended_service_quote(
    service,
    budget
):

    service_text = str(
        service
        or ""
    ).lower()


    base_quotes = {
        "destination feature":
            12000,

        "hotel & hospitality feature":
            15000,

        "short form content":
            6000,

        "youtube integration":
            12000,

        "ugc content creation":
            8000,

        "custom travel campaign":
            25000,
    }


    base_value = 10000


    for key, value in (
        base_quotes.items()
    ):

        if key in service_text:

            base_value = value
            break


    try:

        budget_value = (
            estimate_budget_value(
                budget
            )
        )

    except Exception:

        budget_value = 0


    if budget_value > 0:

        return float(
            budget_value
        )


    return float(
        base_value
    )


def proposal_deliverables(
    service
):

    service_text = str(
        service
        or ""
    ).lower()


    if (
        "hotel"
        in service_text
        or
        "hospitality"
        in service_text
    ):

        return [
            "1 dedicated hospitality / stay feature",
            "2 short-form vertical videos",
            "Property and experience highlights",
            "Brand mention and relevant links",
        ]


    if "destination" in service_text:

        return [
            "1 destination-focused travel feature",
            "2 short-form travel videos",
            "Location highlights and storytelling",
            "Brand / tourism mention where relevant",
        ]


    if "youtube" in service_text:

        return [
            "1 YouTube brand integration",
            "Natural product / service mention",
            "Relevant call-to-action",
            "Description link placement where applicable",
        ]


    if "ugc" in service_text:

        return [
            "2 creator-style UGC videos",
            "Vertical social-first format",
            "Brand-focused storytelling",
            "Final edited content delivery",
        ]


    if "short" in service_text:

        return [
            "2 short-form vertical videos",
            "Creator-led concept and presentation",
            "Edited mobile-first format",
            "Brand mention / campaign CTA",
        ]


    if "custom" in service_text:

        return [
            "1 long-form travel feature",
            "3 short-form vertical videos",
            "Destination / brand storytelling",
            "Social campaign integration",
            "Custom campaign call-to-action",
        ]


    return [
        "Creator-led branded content",
        "Campaign-focused storytelling",
        "Edited digital content",
        "Brand mention and call-to-action",
    ]


def proposal_timeline(
    service
):

    service_text = str(
        service
        or ""
    ).lower()


    if "custom" in service_text:

        return "10-15 days after campaign confirmation"


    if (
        "destination" in service_text
        or
        "hotel" in service_text
    ):

        return "7-12 days after shoot / visit"


    return "5-10 days after campaign confirmation"


@monetization_admin_bp.route(
    "/api/monetization/proposal/<int:lead_id>",
    methods=["POST"],
)
def generate_campaign_proposal(
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


    connection = get_connection()


    row = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            company,
            service,
            budget,
            message,
            estimated_value,
            status
        FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    ).fetchone()


    connection.close()


    if not row:

        return jsonify(
            {
                "status":
                    "not_found"
            }
        ), 404


    lead = dict(
        row
    )


    client_name = (
        lead.get(
            "name"
        )
        or "Client"
    )


    company = str(
        lead.get(
            "company",
            ""
        )
        or ""
    ).strip()


    personal_names = {
        "rajraushan kumar",
        "raj raushan kumar",
        "rajraushan official",
        "raj raushan official",
    }


    if company.lower() in personal_names:

        company = ""


    service = (
        lead.get(
            "service"
        )
        or "Creator Collaboration"
    )


    budget = (
        lead.get(
            "budget"
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


    suggested_quote = (
        manual_value
        if manual_value > 0
        else
        recommended_service_quote(
            service,
            budget
        )
    )


    deliverables = (
        proposal_deliverables(
            service
        )
    )


    timeline = (
        proposal_timeline(
            service
        )
    )


    client_line = (
        company
        if company
        else client_name
    )


    deliverable_text = "\n".join(
        f"- {item}"
        for item in deliverables
    )


    proposal_text = (
        "COLLABORATION PROPOSAL\n\n"
        f"Prepared for: {client_line}\n"
        "Prepared by: Rajraushan Kumar\n"
        "Brand: Raj Raushan Official\n\n"

        f"Campaign: {service}\n\n"

        "PROPOSED DELIVERABLES\n"
        f"{deliverable_text}\n\n"

        "SUGGESTED COMMERCIAL VALUE\n"
        f"?{suggested_quote:,.0f}\n\n"

        "EXPECTED TIMELINE\n"
        f"{timeline}\n\n"

        "CAMPAIGN TERMS\n"
        "- Final deliverables will be confirmed before production.\n"
        "- Major revisions or additional deliverables may affect pricing.\n"
        "- Travel, stay or location requirements can be discussed separately where applicable.\n"
        "- Publishing dates will be mutually confirmed.\n\n"

        "This document is a collaboration proposal / estimate "
        "and not a tax invoice.\n\n"

        "Best regards,\n"
        "Rajraushan Kumar"
    )


    return jsonify(
        {
            "status":
                "success",

            "lead_id":
                lead_id,

            "client":
                client_line,

            "service":
                service,

            "suggested_quote":
                suggested_quote,

            "deliverables":
                deliverables,

            "timeline":
                timeline,

            "proposal":
                proposal_text,

            "email":
                lead.get(
                    "email",
                    ""
                ),
        }
    )


@monetization_admin_bp.route(
    "/api/monetization/proposal/<int:lead_id>/sent",
    methods=["POST"],
)
def mark_campaign_proposal_sent(
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


    try:

        proposal_value = max(
            0,
            float(
                data.get(
                    "proposal_value",
                    0
                )
                or 0
            )
        )

    except (
        ValueError,
        TypeError,
    ):

        proposal_value = 0


    connection = get_connection()


    exists = connection.execute(
        """
        SELECT
            id,
            status
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


    current_status = (
        exists["status"]
        or "new"
    )


    next_status = (
        "negotiating"
        if current_status
        in (
            "new",
            "contacted",
        )
        else current_status
    )


    connection.execute(
        """
        UPDATE brand_enquiries

        SET
            proposal_value = ?,
            proposal_sent_at = CURRENT_TIMESTAMP,
            status = ?,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        """,
        (
            proposal_value,
            next_status,
            lead_id,
        )
    )


    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "lead_status":
                next_status,

            "proposal_value":
                proposal_value,
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





# ============================================================
# REAL EARNINGS + PAYMENT TRACKER
# ============================================================

def ensure_payment_schema():

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS monetization_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            method TEXT DEFAULT '',
            reference TEXT DEFAULT '',
            paid_at TEXT NOT NULL,
            notes TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )


    connection.execute(
        """
        CREATE INDEX IF NOT EXISTS
        idx_monetization_payments_lead_id
        ON monetization_payments(lead_id)
        """
    )


    # Automatically remove payment history
    # if a lead is permanently deleted.
    connection.execute(
        """
        CREATE TRIGGER IF NOT EXISTS
        delete_lead_payments

        AFTER DELETE ON brand_enquiries

        BEGIN

            DELETE FROM monetization_payments
            WHERE lead_id = OLD.id;

        END
        """
    )


    connection.commit()
    connection.close()


ensure_payment_schema()


def get_lead_payment_data(
    lead_id
):

    connection = get_connection()


    lead = connection.execute(
        """
        SELECT
            id,
            name,
            company,
            status,
            estimated_value,
            COALESCE(proposal_value, 0)
                AS proposal_value
        FROM brand_enquiries
        WHERE id = ?
        """,
        (
            lead_id,
        )
    ).fetchone()


    if not lead:

        connection.close()

        return None


    payment_rows = connection.execute(
        """
        SELECT
            id,
            amount,
            method,
            reference,
            paid_at,
            notes,
            created_at
        FROM monetization_payments
        WHERE lead_id = ?
        ORDER BY
            paid_at DESC,
            id DESC
        """,
        (
            lead_id,
        )
    ).fetchall()


    connection.close()


    proposal_value = float(
        lead["proposal_value"]
        or 0
    )


    estimated_value = float(
        lead["estimated_value"]
        or 0
    )


    target_value = (
        proposal_value
        if proposal_value > 0
        else estimated_value
    )


    received = sum(
        float(
            row["amount"]
            or 0
        )
        for row in payment_rows
    )


    outstanding = max(
        0,
        target_value - received
    )


    if received <= 0:

        payment_status = "unpaid"


    elif (
        target_value > 0
        and
        received < target_value
    ):

        payment_status = "partial"


    else:

        payment_status = "paid"


    return {
        "lead":
            dict(lead),

        "target_value":
            target_value,

        "received":
            received,

        "outstanding":
            outstanding,

        "payment_status":
            payment_status,

        "payments":
            [
                dict(row)
                for row
                in payment_rows
            ],
    }


# ============================================================
# PAYMENT DETAILS API
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/payments/<int:lead_id>"
)
def monetization_payment_details(
    lead_id
):

    if not logged_in():

        return jsonify(
            {
                "status":
                    "unauthorized"
            }
        ), 401


    data = get_lead_payment_data(
        lead_id
    )


    if not data:

        return jsonify(
            {
                "status":
                    "not_found"
            }
        ), 404


    return jsonify(
        {
            "status":
                "success",

            **data,
        }
    )


# ============================================================
# ADD PAYMENT
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/payments/<int:lead_id>",
    methods=["POST"],
)
def add_monetization_payment(
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


    try:

        amount = float(
            data.get(
                "amount",
                0
            )
            or 0
        )

    except (
        TypeError,
        ValueError,
    ):

        amount = 0


    if amount <= 0:

        return jsonify(
            {
                "status":
                    "error",

                "message":
                    "Payment amount must be greater than zero."
            }
        ), 400


    method = str(
        data.get(
            "method",
            ""
        )
        or ""
    ).strip()[:50]


    allowed_methods = {
        "",
        "UPI",
        "Bank Transfer",
        "Cash",
        "PayPal",
        "Other",
    }


    if method not in allowed_methods:

        method = "Other"


    reference = str(
        data.get(
            "reference",
            ""
        )
        or ""
    ).strip()[:150]


    notes = str(
        data.get(
            "notes",
            ""
        )
        or ""
    ).strip()[:1000]


    paid_at = str(
        data.get(
            "paid_at",
            ""
        )
        or ""
    ).strip()


    if not paid_at:

        paid_at = datetime.now().strftime(
            "%Y-%m-%d"
        )


    try:

        datetime.strptime(
            paid_at,
            "%Y-%m-%d"
        )

    except ValueError:

        return jsonify(
            {
                "status":
                    "error",

                "message":
                    "Invalid payment date."
            }
        ), 400


    connection = get_connection()


    lead = connection.execute(
        """
        SELECT
            id,
            status,
            service,
            budget,
            estimated_value,
            COALESCE(
                proposal_value,
                0
            ) AS proposal_value

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


    proposal_value = float(
        lead["proposal_value"]
        or 0
    )


    estimated_value = float(
        lead["estimated_value"]
        or 0
    )


    # --------------------------------------------------------
    # AUTOMATIC DEAL VALUE
    #
    # Priority:
    # 1. Proposal value
    # 2. Manual estimated value
    # 3. Budget-range estimate
    # --------------------------------------------------------

    target_value = (
        proposal_value
        if proposal_value > 0
        else estimated_value
    )


    if target_value <= 0:

        target_value = float(
            estimate_budget_value(
                lead["budget"]
            )
            or 0
        )


    # Persist automatic target so all dashboard calculations
    # use the same deal value from now on.

    if (
        proposal_value <= 0
        and
        estimated_value <= 0
        and
        target_value > 0
    ):

        connection.execute(
            """
            UPDATE brand_enquiries

            SET
                estimated_value = ?,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = ?
            """,
            (
                target_value,
                lead_id,
            )
        )


    connection.execute(
        """
        INSERT INTO monetization_payments
        (
            lead_id,
            amount,
            method,
            reference,
            paid_at,
            notes
        )

        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            lead_id,
            amount,
            method,
            reference,
            paid_at,
            notes,
        )
    )


    # Any real payment means the collaboration became a deal.

    if lead["status"] != "closed":

        connection.execute(
            """
            UPDATE brand_enquiries

            SET
                status = 'won',
                updated_at = CURRENT_TIMESTAMP

            WHERE id = ?
            """,
            (
                lead_id,
            )
        )


    connection.commit()
    connection.close()


    updated = get_lead_payment_data(
        lead_id
    )


    return jsonify(
        {
            "status":
                "success",

            "message":
                "Payment recorded successfully.",

            "received":
                updated[
                    "received"
                ],

            "outstanding":
                updated[
                    "outstanding"
                ],

            "payment_status":
                updated[
                    "payment_status"
                ],

            "deal_value":
                updated[
                    "target_value"
                ],
        }
    )


# ============================================================
# DELETE PAYMENT
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/payment/<int:payment_id>/delete",
    methods=["POST"],
)
def delete_monetization_payment(
    payment_id
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


    connection = get_connection()


    payment = connection.execute(
        """
        SELECT
            id,
            lead_id
        FROM monetization_payments
        WHERE id = ?
        """,
        (
            payment_id,
        )
    ).fetchone()


    if not payment:

        connection.close()

        return jsonify(
            {
                "status":
                    "not_found"
            }
        ), 404


    lead_id = payment[
        "lead_id"
    ]


    connection.execute(
        """
        DELETE FROM monetization_payments
        WHERE id = ?
        """,
        (
            payment_id,
        )
    )


    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "lead_id":
                lead_id,
        }
    )


# ============================================================
# REAL EARNINGS SUMMARY
# ============================================================

@monetization_admin_bp.route(
    "/api/monetization/earnings-summary"
)
def monetization_earnings_summary():

    if not logged_in():

        return jsonify(
            {
                "status":
                    "unauthorized"
            }
        ), 401


    connection = get_connection()


    payment_rows = connection.execute(
        """
        SELECT
            amount,
            paid_at
        FROM monetization_payments
        """
    ).fetchall()


    lead_rows = connection.execute(
        """
        SELECT
            id,
            status,
            estimated_value,
            COALESCE(proposal_value, 0)
                AS proposal_value
        FROM brand_enquiries
        """
    ).fetchall()


    received_by_lead_rows = connection.execute(
        """
        SELECT
            lead_id,
            SUM(amount) AS received
        FROM monetization_payments
        GROUP BY lead_id
        """
    ).fetchall()


    connection.close()


    received_by_lead = {
        int(row["lead_id"]):
            float(
                row["received"]
                or 0
            )

        for row
        in received_by_lead_rows
    }


    total_received = sum(
        float(
            row["amount"]
            or 0
        )
        for row
        in payment_rows
    )


    current_month = datetime.now().strftime(
        "%Y-%m"
    )


    month_received = sum(
        float(
            row["amount"]
            or 0
        )
        for row
        in payment_rows
        if str(
            row["paid_at"]
            or ""
        ).startswith(
            current_month
        )
    )


    pending_balance = 0

    fully_paid_deals = 0


    for lead in lead_rows:

        proposal = float(
            lead["proposal_value"]
            or 0
        )

        estimated = float(
            lead["estimated_value"]
            or 0
        )


        target = (
            proposal
            if proposal > 0
            else estimated
        )


        received = received_by_lead.get(
            int(
                lead["id"]
            ),
            0
        )


        if (
            target > 0
            and
            lead["status"]
            not in (
                "closed",
            )
        ):

            pending_balance += max(
                0,
                target - received
            )


        if (
            target > 0
            and
            received >= target
        ):

            fully_paid_deals += 1


    return jsonify(
        {
            "status":
                "success",

            "total_received":
                total_received,

            "this_month_received":
                month_received,

            "pending_balance":
                pending_balance,

            "fully_paid_deals":
                fully_paid_deals,

            "payment_count":
                len(
                    payment_rows
                ),
        }
    )


