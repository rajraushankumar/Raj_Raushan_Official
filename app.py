import os
import requests

from datetime import datetime
from flask import Flask, render_template
from dotenv import load_dotenv


# =========================
# BASIC SETUP
# =========================

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("YOUTUBE_API_KEY")
MAIN_CHANNEL = "@rajraushanofficial"
SECOND_CHANNEL = "@rajraushanofficial02"


# =========================
# GET LATEST VIDEOS
# =========================

def get_latest_videos():

    if not API_KEY:
        print("YouTube API key not found")
        return []

    try:

        # Get channel uploads playlist
        channel_url = "https://www.googleapis.com/youtube/v3/channels"

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
            print("Channel not found")
            return []

        playlist_id = (
            channel_data["items"][0]
            ["contentDetails"]
            ["relatedPlaylists"]
            ["uploads"]
        )


        # Get latest uploads
        playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems"

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

            snippet = item["snippet"]

            video_id = snippet["resourceId"]["videoId"]

            video_ids.append(video_id)


            # Upload date
            raw_date = snippet.get("publishedAt", "")

            try:
                upload_date = datetime.strptime(
                    raw_date,
                    "%Y-%m-%dT%H:%M:%SZ"
                ).strftime("%d %b %Y")

            except ValueError:
                upload_date = raw_date


            # Thumbnail
            thumbnails = snippet.get("thumbnails", {})

            if "high" in thumbnails:
                thumbnail = thumbnails["high"]["url"]

            elif "medium" in thumbnails:
                thumbnail = thumbnails["medium"]["url"]

            else:
                thumbnail = thumbnails.get(
                    "default",
                    {}
                ).get("url", "")


            videos.append({
                "title": snippet.get("title", "YouTube Video"),
                "thumbnail": thumbnail,
                "video_id": video_id,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "published_at": upload_date,
                "views": "0"
            })


        # =========================
        # GET VIDEO VIEWS
        # =========================

        if video_ids:

            stats_url = "https://www.googleapis.com/youtube/v3/videos"

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

                views_map[item["id"]] = (
                    item.get("statistics", {})
                    .get("viewCount", "0")
                )


            for video in videos:

                video["views"] = views_map.get(
                    video["video_id"],
                    "0"
                )


        print("Total videos:", len(videos))

        return videos


    except Exception as error:

        print("YouTube Error:", error)

        return []


# =========================
# GET CHANNEL INFORMATION
# =========================

def get_channel_info(channel_handle):

    try:
        url = "https://www.googleapis.com/youtube/v3/channels"

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
            return None

        channel = data["items"][0]

        return {
            "name": channel["snippet"]["title"],

            "handle": channel_handle,

            "profile_image":
                channel["snippet"]["thumbnails"]["high"]["url"],

            "subscribers":
                channel["statistics"].get("subscriberCount", "0"),

            "views":
                channel["statistics"].get("viewCount", "0"),

            "videos":
                channel["statistics"].get("videoCount", "0"),

            "url":
                f"https://www.youtube.com/{channel_handle}"
        }

    except Exception as error:

        print("CHANNEL ERROR:", error)

        return None
    
# =========================
# HOME PAGE
# =========================
@app.route("/")
def home():

    videos = get_latest_videos()

    channel1 = get_channel_info(MAIN_CHANNEL)
    channel2 = get_channel_info(SECOND_CHANNEL)

    vlogs = []
    shorts = []

    for video in videos:

        title = video["title"].lower()

        if "#shorts" in title or "#youtubeshorts" in title:
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
# =========================
# RUN WEBSITE
# =========================

if __name__ == "__main__":

    print("Starting Raj Raushan Official...")

    app.run(debug=True)