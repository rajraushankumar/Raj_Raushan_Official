from flask import request
import time
import joblib
import os
import requests
import pandas as pd
import plotly.express as px

from datetime import datetime
from flask import jsonify, Flask, render_template, request
from dotenv import load_dotenv
import sqlite3


# ==========================================
# BASIC SETUP
# ==========================================

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("YOUTUBE_API_KEY")

MAIN_CHANNEL = "@rajraushanofficial"
SECOND_CHANNEL = "@rajraushanofficial02"


# ==========================================
# GET LATEST VIDEOS
# ==========================================

def get_latest_videos():

    if not API_KEY:
        print("YouTube API key not found")
        return []

    try:

        # ----------------------------------
        # GET CHANNEL UPLOAD PLAYLIST
        # ----------------------------------

        channel_url = (
            "https://www.googleapis.com/youtube/v3/channels"
        )

        channel_params = {
            "part": "contentDetails",
            "forHandle": MAIN_CHANNEL,
            "key": API_KEY
        }

        channel_response = requests.get(
            channel_url,
            params=channel_params,
            timeout=10
        )

        channel_data = channel_response.json()

        if not channel_data.get("items"):

            print("Main channel not found")

            return []


        playlist_id = (
            channel_data["items"][0]
            ["contentDetails"]
            ["relatedPlaylists"]
            ["uploads"]
        )


        # ----------------------------------
        # GET LATEST 12 VIDEOS
        # ----------------------------------

        playlist_url = (
            "https://www.googleapis.com/youtube/v3/playlistItems"
        )

        playlist_params = {
            "part": "snippet",
            "playlistId": playlist_id,
            "maxResults": 12,
            "key": API_KEY
        }

        playlist_response = requests.get(
            playlist_url,
            params=playlist_params,
            timeout=10
        )

        playlist_data = playlist_response.json()


        videos = []
        video_ids = []


        for item in playlist_data.get("items", []):

            snippet = item.get(
                "snippet",
                {}
            )

            resource_id = snippet.get(
                "resourceId",
                {}
            )

            video_id = resource_id.get(
                "videoId"
            )


            if not video_id:
                continue


            video_ids.append(
                video_id
            )


            # ------------------------------
            # UPLOAD DATE
            # ------------------------------

            raw_date = snippet.get(
                "publishedAt",
                ""
            )

            try:

                upload_date = datetime.strptime(
                    raw_date,
                    "%Y-%m-%dT%H:%M:%SZ"
                ).strftime(
                    "%d %b %Y"
                )

            except ValueError:

                upload_date = raw_date


            # ------------------------------
            # THUMBNAIL
            # ------------------------------

            thumbnails = snippet.get(
                "thumbnails",
                {}
            )


            if "high" in thumbnails:

                thumbnail = (
                    thumbnails["high"]["url"]
                )

            elif "medium" in thumbnails:

                thumbnail = (
                    thumbnails["medium"]["url"]
                )

            elif "default" in thumbnails:

                thumbnail = (
                    thumbnails["default"]["url"]
                )

            else:

                thumbnail = ""


            # ------------------------------
            # SAVE VIDEO DATA
            # ------------------------------

            videos.append({

                "title":
                    snippet.get(
                        "title",
                        "YouTube Video"
                    ),

                "thumbnail":
                    thumbnail,

                "video_id":
                    video_id,

                "url":
                    f"https://www.youtube.com/watch?v={video_id}",

                "published_at":
                    upload_date,

                                
                "published_raw":
                    raw_date,   

                "views":
                    "0",

                "likes":
                    "0",

                "comments":
                    "0"
            })


        # ==================================
        # GET VIDEO VIEW COUNTS
        # ==================================

        if video_ids:

            stats_url = (
                "https://www.googleapis.com/youtube/v3/videos"
            )

            stats_params = {

                "part":
                    "statistics",

                "id":
                    ",".join(video_ids),

                "key":
                    API_KEY
            }


            stats_response = requests.get(
                stats_url,
                params=stats_params,
                timeout=10
            )

            stats_data = stats_response.json()


            views_map = {}
            likes_map = {}
            comments_map = {}


            for item in stats_data.get(
                "items",
                []
            ):

                statistics = item.get(
                    "statistics",
                    {}
                )

                views_map[item["id"]] = (
                    statistics.get(
                        "viewCount",
                        "0"
                    )
                )

                likes_map[item["id"]] = (
                    statistics.get(
                        "likeCount",
                        "0"
                    )
                )

                comments_map[item["id"]] = (
                    statistics.get(
                        "commentCount",
                        "0"
                    )
                )



            # Add views to videos

            for video in videos:

                video["views"] = views_map.get(
                    video["video_id"],
                    "0"
                )

                video["likes"] = likes_map.get(
                    video["video_id"],
                    "0"
                )

                video["comments"] = comments_map.get(
                    video["video_id"],
                    "0"
                )



        print(
            "Total videos fetched:",
            len(videos)
        )


        return videos


    except Exception as error:

        print(
            "YouTube Video Error:",
            error
        )

        return []


# ==========================================
# GET CHANNEL INFORMATION
# ==========================================

def get_channel_info(channel_handle):

    if not API_KEY:
        return None


    try:

        url = (
            "https://www.googleapis.com/youtube/v3/channels"
        )


        params = {

            "part":
                "snippet,statistics",

            "forHandle":
                channel_handle,

            "key":
                API_KEY
        }


        response = requests.get(
            url,
            params=params,
            timeout=10
        )


        data = response.json()


        if not data.get("items"):

            print(
                "Channel not found:",
                channel_handle
            )

            return None


        channel = data["items"][0]


        snippet = channel.get(
            "snippet",
            {}
        )


        statistics = channel.get(
            "statistics",
            {}
        )


        return {

            "name":
                snippet.get(
                    "title",
                    "YouTube Channel"
                ),

            "handle":
                channel_handle,

            "profile_image":
                snippet.get(
                    "thumbnails",
                    {}
                ).get(
                    "high",
                    {}
                ).get(
                    "url",
                    ""
                ),

            "subscribers":
                statistics.get(
                    "subscriberCount",
                    "0"
                ),

            "views":
                statistics.get(
                    "viewCount",
                    "0"
                ),

            "videos":
                statistics.get(
                    "videoCount",
                    "0"
                ),

            "url":
                f"https://www.youtube.com/{channel_handle}"
        }


    except Exception as error:

        print(
            "Channel Error:",
            error
        )

        return None


# ==========================================
# PUBLIC HOME PAGE
# ==========================================

@app.route("/")
def home():

    videos = get_latest_videos()


    channel1 = get_channel_info(
        MAIN_CHANNEL
    )


    channel2 = get_channel_info(
        SECOND_CHANNEL
    )


    vlogs = []
    shorts = []


    # ======================================
    # SEPARATE VLOGS AND SHORTS
    # ======================================

    for video in videos:

        title = video["title"].lower()


        if (
            "#shorts" in title
            or "#youtubeshorts" in title
        ):

            shorts.append(
                video
            )

        else:

            vlogs.append(
                video
            )


    return render_template(

        "index.html",

        vlogs=vlogs,

        shorts=shorts,

        channel1=channel1,

        channel2=channel2
    )


# ==========================================
# CREATOR ANALYTICS DASHBOARD
# ==========================================



# ============================================================
# CREATOR ANALYTICS HISTORY
# ============================================================

ANALYTICS_DB = "creator_analytics.db"


def init_creator_analytics_db():

    with sqlite3.connect(ANALYTICS_DB) as connection:

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS daily_channel_stats (
                snapshot_date TEXT PRIMARY KEY,
                subscribers INTEGER DEFAULT 0,
                total_views INTEGER DEFAULT 0,
                total_videos INTEGER DEFAULT 0
            )
            """
        )

        connection.commit()


def fetch_channel_history_snapshot():

    try:

        response = requests.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={
                "part": "statistics",
                "forHandle": MAIN_CHANNEL,
                "key": API_KEY
            },
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        items = data.get("items", [])

        if not items:
            return None

        statistics = items[0].get(
            "statistics",
            {}
        )

        return {
            "subscribers": int(
                statistics.get(
                    "subscriberCount",
                    0
                )
            ),
            "total_views": int(
                statistics.get(
                    "viewCount",
                    0
                )
            ),
            "total_videos": int(
                statistics.get(
                    "videoCount",
                    0
                )
            )
        }

    except Exception as error:

        print(
            "Historical snapshot error:",
            error
        )

        return None


def save_channel_history_snapshot(snapshot):

    if not snapshot:
        return

    init_creator_analytics_db()

    today = datetime.now().strftime(
        "%Y-%m-%d"
    )

    with sqlite3.connect(ANALYTICS_DB) as connection:

        connection.execute(
            """
            INSERT OR REPLACE INTO daily_channel_stats
            (
                snapshot_date,
                subscribers,
                total_views,
                total_videos
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                today,
                snapshot["subscribers"],
                snapshot["total_views"],
                snapshot["total_videos"]
            )
        )

        connection.commit()


