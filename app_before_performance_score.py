import os
import requests
import pandas as pd
import plotly.express as px

from datetime import datetime
from flask import Flask, render_template
from dotenv import load_dotenv


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

        creator_recommendation=creator_recommendation,
        recommendation_score=recommendation_score
    )
# ==========================================
# RUN FLASK WEBSITE
# ==========================================

if __name__ == "__main__":

    print(
        "Starting Raj Raushan Official..."
    )

    app.run(
        debug=True
    )