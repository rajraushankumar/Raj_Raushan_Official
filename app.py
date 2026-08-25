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


            # Add views to videos

            for video in videos:

                video["views"] = views_map.get(
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
            include_plotlyjs=False
        )

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
        time_chart=time_chart
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