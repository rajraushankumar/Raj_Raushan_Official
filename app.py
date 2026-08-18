import os
import requests

from datetime import datetime
from flask import Flask, render_template
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_HANDLE = "@rajraushanofficial"


def get_latest_videos():

    if not API_KEY:
        print("YouTube API key not found")
        return []

    try:

        # Channel details
        channel_url = "https://www.googleapis.com/youtube/v3/channels"

        channel_params = {
            "part": "contentDetails",
            "forHandle": CHANNEL_HANDLE,
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

        # Upload playlist ID
        playlist_id = (
            channel_data["items"][0]
            ["contentDetails"]
            ["relatedPlaylists"]
            ["uploads"]
        )

        # Latest videos
        playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems"

        playlist_params = {
            "part": "snippet",
            "playlistId": playlist_id,
            "maxResults": 6,
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

            # Date
            raw_date = snippet.get("publishedAt", "")

            try:
                upload_date = datetime.strptime(
                    raw_date,
                    "%Y-%m-%dT%H:%M:%SZ"
                ).strftime("%d %b %Y")

            except:
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


        # Get views
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


@app.route("/")
def home():

    videos = get_latest_videos()

    return render_template(
        "index.html",
        videos=videos
    )


if __name__ == "__main__":
    app.run(debug=True)