def load_channel_history():

    init_creator_analytics_db()

    with sqlite3.connect(ANALYTICS_DB) as connection:

        rows = connection.execute(
            """
            SELECT
                snapshot_date,
                subscribers,
                total_views,
                total_videos
            FROM daily_channel_stats
            ORDER BY snapshot_date
            """
        ).fetchall()

    return rows



@app.route("/dashboard")
def dashboard():

    videos = get_latest_videos()
    channel = get_channel_info(MAIN_CHANNEL)

    vlogs = []
    shorts = []

    # ======================================
    # VLOGS / SHORTS SEPARATION
    # ======================================

    for video in videos:

        title = video["title"].lower()

        if "#shorts" in title or "#youtubeshorts" in title:
            shorts.append(video)
        else:
            vlogs.append(video)


    # ======================================
    # DATA SCIENCE VARIABLES
    # ======================================

    recent_total_views = 0
    average_views = 0

    vlog_average_views = 0
    short_average_views = 0

    best_content_type = "No Data"

    views_chart = None
    content_chart = None

    top_video = None
    top_5_videos = []

    best_upload_day = "No Data"
    best_upload_time = "No Data"

    day_chart = None
    time_chart = None

    trend_chart = None
    trend_status = "No Data"

    hashtag_chart = None
    top_hashtag = "No Data"
    top_hashtag_views = 0

    velocity_chart = None
    fastest_video = "No Data"
    fastest_views_per_day = 0

    creator_recommendation = "Not enough data yet"
    recommendation_score = 0

    total_likes = 0
    total_comments = 0
    engagement_rate = 0
    best_engaging_video = "No Data"
    engagement_chart = None

    keyword_chart = None
    top_keyword = "No Data"
    top_keyword_views = 0

    average_upload_gap = 0
    latest_upload_gap = 0
    consistency_status = "No Data"
    consistency_chart = None

    best_performance_video = "No Data"
    best_performance_score = 0
    performance_score_chart = None

    history_views_chart = None
    history_subscriber_growth = 0
    history_view_growth = 0
    history_days = 0


    # ======================================
    # DATA SCIENCE ANALYSIS
    # ======================================

    if videos:

        # API DATA -> PANDAS DATAFRAME
        df = pd.DataFrame(videos)

        # CLEAN VIEW DATA
        df["views"] = pd.to_numeric(
            df["views"],
            errors="coerce"
        ).fillna(0)

        # BASIC ANALYTICS
        recent_total_views = int(df["views"].sum())
        average_views = int(df["views"].mean())

        # ==================================
        # YOUTUBE ENGAGEMENT ANALYSIS
        # ==================================

        df["likes"] = pd.to_numeric(
            df["likes"],
            errors="coerce"
        ).fillna(0)

        df["comments"] = pd.to_numeric(
            df["comments"],
            errors="coerce"
        ).fillna(0)

        total_likes = int(
            df["likes"].sum()
        )

        total_comments = int(
            df["comments"].sum()
        )

        total_views_for_engagement = float(
            df["views"].sum()
        )

        if total_views_for_engagement > 0:

            engagement_rate = round(
                (
                    (
                        total_likes
                        + total_comments
                    )
                    / total_views_for_engagement
                ) * 100,
                2
            )

        df["engagement"] = (
            df["likes"]
            + df["comments"]
        )

        if not df.empty:

            engaging_row = (
                df.sort_values(
                    "engagement",
                    ascending=False
                )
                .iloc[0]
            )

            best_engaging_video = str(
                engaging_row["title"]
            )

            engagement_data = (
                df.sort_values(
                    "engagement",
                    ascending=True
                )
                .tail(10)
                .copy()
            )

            engagement_data["short_engagement_title"] = (
                engagement_data["title"]
                .str.slice(0, 35)
            )

            engagement_fig = px.bar(
                engagement_data,
                x="engagement",
                y="short_engagement_title",
                orientation="h",
                title="Recent Video Engagement",
                labels={
                    "engagement": "Likes + Comments",
                    "short_engagement_title": "Video"
                }
            )

            engagement_fig.update_layout(
                height=480,
                margin=dict(
                    l=40,
                    r=40,
                    t=70,
                    b=40
                )
            )

            engagement_chart = (
                engagement_fig.to_html(
                    full_html=False,
                    include_plotlyjs="cdn"
                )
            )


        # ==================================
        # TITLE KEYWORD PERFORMANCE ANALYSIS
        # ==================================

        stop_words = {
            "the", "a", "an", "and", "or", "to", "of", "in",
            "on", "at", "for", "with", "is", "are", "this",
            "that", "my", "our", "your", "video", "vlog",
            "shorts", "short", "youtube"
        }

        keyword_rows = []

        for _, row in df.iterrows():

            words = (
                str(row["title"])
                .lower()
                .replace("|", " ")
                .replace("-", " ")
                .replace(":", " ")
                .split()
            )

            clean_words = []

            for word in words:

                word = (
                    word
                    .strip(".,!?()[]{}'\"")
                )

                if (
                    len(word) >= 3
                    and not word.startswith("#")
                    and word not in stop_words
                    and not word.isdigit()
                ):
                    clean_words.append(word)

            for word in set(clean_words):

                keyword_rows.append({
                    "Keyword": word,
                    "Views": int(row["views"])
                })

        if keyword_rows:

            keyword_df = pd.DataFrame(keyword_rows)

            keyword_analysis = (
                keyword_df
                .groupby("Keyword", as_index=False)
                .agg(
                    Average_Views=("Views", "mean"),
                    Videos=("Views", "count")
                )
            )

            # Ignore keywords appearing in only one video
            repeated_keywords = keyword_analysis[
                keyword_analysis["Videos"] >= 2
            ].copy()

            if repeated_keywords.empty:
                repeated_keywords = keyword_analysis.copy()

            repeated_keywords["Average_Views"] = (
                repeated_keywords["Average_Views"]
                .round()
                .astype(int)
            )

            repeated_keywords = (
                repeated_keywords
                .sort_values(
                    "Average_Views",
                    ascending=False
                )
            )

            best_keyword_row = repeated_keywords.iloc[0]

            top_keyword = str(
                best_keyword_row["Keyword"]
            )

            top_keyword_views = int(
                best_keyword_row["Average_Views"]
            )

            keyword_plot_data = (
                repeated_keywords
                .head(10)
                .sort_values(
                    "Average_Views",
                    ascending=True
                )
            )

            keyword_fig = px.bar(
                keyword_plot_data,
                x="Average_Views",
                y="Keyword",
                orientation="h",
                title="Top Title Keywords by Average Views",
                labels={
                    "Average_Views": "Average Views",
                    "Keyword": "Title Keyword"
                }
            )

            keyword_fig.update_layout(
                height=460,
                margin=dict(
                    l=40,
                    r=40,
                    t=70,
                    b=40
                )
            )

            keyword_chart = keyword_fig.to_html(
                full_html=False,
                include_plotlyjs="cdn"
            )


        # ==================================
        # UPLOAD CONSISTENCY ANALYSIS
        # ==================================

        if "published_raw" in df.columns:

            consistency_data = df.copy()

            consistency_data["upload_datetime"] = pd.to_datetime(
                consistency_data["published_raw"],
                errors="coerce",
                utc=True
            )

            consistency_data = (
                consistency_data
                .dropna(subset=["upload_datetime"])
                .sort_values("upload_datetime")
            )

            if len(consistency_data) >= 2:

                consistency_data["gap_days"] = (
                    consistency_data["upload_datetime"]
                    .diff()
                    .dt.total_seconds()
                    / 86400
                )

                valid_gaps = (
                    consistency_data["gap_days"]
                    .dropna()
                )

                if not valid_gaps.empty:

                    average_upload_gap = round(
                        float(valid_gaps.mean()),
                        1
                    )

                    latest_upload_gap = round(
                        float(valid_gaps.iloc[-1]),
                        1
                    )

                    if average_upload_gap <= 2:
                        consistency_status = "Very Consistent"

                    elif average_upload_gap <= 4:
                        consistency_status = "Consistent"

                    elif average_upload_gap <= 7:
                        consistency_status = "Moderate"

                    else:
                        consistency_status = "Irregular"

                    consistency_plot = (
                        consistency_data
                        .dropna(subset=["gap_days"])
                        .copy()
                    )

                    consistency_plot["date_label"] = (
                        consistency_plot["upload_datetime"]
                        .dt.strftime("%d %b")
                    )

                    consistency_fig = px.bar(
                        consistency_plot,
                        x="date_label",
                        y="gap_days",
                        title="Upload Gap Between Recent Videos",
                        labels={
                            "date_label": "Upload Date",
                            "gap_days": "Gap in Days"
                        }
                    )

                    consistency_fig.update_layout(
                        height=430,
                        margin=dict(
                            l=40,
                            r=40,
                            t=70,
                            b=40
                        )
                    )

                    consistency_chart = (
                        consistency_fig.to_html(
                            full_html=False,
                            include_plotlyjs="cdn"
                        )
                    )


        # ==================================
        # VIDEO PERFORMANCE SCORE
        # ==================================

        performance_data = df.copy()

        performance_data["views"] = pd.to_numeric(
            performance_data["views"],
            errors="coerce"
        ).fillna(0)

        performance_data["likes"] = pd.to_numeric(
            performance_data["likes"],
            errors="coerce"
        ).fillna(0)

        performance_data["comments"] = pd.to_numeric(
            performance_data["comments"],
            errors="coerce"
        ).fillna(0)

        performance_data["interactions"] = (
            performance_data["likes"]
            + performance_data["comments"]
        )

        performance_data["interaction_rate"] = (
            performance_data["interactions"]
            / performance_data["views"].replace(0, pd.NA)
            * 100
        ).fillna(0)

        if "published_raw" in performance_data.columns:

            performance_data["published_datetime"] = pd.to_datetime(
                performance_data["published_raw"],
                errors="coerce",
                utc=True
            )

            now_utc = pd.Timestamp.now(tz="UTC")

            performance_data["age_days"] = (
                (
                    now_utc
                    - performance_data["published_datetime"]
                )
                .dt.total_seconds()
                / 86400
            ).clip(lower=1)

            performance_data["views_per_day"] = (
                performance_data["views"]
                / performance_data["age_days"]
            ).fillna(0)

        else:

            performance_data["views_per_day"] = 0


        max_views = performance_data["views"].max()
        max_interaction_rate = (
            performance_data["interaction_rate"].max()
        )
        max_velocity = (
            performance_data["views_per_day"].max()
        )


        if max_views > 0:
            performance_data["views_score"] = (
                performance_data["views"]
                / max_views
                * 100
            )
        else:
            performance_data["views_score"] = 0


        if max_interaction_rate > 0:
            performance_data["engagement_score"] = (
                performance_data["interaction_rate"]
                / max_interaction_rate
                * 100
            )
        else:
            performance_data["engagement_score"] = 0


        if max_velocity > 0:
            performance_data["velocity_score"] = (
                performance_data["views_per_day"]
                / max_velocity
                * 100
            )
        else:
            performance_data["velocity_score"] = 0


        performance_data["performance_score"] = (
            performance_data["views_score"] * 0.50
            + performance_data["engagement_score"] * 0.30
            + performance_data["velocity_score"] * 0.20
        ).round(1)


        if not performance_data.empty:

            best_score_row = (
                performance_data
                .sort_values(
                    "performance_score",
                    ascending=False
                )
                .iloc[0]
            )

            best_performance_video = str(
                best_score_row["title"]
            )

            best_performance_score = float(
                best_score_row["performance_score"]
            )


            performance_plot = (
                performance_data
                .sort_values(
                    "performance_score",
                    ascending=False
                )
                .head(10)
                .copy()
            )

            performance_plot["short_title"] = (
                performance_plot["title"]
                .str.slice(0, 38)
            )

            performance_plot = (
                performance_plot
                .sort_values(
                    "performance_score",
                    ascending=True
                )
            )

            performance_fig = px.bar(
                performance_plot,
                x="performance_score",
                y="short_title",
                orientation="h",
                title="Recent Video Performance Score",
                labels={
                    "performance_score": "Performance Score",
                    "short_title": "Video"
                }
            )

            performance_fig.update_layout(
                height=480,
                margin=dict(
                    l=40,
                    r=40,
                    t=70,
                    b=40
                )
            )

            performance_score_chart = (
                performance_fig.to_html(
                    full_html=False,
                    include_plotlyjs="cdn"
                )
            )


        # ==================================
        # VLOG / SHORT CLASSIFICATION
        # ==================================

        df["content_type"] = df["title"].apply(
            lambda title:
                "Short"
                if "#shorts" in title.lower()
                or "#youtubeshorts" in title.lower()
                else "Vlog"
        )

        vlog_data = df[df["content_type"] == "Vlog"]
        short_data = df[df["content_type"] == "Short"]

        if not vlog_data.empty:
            vlog_average_views = int(
                vlog_data["views"].mean()
            )

        if not short_data.empty:
            short_average_views = int(
                short_data["views"].mean()
            )

        if vlog_average_views > short_average_views:
            best_content_type = "Vlogs"
        elif short_average_views > vlog_average_views:
            best_content_type = "Shorts"
        else:
            best_content_type = "Equal Performance"

        # ==================================
        # RECENT VIDEO CHART
        # ==================================

        df["short_title"] = (
            df["title"]
            .str.slice(0, 35)
        )

        chart_data = df.sort_values(
            "views",
            ascending=True
        )

        views_fig = px.bar(
            chart_data,
            x="views",
            y="short_title",
            orientation="h",
            title="Recent Video Views",
            labels={
                "views": "Views",
                "short_title": "Video"
            }
        )

        views_chart = views_fig.to_html(
            full_html=False,
            include_plotlyjs="cdn"
        )

        # ==================================
        # HASHTAG PERFORMANCE ANALYSIS
        # ==================================

        hashtag_rows = []

        for _, row in df.iterrows():

            title = str(row["title"])

            hashtags = [
                word.lower()
                for word in title.split()
                if word.startswith("#")
                and len(word) > 1
            ]

            for hashtag in hashtags:

                hashtag_rows.append({
                    "Hashtag": hashtag,
                    "Views": int(row["views"])
                })


        if hashtag_rows:

            hashtag_df = pd.DataFrame(
                hashtag_rows
            )

            hashtag_analysis = (
                hashtag_df
                .groupby("Hashtag", as_index=False)["Views"]
                .mean()
            )

            hashtag_analysis["Views"] = (
                hashtag_analysis["Views"]
                .round()
                .astype(int)
            )

            hashtag_analysis = (
                hashtag_analysis
                .sort_values(
                    "Views",
                    ascending=False
                )
            )

            top_hashtag_row = hashtag_analysis.iloc[0]

            top_hashtag = (
                top_hashtag_row["Hashtag"]
            )

            top_hashtag_views = int(
                top_hashtag_row["Views"]
            )

            top_hashtags = (
                hashtag_analysis
                .head(10)
                .sort_values(
                    "Views",
                    ascending=True
                )
            )

            hashtag_fig = px.bar(
                top_hashtags,
                x="Views",
                y="Hashtag",
                orientation="h",
                title="Top Hashtags by Average Views",
                labels={
                    "Views": "Average Views",
                    "Hashtag": "Hashtag"
                }
            )

            hashtag_fig.update_layout(
                height=450,
                margin=dict(
                    l=40,
                    r=40,
                    t=70,
                    b=40
                )
            )

            hashtag_chart = hashtag_fig.to_html(
                full_html=False,
                include_plotlyjs=False
            )

                # ==================================
        # VIDEO PERFORMANCE VELOCITY
        # ==================================

        if "published_raw" in df.columns:

            velocity_data = df.copy()

            velocity_data["published_datetime"] = pd.to_datetime(
                velocity_data["published_raw"],
                errors="coerce",
                utc=True
            )

            velocity_data = velocity_data.dropna(
                subset=["published_datetime"]
            )

            if not velocity_data.empty:

                now_utc = pd.Timestamp.now(tz="UTC")

                velocity_data["age_days"] = (
                    (
                        now_utc
                        - velocity_data["published_datetime"]
                    ).dt.total_seconds()
                    / 86400
                ).clip(lower=1)

                velocity_data["views_per_day"] = (
                    velocity_data["views"]
                    / velocity_data["age_days"]
                )

                fastest_row = (
                    velocity_data
                    .sort_values(
                        "views_per_day",
                        ascending=False
                    )
                    .iloc[0]
                )

                fastest_video = fastest_row["title"]

                fastest_views_per_day = round(
                    float(fastest_row["views_per_day"]),
                    1
                )

                velocity_data["short_velocity_title"] = (
                    velocity_data["title"]
                    .str.slice(0, 35)
                )

                velocity_chart_data = (
                    velocity_data
                    .sort_values(
                        "views_per_day",
                        ascending=False
                    )
                    .head(10)
                    .sort_values(
                        "views_per_day",
                        ascending=True
                    )
                )

                velocity_fig = px.bar(
                    velocity_chart_data,
                    x="views_per_day",
                    y="short_velocity_title",
                    orientation="h",
                    title="Recent Videos - Views Per Day",
                    labels={
                        "views_per_day": "Views Per Day",
                        "short_velocity_title": "Video"
                    }
                )

                velocity_fig.update_layout(
                    height=480,
                    margin=dict(
                        l=40,
                        r=40,
                        t=70,
                        b=40
                    )
                )

                velocity_chart = velocity_fig.to_html(
                    full_html=False,
                    include_plotlyjs=False
                )    

            

        # ==================================
        # VLOGS VS SHORTS CHART
        # ==================================

        comparison_data = pd.DataFrame({
            "Content Type": [
                "Vlogs",
                "Shorts"
            ],
            "Average Views": [
                vlog_average_views,
                short_average_views
            ]
        })

        content_fig = px.bar(
            comparison_data,
            x="Content Type",
            y="Average Views",
            title="Vlogs vs Shorts Performance"
        )

        content_chart = content_fig.to_html(
            full_html=False,
            include_plotlyjs="cdn"
        )

                # ==================================
        # SMART CREATOR RECOMMENDATION
        # ==================================

        recommendation_parts = []

        if best_content_type != "No Data":
            recommendation_parts.append(
                f"Focus more on {best_content_type}"
            )

        if best_upload_day != "No Data":
            recommendation_parts.append(
                f"upload on {best_upload_day}"
            )

        if best_upload_time != "No Data":
            recommendation_parts.append(
                f"around {best_upload_time}"
            )

        if top_hashtag != "No Data":
            recommendation_parts.append(
                f"use {top_hashtag}"
            )

        if recommendation_parts:
            creator_recommendation = " • ".join(
                recommendation_parts
            )

        score = 0

        if best_content_type != "No Data":
            score += 25

        if best_upload_day != "No Data":
            score += 25

        if best_upload_time != "No Data":
            score += 25

        if top_hashtag != "No Data":
            score += 25

        recommendation_score = score

        # ==================================
        # TOP VIDEO
        # ==================================

        top_video = max(
            videos,
            key=lambda video: int(video["views"])
        )

        # ==================================
        # TOP 5 VIDEO RANKING
        # ==================================

        top_5_df = (
            df.sort_values(
                "views",
                ascending=False
            )
            .head(5)
            .copy()
        )

        top_5_df["rank"] = range(
            1,
            len(top_5_df) + 1
        )

        top_5_df["views"] = (
            top_5_df["views"]
            .astype(int)
        )

        top_5_videos = (
            top_5_df[
                [
                    "rank",
                    "title",
                    "thumbnail",
                    "url",
                    "published_at",
                    "views"
                ]
            ]
            .to_dict(
                orient="records"
            )
        )

        # ==================================
        # RECENT UPLOAD PERFORMANCE TREND
        # ==================================

        if "published_raw" in df.columns:

            trend_data = df.copy()

            trend_data["upload_date"] = pd.to_datetime(
                trend_data["published_raw"],
                errors="coerce",
                utc=True
            )

            trend_data = trend_data.dropna(
                subset=["upload_date"]
            ).sort_values(
                "upload_date"
            )

            if not trend_data.empty:

                trend_data["date_label"] = (
                    trend_data["upload_date"]
                    .dt.strftime("%d %b")
                )

                trend_fig = px.line(
                    trend_data,
                    x="date_label",
                    y="views",
                    markers=True,
                    title="Recent Upload Performance Trend",
                    labels={
                        "date_label": "Upload Date",
                        "views": "Current Views"
                    }
                )

                trend_fig.update_layout(
                    height=420,
                    margin=dict(
                        l=40,
                        r=40,
                        t=70,
                        b=40
                    )
                )

                trend_chart = trend_fig.to_html(
                    full_html=False,
                    include_plotlyjs="cdn"
                )

                if len(trend_data) >= 2:

                    middle = len(trend_data) // 2

                    old_average = (
                        trend_data.iloc[:middle]["views"]
                        .mean()
                    )

                    recent_average = (
                        trend_data.iloc[middle:]["views"]
                        .mean()
                    )

                    if recent_average > old_average:
                        trend_status = "Improving 📈"

                    elif recent_average < old_average:
                        trend_status = "Declining 📉"

                    else:
                        trend_status = "Stable ➡️"

                else:
                    trend_status = "Stable ➡️"


        # ==================================
        # BEST UPLOAD DAY / TIME ANALYSIS
        # ==================================

        if "published_raw" in df.columns:

            df["published_datetime"] = pd.to_datetime(
                df["published_raw"],
                errors="coerce",
                utc=True
            )

            date_data = df.dropna(
                subset=["published_datetime"]
            ).copy()

            if not date_data.empty:

                # Convert UTC time to India time
                date_data["published_datetime"] = (
                    date_data["published_datetime"]
                    .dt.tz_convert("Asia/Kolkata")
                )

                # --------------------------
                # BEST UPLOAD DAY
                # --------------------------

                date_data["upload_day"] = (
                    date_data["published_datetime"]
                    .dt.day_name()
                )

                day_analysis = (
                    date_data
                    .groupby("upload_day", as_index=False)["views"]
                    .mean()
                )

                day_analysis.columns = [
                    "Upload Day",
                    "Average Views"
                ]

                day_analysis["Average Views"] = (
                    day_analysis["Average Views"]
                    .round()
                    .astype(int)
                )

                best_day_row = (
                    day_analysis
                    .sort_values(
                        "Average Views",
                        ascending=False
                    )
                    .iloc[0]
                )

                best_upload_day = best_day_row["Upload Day"]

                day_fig = px.bar(
                    day_analysis,
                    x="Upload Day",
                    y="Average Views",
                    title="Average Views by Upload Day"
                )

                day_chart = day_fig.to_html(
                    full_html=False,
                    include_plotlyjs=False
                )

                # --------------------------
                # BEST UPLOAD TIME
                # --------------------------

                date_data["upload_hour"] = (
                    date_data["published_datetime"]
                    .dt.hour
                )

                time_analysis = (
                    date_data
                    .groupby("upload_hour", as_index=False)["views"]
                    .mean()
                )

                time_analysis.columns = [
                    "Upload Hour",
                    "Average Views"
                ]

                time_analysis["Average Views"] = (
                    time_analysis["Average Views"]
                    .round()
                    .astype(int)
                )

                best_time_row = (
                    time_analysis
                    .sort_values(
                        "Average Views",
                        ascending=False
                    )
                    .iloc[0]
                )

                best_hour = int(
                    best_time_row["Upload Hour"]
                )

                best_upload_time = datetime.strptime(
                    str(best_hour),
                    "%H"
                ).strftime(
                    "%I:00 %p"
                )

                time_analysis["Upload Time"] = (
                    time_analysis["Upload Hour"]
                    .apply(
                        lambda hour:
                        datetime.strptime(
                            str(int(hour)),
                            "%H"
                        ).strftime("%I %p")
                    )
                )

                time_fig = px.bar(
                    time_analysis,
                    x="Upload Time",
                    y="Average Views",
                    title="Average Views by Upload Time"
                )

                time_chart = time_fig.to_html(
                    full_html=False,
                    include_plotlyjs=False
                )


    # ======================================
    # SEND DATA TO DASHBOARD
    # ======================================
    # ========================================================
    # FINAL DASHBOARD ANALYTICS
    # ========================================================

    try:

        snapshot = (
            fetch_channel_history_snapshot()
        )

        if snapshot:

            save_channel_history_snapshot(
                snapshot
            )

        history_rows = (
            load_channel_history()
        )

        history_days = len(
            history_rows
        )

        if history_rows:

            history_df = pd.DataFrame(
                history_rows,
                columns=[
                    "date",
                    "subscribers",
                    "total_views",
                    "total_videos"
                ]
            )

            history_df["date"] = pd.to_datetime(
                history_df["date"],
                errors="coerce"
            )

            history_df = (
                history_df
                .dropna(subset=["date"])
                .sort_values("date")
            )

            if not history_df.empty:

                history_df["date_label"] = (
                    history_df["date"]
                    .dt.strftime("%d %b")
                )

                history_fig = px.line(
                    history_df,
                    x="date_label",
                    y="total_views",
                    markers=True,
                    title="Channel View Growth History",
                    labels={
                        "date_label": "Date",
                        "total_views": "Total Channel Views"
                    }
                )

                history_fig.update_layout(
                    height=430,
                    margin=dict(
                        l=40,
                        r=40,
                        t=70,
                        b=40
                    )
                )

                history_views_chart = (
                    history_fig.to_html(
                        full_html=False,
                        include_plotlyjs="cdn"
                    )
                )

                if len(history_df) >= 2:

                    history_subscriber_growth = int(
                        history_df.iloc[-1][
                            "subscribers"
                        ]
                        -
                        history_df.iloc[0][
                            "subscribers"
                        ]
                    )

                    history_view_growth = int(
                        history_df.iloc[-1][
                            "total_views"
                        ]
                        -
                        history_df.iloc[0][
                            "total_views"
                        ]
                    )

    except Exception as error:

        print(
            "Historical analytics error:",
            error
        )


    # ========================================================
    # ADVANCED SMART CREATOR RECOMMENDATION
    # ========================================================

    recommendation_parts = []

    if (
        "best_content_type" in locals()
        and best_content_type != "No Data"
    ):

        recommendation_parts.append(
            f"Prioritize {best_content_type}"
        )


    if (
        "best_upload_day" in locals()
        and best_upload_day != "No Data"
    ):

        upload_message = (
            f"upload on {best_upload_day}"
        )

        if (
            "best_upload_time" in locals()
            and best_upload_time != "No Data"
        ):

            upload_message += (
                f" around {best_upload_time}"
            )

        recommendation_parts.append(
            upload_message
        )


    if (
        "top_hashtag" in locals()
        and top_hashtag != "No Data"
    ):

        recommendation_parts.append(
            f"reuse strong hashtag {top_hashtag}"
        )


    if (
        "top_keyword" in locals()
        and top_keyword != "No Data"
    ):

        recommendation_parts.append(
            f"consider '{top_keyword}' in relevant titles"
        )


    if (
        "consistency_status" in locals()
        and consistency_status == "Irregular"
    ):

        recommendation_parts.append(
            "reduce the gap between uploads"
        )


    if (
        "engagement_rate" in locals()
        and engagement_rate > 0
    ):

        recommendation_parts.append(
            f"current interaction rate is {engagement_rate}%"
        )


    if recommendation_parts:

        creator_recommendation = (
            " ? ".join(
                recommendation_parts
            )
        )


    recommendation_signals = [
        (
            "best_content_type" in locals()
            and best_content_type != "No Data"
        ),
        (
            "best_upload_day" in locals()
            and best_upload_day != "No Data"
        ),
        (
            "best_upload_time" in locals()
            and best_upload_time != "No Data"
        ),
        (
            "top_hashtag" in locals()
            and top_hashtag != "No Data"
        ),
        (
            "top_keyword" in locals()
            and top_keyword != "No Data"
        ),
        (
            "consistency_status" in locals()
            and consistency_status != "No Data"
        ),
        (
            "engagement_rate" in locals()
            and engagement_rate > 0
        ),
        (
            "best_performance_score" in locals()
            and best_performance_score > 0
        )
    ]

    recommendation_score = round(
        (
            sum(recommendation_signals)
            / len(recommendation_signals)
        )
        * 100
    )

    return render_template(
        "dashboard.html",
        channel=channel,
        videos=videos,
        vlogs=vlogs,
        shorts=shorts,
        recent_total_views=recent_total_views,
        average_views=average_views,
        vlog_average_views=vlog_average_views,
        short_average_views=short_average_views,
        best_content_type=best_content_type,
        views_chart=views_chart,
        content_chart=content_chart,
        top_video=top_video,
        top_5_videos=top_5_videos,
        best_upload_day=best_upload_day,
        best_upload_time=best_upload_time,
        day_chart=day_chart,
        time_chart=time_chart,
               trend_chart=trend_chart,
        trend_status=trend_status,

       

        hashtag_chart=hashtag_chart,
        top_hashtag=top_hashtag,
        top_hashtag_views=top_hashtag_views,

        velocity_chart=velocity_chart,
        fastest_video=fastest_video,
        fastest_views_per_day=fastest_views_per_day,

        total_likes=total_likes,
        total_comments=total_comments,
        engagement_rate=engagement_rate,
        best_engaging_video=best_engaging_video,
        engagement_chart=engagement_chart,

        keyword_chart=keyword_chart,
        top_keyword=top_keyword,
        top_keyword_views=top_keyword_views,

        average_upload_gap=average_upload_gap,
        latest_upload_gap=latest_upload_gap,
        consistency_status=consistency_status,
        consistency_chart=consistency_chart,

        best_performance_video=best_performance_video,
        best_performance_score=best_performance_score,
        performance_score_chart=performance_score_chart,

        history_views_chart=history_views_chart,
        history_subscriber_growth=history_subscriber_growth,
        history_view_growth=history_view_growth,
        history_days=history_days,

        creator_recommendation=creator_recommendation,
        recommendation_score=recommendation_score
    )
