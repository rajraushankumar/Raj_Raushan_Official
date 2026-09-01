import os
import requests
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path


load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_HANDLE = "@rajraushanofficial"

OUTPUT_FILE = Path(
    "data/youtube_video_history.csv"
)


def get_upload_playlist():

    response = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={
            "part": "contentDetails",
            "forHandle": CHANNEL_HANDLE,
            "key": API_KEY
        },
        timeout=20
    )

    response.raise_for_status()

    data = response.json()

    items = data.get("items", [])

    if not items:
        raise RuntimeError(
            "YouTube channel not found."
        )

    return (
        items[0]
        ["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )


def get_video_ids(
    playlist_id,
    limit=100
):

    video_ids = []
    page_token = None

    while len(video_ids) < limit:

        params = {
            "part": "contentDetails",
            "playlistId": playlist_id,
            "maxResults": 50,
            "key": API_KEY
        }

        if page_token:
            params["pageToken"] = page_token

        response = requests.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params=params,
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        for item in data.get(
            "items",
            []
        ):

            video_id = (
                item
                .get(
                    "contentDetails",
                    {}
                )
                .get(
                    "videoId"
                )
            )

            if video_id:
                video_ids.append(
                    video_id
                )

            if len(video_ids) >= limit:
                break

        page_token = data.get(
            "nextPageToken"
        )

        if not page_token:
            break

    return video_ids


def fetch_video_data(video_ids):

    records = []

    for start in range(
        0,
        len(video_ids),
        50
    ):

        batch = video_ids[
            start:start + 50
        ]

        response = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(batch),
                "key": API_KEY
            },
            timeout=20
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

            stats = item.get(
                "statistics",
                {}
            )

            content = item.get(
                "contentDetails",
                {}
            )

            title = snippet.get(
                "title",
                ""
            )

            title_lower = title.lower()

            records.append(
                {
                    "video_id":
                        item.get(
                            "id",
                            ""
                        ),

                    "title":
                        title,

                    "published_at":
                        snippet.get(
                            "publishedAt",
                            ""
                        ),

                    "views":
                        int(
                            stats.get(
                                "viewCount",
                                0
                            )
                        ),

                    "likes":
                        int(
                            stats.get(
                                "likeCount",
                                0
                            )
                        ),

                    "comments":
                        int(
                            stats.get(
                                "commentCount",
                                0
                            )
                        ),

                    "duration":
                        content.get(
                            "duration",
                            ""
                        ),

                    "has_short_tag":
                        (
                            "#shorts"
                            in title_lower
                            or
                            "#youtubeshorts"
                            in title_lower
                        ),

                    "url":
                        "https://www.youtube.com/watch?v="
                        + item.get(
                            "id",
                            ""
                        )
                }
            )

    return records


def build_dataset():

    if not API_KEY:
        raise RuntimeError(
            "YOUTUBE_API_KEY missing from .env"
        )

    print(
        "Fetching YouTube data..."
    )

    playlist_id = (
        get_upload_playlist()
    )

    video_ids = get_video_ids(
        playlist_id,
        limit=100
    )

    print(
        f"Videos found: {len(video_ids)}"
    )

    records = fetch_video_data(
        video_ids
    )

    if not records:
        raise RuntimeError(
            "No video data returned."
        )

    df = pd.DataFrame(
        records
    )

    df["published_at"] = (
        pd.to_datetime(
            df["published_at"],
            errors="coerce",
            utc=True
        )
    )

    df["engagement"] = (
        df["likes"]
        + df["comments"]
    )

    df["engagement_rate"] = (
        (
            df["engagement"]
            / df["views"].replace(
                0,
                pd.NA
            )
        )
        * 100
    ).fillna(0).round(2)

    df = df.sort_values(
        "published_at",
        ascending=False
    )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print()
    print(
        "YOUTUBE DATASET CREATED SUCCESSFULLY"
    )
    print(
        f"Rows: {len(df)}"
    )
    print(
        f"Columns: {len(df.columns)}"
    )
    print(
        f"Saved: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    build_dataset()
