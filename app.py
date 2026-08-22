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
# GET LATEST VIDEOS FROM MAIN CHANNEL
# ==========================================

def get_latest_videos():

    if not API_KEY:
        print("YouTube API key not found")
        return []

    try:

        # -------------------------------
        # 1. GET CHANNEL UPLOAD PLAYLIST
        # -------------------------------

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


        # -------------------------------
        # 2. GET LATEST VIDEOS
        # -------------------------------

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

            snippet = item.get("snippet", {})

            resource_id = snippet.get(
                "resourceId",
                {}
            )

            video_id = resource_id.get("videoId")


            if not video_id:
                continue


            video_ids.append(video_id)


            # -------------------------------
            # UPLOAD DATE
            # -------------------------------

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


            # -------------------------------
            # THUMBNAIL
            # -------------------------------

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


            # -------------------------------
            # ADD VIDEO DATA
            # -------------------------------

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

                "views":
                    "0"
            })


        # ==================================
        # 3. GET VIDEO VIEW COUNTS
        # ==================================

        if video_ids:

            stats_url = (
                "https://www.googleapis.com/youtube/v3/videos"
            )

            stats_params = {
                "part": "statistics",
                "id": ",".join(video_ids),
                "key": API_KEY
            }

            stats_response = requests.get(
                stats_url,
                params=stats_params,
                timeout=10
            )

            stats_data = stats_response.json()

            views_map = {}


            for item in stats_data.get("items", []):

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


            # Add views to each video

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
            "part": "snippet,statistics",
            "forHandle": channel_handle,
            "key": API_KEY
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


    # Separate Vlogs and Shorts

    for video in videos:

        title = video["title"].lower()

        if (
            "#shorts" in title
            or "#youtubeshorts" in title
        ):

            shorts.append(video)

        else:

            vlogs.append(video)


    return render_template(

        "index.html",

        vlogs=vlogs,

        shorts=shorts,

        channel1=channel1,

        channel2=channel2
    )


# ==========================================
# PRIVATE CREATOR ANALYTICS DASHBOARD
# ==========================================

@app.route("/dashboard")
def dashboard():

    videos = get_latest_videos()
    channel = get_channel_info(MAIN_CHANNEL)

    vlogs = []
    shorts = []

    for video in videos:
        title = video["title"].lower()

        if "#shorts" in title or "#youtubeshorts" in title:
            shorts.append(video)
        else:
            vlogs.append(video)

    # ======================================
    # DATA SCIENCE ANALYSIS
    # ======================================

    recent_total_views = 0
    average_views = 0
    views_chart = None
    top_video = None

    vlog_average_views = 0
    short_average_views = 0
    content_chart = None
    best_content_type = "No Data"

    if videos:

        # Convert API data into Pandas DataFrame
        df = pd.DataFrame(videos)

        # Convert views into numeric values
        df["views"] = pd.to_numeric(
            df["views"],
            errors="coerce"
        ).fillna(0)

        # -------------------------------
        # BASIC ANALYTICS
        # -------------------------------

        recent_total_views = int(df["views"].sum())
        average_views = int(df["views"].mean())

        # -------------------------------
        # VLOGS VS SHORTS ANALYSIS
        # -------------------------------

        df["content_type"] = df["title"].apply(
            lambda title: "Short"
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

        # -------------------------------
        # RECENT VIDEO VIEWS CHART
        # -------------------------------

        df["short_title"] = df["title"].str.slice(0, 35)

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

        # -------------------------------
        # VLOGS VS SHORTS CHART
        # -------------------------------

        comparison_data = pd.DataFrame({
            "Content Type": ["Vlogs", "Shorts"],
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

        # -------------------------------
        # TOP PERFORMING RECENT VIDEO
        # -------------------------------

        top_video = max(
            videos,
            key=lambda video: int(video["views"])
        )

    return render_template(
        "dashboard.html",
        channel=channel,
        videos=videos,
        vlogs=vlogs,
        shorts=shorts,
        top_video=top_video,
        recent_total_views=recent_total_views,
        average_views=average_views,
        views_chart=views_chart,
        vlog_average_views=vlog_average_views,
        short_average_views=short_average_views,
        best_content_type=best_content_type,
        content_chart=content_chart
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