# ==========================================
# RUN FLASK WEBSITE
# ==========================================



# ============================================================
# ML VIDEO PERFORMANCE PREDICTOR
# ============================================================

@app.route("/predict", methods=["GET", "POST"])
def predict_video_performance():

    prediction = None
    probabilities = None
    prediction_error = None

    title = ""
    upload_day = "Sunday"
    upload_hour = 18
    duration_seconds = 60
    has_short_tag = False

    if request.method == "POST":

        try:

            title = request.form.get(
                "title",
                ""
            ).strip()

            upload_day = request.form.get(
                "upload_day",
                "Sunday"
            )

            upload_hour = int(
                request.form.get(
                    "upload_hour",
                    18
                )
            )

            duration_seconds = int(
                request.form.get(
                    "duration_seconds",
                    60
                )
            )

            has_short_tag = (
                request.form.get(
                    "has_short_tag"
                )
                == "on"
            )

            if not title:
                raise ValueError(
                    "Please enter a video title."
                )

            model_package = joblib.load(
                "models/video_performance_model.joblib"
            )

            model = model_package["model"]

            prediction_data = pd.DataFrame([
                {
                    "title": title,
                    "upload_day": upload_day,
                    "upload_hour": upload_hour,
                    "duration_seconds": duration_seconds,
                    "has_short_tag": int(has_short_tag)
                }
            ])

            prediction = str(
                model.predict(
                    prediction_data
                )[0]
            )

            if hasattr(model, "predict_proba"):

                values = model.predict_proba(
                    prediction_data
                )[0]

                probabilities = {
                    str(label): round(
                        float(value) * 100,
                        1
                    )
                    for label, value
                    in zip(
                        model.classes_,
                        values
                    )
                }

        except Exception as error:

            prediction_error = str(error)


    return render_template(
        "predictor.html",
        prediction=prediction,
        probabilities=probabilities,
        prediction_error=prediction_error,
        title=title,
        upload_day=upload_day,
        upload_hour=upload_hour,
        duration_seconds=duration_seconds,
        has_short_tag=has_short_tag
    )




