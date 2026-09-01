import os
import time
from pathlib import Path

import pandas as pd
import requests

from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_HANDLE = "@rajraushanofficial"

OUTPUT_FILE = Path(
    "data/youtube_video_history.csv"
)


# ============================================================
# REQUEST SESSION WITH RETRY
# ============================================================

session = requests.Session()

retry_strategy = Retry(
    total=3,
    connect=3,
    read=3,
    backoff_factor=2,
    status_forcelist=[
        429,
        500,
        502,
        503,
        504
    ],
    allowed_methods=[
        "GET"
    ]
)

adapter = HTTPAdapter(
    max_retries=retry_strategy
)

session.mount(
    "https://",
    adapter
)


def youtube_get(url, params):

    try:

        response = session.get(
            url,
            params=params,

            # 7 sec connection,
            # 20 sec response wait
            timeout=(7, 20)
        )

        response.raise_for_status()

        return response.json()

    except requests.exceptions.Timeout:

        raise RuntimeError(
            "YouTube API timeout. "
            "Internet connection slow hai ya Google API response nahi de raha."
        )

    except requests.exceptions.ConnectionError as error:

        raise RuntimeError(
            f"YouTube API connection failed: {error}"
        )

    except requests.exceptions.HTTPError as error:

        try:
            details = response.json()
        except Exception:
            details = response.text

        raise RuntimeError(
            f"YouTube API HTTP error: {error}\n{details}"
        )


# ============================================================
# GET UPLOAD PLAYLIST
# ============================================================

def get_upload_playlist():

    print(
        "[1/3] Finding YouTube channel..."
    )

    data = youtube_get(
        "https://www.googleapis.com/youtube/v3/channels",
        {
            "part": "contentDetails",
            "forHandle": CHANNEL_HANDLE,
            "key": API_KEY
        }
    )

    items = data.get(
        "items",
        []
    )

    if not items:

        raise RuntimeError(
            "YouTube channel not found."
        )

    playlist_id = (
        items[0]
        ["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )

    print(
        "Channel found."
    )

    return playlist_id


# ============================================================
# GET VIDEO IDS
# ============================================================

def get_video_ids(
    playlist_id,
    limit=100
):

    print(
        "[2/3] Fetching video IDs..."
    )

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
            params["pageToken"] = (
                page_token
            )

        data = youtube_get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params
        )

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

        print(
            f"Video IDs collected: {len(video_ids)}"
        )

        page_token = data.get(
            "nextPageToken"
        )

        if not page_token:
            break

    return video_ids


# ============================================================
# FETCH VIDEO DETAILS
# ============================================================

def fetch_video_data(
    video_ids
):

    print(
        "[3/3] Fetching video statistics..."
    )

    records = []

    batches = list(
        range(
            0,
            len(video_ids),
            50
        )
    )

    for number, start in enumerate(
        batches,
        start=1
    ):

        batch = video_ids[
            start:start + 50
        ]

        print(
            f"Fetching batch {number}/{len(batches)}..."
        )

        data = youtube_get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                "part":
                    "snippet,statistics,contentDetails",

                "id":
                    ",".join(batch),

                "key":
                    API_KEY
            }
        )

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

            title_lower = (
                title.lower()
            )

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
                        (
                            "https://www.youtube.com/watch?v="
                            + item.get(
                                "id",
                                ""
                            )
                        )
                }
            )

        time.sleep(0.5)

    return records


# ============================================================
# BUILD DATASET
# ============================================================

def build_dataset():

    if not API_KEY:

        raise RuntimeError(
            "YOUTUBE_API_KEY missing from .env"
        )

    print()
    print(
        "========================================"
    )
    print(
        " YOUTUBE DATASET BUILDER"
    )
    print(
        "========================================"
    )
    print()

    playlist_id = (
        get_upload_playlist()
    )

    video_ids = get_video_ids(
        playlist_id,
        limit=100
    )

    if not video_ids:

        raise RuntimeError(
            "No videos found."
        )

    records = fetch_video_data(
        video_ids
    )

    if not records:

        raise RuntimeError(
            "No video statistics returned."
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

    safe_views = (
        df["views"]
        .replace(
            0,
            pd.NA
        )
    )

    df["engagement_rate"] = (
        (
            df["engagement"]
            / safe_views
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
        "========================================"
    )
    print(
        " DATASET CREATED SUCCESSFULLY"
    )
    print(
        "========================================"
    )

    print(
        f"Videos : {len(df)}"
    )

    print(
        f"Columns: {len(df.columns)}"
    )

    print(
        f"Saved  : {OUTPUT_FILE}"
    )


if __name__ == "__main__":

    try:

        build_dataset()

    except KeyboardInterrupt:

        print()
        print(
            "Process manually stopped."
        )

    except Exception as error:

        print()
        print(
            "DATASET BUILD FAILED"
        )

        print(
            error
        )