# ============================================================
# PUBLIC COLLABORATION PAGE
# ============================================================

@app.route("/collaborate")
def collaboration_page():

    return render_template(
        "collaborate.html"
    )




# ============================================================
# PUBLIC ABOUT PAGE
# ============================================================

@app.route("/about")
def about_page():

    return render_template(
        "about.html"
    )




# ============================================================
# PUBLIC DESTINATIONS PAGE
# ============================================================



# ============================================================
# YOUTUBE PUBLIC PLAYLISTS
# ============================================================

def get_all_youtube_playlists():

    playlists = []

    if not API_KEY:
        return playlists

    try:

        # ----------------------------------------------------
        # Resolve channel ID from handle
        # ----------------------------------------------------

        channel_response = requests.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={
                "part": "snippet",
                "forHandle": MAIN_CHANNEL,
                "key": API_KEY
            },
            timeout=(7, 20)
        )

        channel_response.raise_for_status()

        channel_data = channel_response.json()

        channel_items = channel_data.get(
            "items",
            []
        )

        if not channel_items:
            return playlists

        channel_id = channel_items[0].get(
            "id"
        )

        if not channel_id:
            return playlists


        # ----------------------------------------------------
        # Fetch ALL public playlists
        # ----------------------------------------------------

        next_page_token = None

        while True:

            params = {
                "part": "snippet,contentDetails",
                "channelId": channel_id,
                "maxResults": 50,
                "key": API_KEY
            }

            if next_page_token:

                params["pageToken"] = (
                    next_page_token
                )


            response = requests.get(
                "https://www.googleapis.com/youtube/v3/playlists",
                params=params,
                timeout=(7, 20)
            )

            response.raise_for_status()

            data = response.json()


            for item in data.get(
                "items",
                []
            ):

                snippet = item.get(
                    "snippet",
                    {}
                )

                details = item.get(
                    "contentDetails",
                    {}
                )

                thumbnails = snippet.get(
                    "thumbnails",
                    {}
                )

                thumbnail = (
                    thumbnails.get(
                        "maxres",
                        {}
                    ).get("url")
                    or
                    thumbnails.get(
                        "standard",
                        {}
                    ).get("url")
                    or
                    thumbnails.get(
                        "high",
                        {}
                    ).get("url")
                    or
                    thumbnails.get(
                        "medium",
                        {}
                    ).get("url")
                    or
                    thumbnails.get(
                        "default",
                        {}
                    ).get("url")
                    or
                    ""
                )

                playlist_id = item.get(
                    "id",
                    ""
                )

                playlists.append(
                    {
                        "playlist_id":
                            playlist_id,

                        "title":
                            snippet.get(
                                "title",
                                "Untitled Playlist"
                            ),

                        "description":
                            snippet.get(
                                "description",
                                ""
                            ),

                        "thumbnail":
                            thumbnail,

                        "video_count":
                            int(
                                details.get(
                                    "itemCount",
                                    0
                                )
                            ),

                        "published_at":
                            snippet.get(
                                "publishedAt",
                                ""
                            ),

                        "url":
                            (
                                "https://www.youtube.com/"
                                "playlist?list="
                                + playlist_id
                            )
                    }
                )


            next_page_token = data.get(
                "nextPageToken"
            )

            if not next_page_token:
                break


        playlists.sort(
            key=lambda item:
                item.get(
                    "published_at",
                    ""
                ),
            reverse=True
        )


    except Exception as error:

        print(
            "Playlist fetch error:",
            error
        )


    return playlists





# ============================================================
# TRAVEL DESTINATION GUIDES
# ============================================================

TRAVEL_DESTINATION_GUIDES = {

    "sasaram-rohtas": {

        "title":
            "Sasaram & Rohtas",

        "region":
            "Bihar, India",

        "category":
            "Heritage & Nature",

        "intro":
            (
                "Explore heritage, landscapes and "
                "travel stories from Sasaram and "
                "the wider Rohtas region."
            ),

        "story":
            (
                "This destination collection focuses "
                "on local history, architecture, hills, "
                "roads and authentic travel experiences "
                "from the Rohtas region."
            ),

        "highlights": [
            "Heritage",
            "Historic Places",
            "Nature",
            "Local Travel",
            "Road Journeys"
        ],

        "keywords": [
            "sasaram",
            "rohtas",
            "shergarh",
            "gupta dham",
            "rohtasgarh"
        ]
    },


    "ranchi": {

        "title":
            "Ranchi",

        "region":
            "Jharkhand, India",

        "category":
            "City, Nature & Culture",

        "intro":
            (
                "Explore Ranchi through city experiences, "
                "nature, attractions and local journeys."
            ),

        "story":
            (
                "Ranchi offers a mix of urban exploration, "
                "hills, cultural landmarks and outdoor "
                "experiences featured through real journeys."
            ),

        "highlights": [
            "City Travel",
            "Nature",
            "Culture",
            "Local Attractions",
            "Travel Vlogs"
        ],

        "keywords": [
            "ranchi",
            "tagore",
            "jagannath",
            "zoo",
            "museum"
        ]
    },


    "ayodhya": {

        "title":
            "Ayodhya",

        "region":
            "Uttar Pradesh, India",

        "category":
            "Spiritual & Cultural Journey",

        "intro":
            (
                "Discover travel, culture and spiritual "
                "experiences connected with Ayodhya."
            ),

        "story":
            (
                "The Ayodhya journey focuses on destination "
                "exploration, cultural experiences and "
                "visual travel storytelling."
            ),

        "highlights": [
            "Spiritual Travel",
            "Culture",
            "Architecture",
            "City Exploration",
            "Travel Stories"
        ],

        "keywords": [
            "ayodhya",
            "ram",
            "temple"
        ]
    }

}





# ============================================================
# REAL YOUTUBE PLAYLIST DESTINATION CATALOG
# ============================================================

TRAVEL_DESTINATION_CATALOG = {

    "ranchi": {
        "title": "Ranchi",
        "region": "Jharkhand, India",
        "category": "City & Nature",
        "intro": "Travel stories and experiences from Ranchi.",
        "story": "Explore Ranchi through Raj Raushan Official travel videos.",
        "highlights": [
            "Ranchi",
            "Jharkhand",
            "City Travel",
            "Nature"
        ],
        "playlist_terms": [
            "ranchi"
        ],
        "filter_tags": [
            "jharkhand",
            "city",
            "nature"
        ],
        "lat": 23.3441,
        "lng": 85.3096
    },


    "aurangabad-bihar": {
        "title": "Aurangabad",
        "region": "Bihar, India",
        "category": "Local Travel",
        "intro": "Travel stories from Aurangabad, Bihar.",
        "story": "Explore local journeys and experiences from Aurangabad.",
        "highlights": [
            "Aurangabad",
            "Bihar",
            "Local Travel"
        ],
        "playlist_terms": [
            "aurangabad bihar"
        ],
        "filter_tags": [
            "bihar",
            "local"
        ],
        "lat": 24.7457,
        "lng": 84.3802
    },


    "sasaram-rohtas": {
        "title": "Sasaram & Rohtas",
        "region": "Bihar, India",
        "category": "Heritage & Nature",
        "intro": "Explore Sasaram, Rohtas and Manjhar Kund.",
        "story": "Travel stories covering Sasaram, Rohtas and nearby natural destinations.",
        "highlights": [
            "Sasaram",
            "Rohtas",
            "Manjhar Kund",
            "Heritage",
            "Nature"
        ],
        "playlist_terms": [
            "sasaram",
            "rohtas all videos",
            "manjhar kund"
        ],
        "filter_tags": [
            "bihar",
            "heritage",
            "nature"
        ],
        "lat": 24.9539,
        "lng": 84.0145
    },


    "indrapuri-tutla-bhavani": {
        "title": "Indrapuri & Maa Tutla Bhavani",
        "region": "Rohtas, Bihar",
        "category": "Nature & Spiritual",
        "intro": "Explore Indrapuri and Maa Tutla Bhavani.",
        "story": "Travel and spiritual experiences from the Rohtas region.",
        "highlights": [
            "Indrapuri",
            "Tutla Bhavani",
            "Nature",
            "Spiritual"
        ],
        "playlist_terms": [
            "indrapuri",
            "tutla bhavani"
        ],
        "filter_tags": [
            "bihar",
            "nature",
            "spiritual"
        ],
        "lat": None,
        "lng": None
    },


    "patna": {
        "title": "Patna",
        "region": "Bihar, India",
        "category": "City Travel",
        "intro": "Explore Patna through Shorts and long travel videos.",
        "story": "Raj Raushan Official travel collections from Patna.",
        "highlights": [
            "Patna",
            "City",
            "Shorts",
            "Long Videos"
        ],
        "playlist_terms": [
            "patna"
        ],
        "filter_tags": [
            "bihar",
            "city"
        ],
        "lat": 25.5941,
        "lng": 85.1376
    },


    "mundeshwari": {
        "title": "Maa Mundeshwari Mandir",
        "region": "Bihar, India",
        "category": "Spiritual & Heritage",
        "intro": "Explore the Maa Mundeshwari Mandir journey.",
        "story": "A spiritual travel collection from Raj Raushan Official.",
        "highlights": [
            "Mundeshwari",
            "Temple",
            "Spiritual",
            "Heritage"
        ],
        "playlist_terms": [
            "mundeshwari"
        ],
        "filter_tags": [
            "bihar",
            "spiritual",
            "heritage"
        ],
        "lat": None,
        "lng": None
    },


    "varanasi": {
        "title": "Varanasi",
        "region": "Uttar Pradesh, India",
        "category": "Culture & Spiritual",
        "intro": "Explore Varanasi through Shorts and long-form videos.",
        "story": "Travel, culture and spiritual experiences from Varanasi.",
        "highlights": [
            "Varanasi",
            "Culture",
            "Spiritual",
            "Shorts",
            "Long Videos"
        ],
        "playlist_terms": [
            "varanasi"
        ],
        "filter_tags": [
            "uttar-pradesh",
            "heritage",
            "spiritual"
        ],
        "lat": 25.3176,
        "lng": 82.9739
    },


    "lucknow": {
        "title": "Lucknow",
        "region": "Uttar Pradesh, India",
        "category": "City & Culture",
        "intro": "Explore Lucknow through Shorts and long videos.",
        "story": "Travel and city experiences from Lucknow.",
        "highlights": [
            "Lucknow",
            "Culture",
            "City",
            "Shorts",
            "Long Videos"
        ],
        "playlist_terms": [
            "lucknow"
        ],
        "filter_tags": [
            "uttar-pradesh",
            "city"
        ],
        "lat": 26.8467,
        "lng": 80.9462
    },


    "bodhgaya": {
        "title": "Bodhgaya",
        "region": "Bihar, India",
        "category": "Spiritual & Heritage",
        "intro": "Explore Bodhgaya travel stories.",
        "story": "Travel and destination experiences from Bodhgaya.",
        "highlights": [
            "Bodhgaya",
            "Bihar",
            "Spiritual",
            "Heritage"
        ],
        "playlist_terms": [
            "bodhgaya"
        ],
        "filter_tags": [
            "bihar",
            "spiritual",
            "heritage"
        ],
        "lat": 24.6950,
        "lng": 84.9914
    },


    "gnsu": {
        "title": "GNSU Campus Stories",
        "region": "Bihar, India",
        "category": "Campus & Events",
        "intro": "GNSU functions, events and college videos.",
        "story": "Campus and event stories from Gopal Narayan Singh University.",
        "highlights": [
            "GNSU",
            "Campus",
            "Events",
            "Functions"
        ],
        "playlist_terms": [
            "gopal narayan singh university",
            "gnsu college"
        ],
        "filter_tags": [
            "bihar",
            "campus"
        ],
        "lat": None,
        "lng": None
    },


    "our-village": {
        "title": "Our Village",
        "region": "Bihar, India",
        "category": "Village & Local Life",
        "intro": "Village life and original local stories.",
        "story": "Explore everyday village experiences through original videos.",
        "highlights": [
            "Village",
            "Local Life",
            "Original Stories",
            "Bihar"
        ],
        "playlist_terms": [
            "our village"
        ],
        "filter_tags": [
            "bihar",
            "village",
            "local"
        ],
        "lat": None,
        "lng": None
    }

}


@app.route("/destinations")
def destinations_page():

    playlists = get_all_youtube_playlists()

    destinations = []

    matched_playlist_ids = set()

    for slug, destination in TRAVEL_DESTINATION_CATALOG.items():

        terms = [
            term.lower()
            for term in destination.get(
                "playlist_terms",
                []
            )
        ]

        destination_playlists = []

        for playlist in playlists:

            title = str(
                playlist.get(
                    "title",
                    ""
                )
            ).lower()

            if any(
                term in title
                for term in terms
            ):
                destination_playlists.append(
                    playlist
                )

                playlist_id = playlist.get(
                    "playlist_id"
                )

                if playlist_id:
                    matched_playlist_ids.add(
                        playlist_id
                    )


        item = dict(destination)

        item["slug"] = slug

        item["playlist_count"] = len(
            destination_playlists
        )

        item["video_count"] = sum(
            int(
                playlist.get(
                    "video_count",
                    0
                )
                or 0
            )
            for playlist
            in destination_playlists
        )

        destinations.append(
            item
        )


    return render_template(
        "destinations.html",

        destinations=destinations,

        public_playlist_count=len(
            playlists
        ),

        matched_playlist_count=len(
            matched_playlist_ids
        )
    )




# ============================================================
# PUBLIC YOUTUBE PLAYLIST EXPLORER
# ============================================================

@app.route("/playlists")
def playlists_page():

    playlists = (
        get_all_youtube_playlists()
    )

    total_playlist_videos = sum(
        playlist.get(
            "video_count",
            0
        )
        for playlist in playlists
    )

    return render_template(
        "playlists.html",
        playlists=playlists,
        playlist_count=len(
            playlists
        ),
        total_playlist_videos=(
            total_playlist_videos
        )
    )




# ============================================================
# DESTINATION DETAIL PAGE
# ============================================================

@app.route("/destination/<slug>")
def destination_detail_page(slug):

    destination = (
        TRAVEL_DESTINATION_CATALOG.get(
            slug
        )
    )


    if destination is None:

        return render_template(
            "404.html"
        ), 404


    # --------------------------------------------------------
    # Get actual YouTube playlists for this destination
    # --------------------------------------------------------

    playlists = []

    try:

        playlists = (
            get_all_youtube_playlists()
        )

    except Exception as error:

        print(
            "Destination playlist fetch error:",
            error
        )


    terms = [
        str(term).lower()
        for term
        in destination.get(
            "playlist_terms",
            []
        )
    ]


    destination_playlists = []


    for playlist in playlists:

        playlist_title = str(
            playlist.get(
                "title",
                ""
            )
        ).lower()


        if any(
            term in playlist_title
            for term in terms
        ):

            destination_playlists.append(
                playlist
            )


    # --------------------------------------------------------
    # Safe destination copy
    # --------------------------------------------------------

    destination_data = dict(
        destination
    )

    destination_data["slug"] = slug


    return render_template(
        "destination_detail.html",

        destination=destination_data,

        destination_slug=slug,

        destination_playlists=(
            destination_playlists
        ),

        playlist_count=len(
            destination_playlists
        ),

        video_count=sum(
            int(
                playlist.get(
                    "video_count",
                    0
                )
                or 0
            )
            for playlist
            in destination_playlists
        )
    )




# ============================================================
# TRAVEL GALLERY
# ============================================================

@app.route("/gallery")
def travel_gallery_page():

    gallery_videos = []

    try:

        gallery_videos = (
            get_latest_videos()
        )

    except Exception as error:

        print(
            "Gallery fetch error:",
            error
        )


    return render_template(
        "gallery.html",

        gallery_videos=(
            gallery_videos[:18]
        )
    )




# ============================================================
# PROFESSIONAL 404
# ============================================================

@app.errorhandler(404)
def page_not_found(error):

    return render_template(
        "404.html"
    ), 404




# ============================================================
# TRAVEL MAP EXPLORER
# ============================================================





# ============================================================
# TRAVEL MAP
# ============================================================

@app.route("/travel-map")
def travel_map_page():

    destinations = [

        {
            "slug": "ranchi",
            "title": "Ranchi",
            "region": "Jharkhand, India",
            "category": "City & Nature",
            "lat": 23.3441,
            "lng": 85.3096
        },

        {
            "slug": "aurangabad-bihar",
            "title": "Aurangabad",
            "region": "Bihar, India",
            "category": "Local Travel",
            "lat": 24.7457,
            "lng": 84.3802
        },

        {
            "slug": "sasaram-rohtas",
            "title": "Sasaram & Rohtas",
            "region": "Bihar, India",
            "category": "Heritage & Nature",
            "lat": 24.9539,
            "lng": 84.0145
        },

        {
            "slug": "patna",
            "title": "Patna",
            "region": "Bihar, India",
            "category": "City Travel",
            "lat": 25.5941,
            "lng": 85.1376
        },

        {
            "slug": "varanasi",
            "title": "Varanasi",
            "region": "Uttar Pradesh, India",
            "category": "Culture & Spiritual",
            "lat": 25.3176,
            "lng": 82.9739
        },

        {
            "slug": "lucknow",
            "title": "Lucknow",
            "region": "Uttar Pradesh, India",
            "category": "City & Culture",
            "lat": 26.8467,
            "lng": 80.9462
        },

        {
            "slug": "bodhgaya",
            "title": "Bodhgaya",
            "region": "Bihar, India",
            "category": "Spiritual & Heritage",
            "lat": 24.6950,
            "lng": 84.9914
        }

    ]

    return render_template(
        "travel_map.html",
        destinations=destinations
    )




# ============================================================
# UNIVERSAL TRAVEL EXPLORER
# ============================================================

@app.route("/explore")
def explore_page():

    playlists = get_all_youtube_playlists()

    destinations = []

    for slug, destination in (
        TRAVEL_DESTINATION_CATALOG.items()
    ):

        item = dict(destination)

        item["slug"] = slug

        destinations.append(
            item
        )


    return render_template(
        "explore.html",

        destinations=destinations,

        playlists=playlists,

        destination_count=len(
            destinations
        ),

        playlist_count=len(
            playlists
        )
    )




# ============================================================
# TECHNICAL BACKEND LAYER
# YouTube Cache + Travel API + Health Check
# ============================================================

YOUTUBE_CACHE = {
    "playlists": None,
    "timestamp": 0
}

YOUTUBE_CACHE_TTL = 900
# 900 seconds = 15 minutes


def get_cached_youtube_playlists():

    current_time = time.time()

    cached_data = YOUTUBE_CACHE.get(
        "playlists"
    )

    cached_time = YOUTUBE_CACHE.get(
        "timestamp",
        0
    )


    cache_age = (
        current_time
        -
        cached_time
    )


    if (
        cached_data is not None
        and
        cache_age < YOUTUBE_CACHE_TTL
    ):

        return cached_data


    try:

        fresh_data = (
            get_all_youtube_playlists()
        )

        YOUTUBE_CACHE["playlists"] = (
            fresh_data
        )

        YOUTUBE_CACHE["timestamp"] = (
            current_time
        )

        return fresh_data


    except Exception as error:

        print(
            "YouTube cache refresh error:",
            error
        )


        if cached_data is not None:

            return cached_data


        return []


# ============================================================
# API - TRAVEL STATS
# ============================================================

@app.route("/api/travel-stats")
def api_travel_stats():

    playlists = (
        get_cached_youtube_playlists()
    )

    destination_count = 0

    if "TRAVEL_DESTINATION_CATALOG" in globals():

        destination_count = len(
            TRAVEL_DESTINATION_CATALOG
        )


    total_playlist_videos = sum(
        int(
            playlist.get(
                "video_count",
                0
            )
            or 0
        )
        for playlist
        in playlists
    )


    return jsonify(
        {
            "status":
                "success",

            "creator":
                "Raj Raushan Official",

            "destinations":
                destination_count,

            "public_playlists":
                len(
                    playlists
                ),

            "playlist_videos":
                total_playlist_videos,

            "cache_seconds":
                YOUTUBE_CACHE_TTL,

            "generated_at":
                datetime.now()
                .isoformat(
                    timespec="seconds"
                )
        }
    )


# ============================================================
# API - DESTINATIONS
# ============================================================

@app.route("/api/destinations")
def api_destinations():

    results = []


    if "TRAVEL_DESTINATION_CATALOG" not in globals():

        return jsonify(
            {
                "status":
                    "success",

                "count":
                    0,

                "destinations":
                    []
            }
        )


    for slug, destination in (
        TRAVEL_DESTINATION_CATALOG.items()
    ):

        results.append(
            {
                "slug":
                    slug,

                "title":
                    destination.get(
                        "title",
                        ""
                    ),

                "region":
                    destination.get(
                        "region",
                        ""
                    ),

                "category":
                    destination.get(
                        "category",
                        ""
                    ),

                "url":
                    (
                        "/destination/"
                        + slug
                    )
            }
        )


    return jsonify(
        {
            "status":
                "success",

            "count":
                len(
                    results
                ),

            "destinations":
                results
        }
    )


# ============================================================
# API - PLAYLISTS
# ============================================================

@app.route("/api/playlists")
def api_playlists():

    playlists = (
        get_cached_youtube_playlists()
    )


    results = []


    for playlist in playlists:

        results.append(
            {
                "title":
                    playlist.get(
                        "title",
                        ""
                    ),

                "video_count":
                    int(
                        playlist.get(
                            "video_count",
                            0
                        )
                        or 0
                    ),

                "thumbnail":
                    playlist.get(
                        "thumbnail",
                        ""
                    ),

                "url":
                    playlist.get(
                        "url",
                        ""
                    )
            }
        )


    return jsonify(
        {
            "status":
                "success",

            "count":
                len(
                    results
                ),

            "playlists":
                results
        }
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health_check():

    return jsonify(
        {
            "status":
                "healthy",

            "application":
                "Raj Raushan Official",

            "service":
                "Flask Travel Platform"
        }
    )


# ============================================================
# MANUAL CACHE REFRESH
# ============================================================

@app.route("/api/cache/refresh")
def refresh_youtube_cache():

    YOUTUBE_CACHE["playlists"] = None

    YOUTUBE_CACHE["timestamp"] = 0


    playlists = (
        get_cached_youtube_playlists()
    )


    return jsonify(
        {
            "status":
                "refreshed",

            "playlists":
                len(
                    playlists
                )
        }
    )





# ============================================================
# GLOBAL SEARCH ANALYTICS
# ============================================================

SEARCH_ANALYTICS_DB = "creator_analytics.db"


def init_search_analytics():

    connection = sqlite3.connect(
        SEARCH_ANALYTICS_DB
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS search_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            result_type TEXT,
            result_title TEXT,
            result_url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


init_search_analytics()


@app.route(
    "/api/search-event",
    methods=["POST"]
)
def api_search_event():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    query = str(
        data.get(
            "query",
            ""
        )
    ).strip()[:80]

    result_type = str(
        data.get(
            "result_type",
            ""
        )
    ).strip()[:30]

    result_title = str(
        data.get(
            "result_title",
            ""
        )
    ).strip()[:150]

    result_url = str(
        data.get(
            "result_url",
            ""
        )
    ).strip()[:500]


    if not query:

        return jsonify(
            {
                "status":
                    "ignored"
            }
        ), 400


    connection = sqlite3.connect(
        SEARCH_ANALYTICS_DB
    )

    connection.execute(
        """
        INSERT INTO search_events
        (
            query,
            result_type,
            result_title,
            result_url
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            query,
            result_type,
            result_title,
            result_url
        )
    )

    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "saved"
        }
    )


@app.route("/api/search-analytics")
def api_search_analytics():

    connection = sqlite3.connect(
        SEARCH_ANALYTICS_DB
    )

    connection.row_factory = (
        sqlite3.Row
    )


    total = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM search_events
        """
    ).fetchone()["total"]


    top_queries = connection.execute(
        """
        SELECT
            LOWER(query) AS query,
            COUNT(*) AS searches
        FROM search_events
        GROUP BY LOWER(query)
        ORDER BY searches DESC
        LIMIT 10
        """
    ).fetchall()


    top_results = connection.execute(
        """
        SELECT
            result_title,
            result_type,
            COUNT(*) AS clicks
        FROM search_events
        WHERE result_title != ''
        GROUP BY
            result_title,
            result_type
        ORDER BY clicks DESC
        LIMIT 10
        """
    ).fetchall()


    recent = connection.execute(
        """
        SELECT
            query,
            result_title,
            result_type,
            created_at
        FROM search_events
        ORDER BY id DESC
        LIMIT 10
        """
    ).fetchall()


    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "total_search_actions":
                total,

            "top_queries":
                [
                    dict(row)
                    for row
                    in top_queries
                ],

            "top_results":
                [
                    dict(row)
                    for row
                    in top_results
                ],

            "recent":
                [
                    dict(row)
                    for row
                    in recent
                ]
        }
    )





# ============================================================
# MONETIZATION / BUSINESS ENQUIRY SYSTEM
# ============================================================

MONETIZATION_DB = "creator_analytics.db"


def init_monetization_database():

    connection = sqlite3.connect(
        MONETIZATION_DB
    )

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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


init_monetization_database()


@app.route("/work-with-me")
def work_with_me_page():

    return render_template(
        "work_with_me.html"
    )


@app.route(
    "/api/brand-enquiry",
    methods=["POST"]
)
def api_brand_enquiry():

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )


    name = str(
        data.get(
            "name",
            ""
        )
    ).strip()[:100]


    email = str(
        data.get(
            "email",
            ""
        )
    ).strip()[:150]


    company = str(
        data.get(
            "company",
            ""
        )
    ).strip()[:150]


    service = str(
        data.get(
            "service",
            ""
        )
    ).strip()[:100]


    budget = str(
        data.get(
            "budget",
            ""
        )
    ).strip()[:100]


    message = str(
        data.get(
            "message",
            ""
        )
    ).strip()[:1500]


    if (
        not name
        or
        not email
        or
        not service
        or
        not message
    ):

        return jsonify(
            {
                "status":
                    "error",

                "message":
                    "Please complete all required fields."
            }
        ), 400


    if (
        "@" not in email
        or
        "." not in email
    ):

        return jsonify(
            {
                "status":
                    "error",

                "message":
                    "Please enter a valid email address."
            }
        ), 400


    connection = sqlite3.connect(
        MONETIZATION_DB
    )

    connection.execute(
        """
        INSERT INTO brand_enquiries
        (
            name,
            email,
            company,
            service,
            budget,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            name,
            email,
            company,
            service,
            budget,
            message
        )
    )

    connection.commit()
    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "message":
                "Your collaboration enquiry has been received."
        }
    )


@app.route("/api/monetization-stats")
def api_monetization_stats():

    connection = sqlite3.connect(
        MONETIZATION_DB
    )

    connection.row_factory = (
        sqlite3.Row
    )


    total = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM brand_enquiries
        """
    ).fetchone()["total"]


    new_leads = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM brand_enquiries
        WHERE status = 'new'
        """
    ).fetchone()["total"]


    service_rows = connection.execute(
        """
        SELECT
            service,
            COUNT(*) AS enquiries
        FROM brand_enquiries
        GROUP BY service
        ORDER BY enquiries DESC
        LIMIT 10
        """
    ).fetchall()


    connection.close()


    return jsonify(
        {
            "status":
                "success",

            "total_enquiries":
                total,

            "new_enquiries":
                new_leads,

            "top_services":
                [
                    dict(row)
                    for row
                    in service_rows
                ]
        }
    )





# ============================================================
# PRIVATE MONETIZATION ADMIN
# ============================================================

from monetization_admin import monetization_admin_bp

app.register_blueprint(
    monetization_admin_bp
)


if __name__ == "__main__":

    print(
        "Starting Raj Raushan Official..."
    )

    app.run(
        debug=True
    )
