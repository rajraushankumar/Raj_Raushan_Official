from pathlib import Path
import re

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


DATA_FILE = Path("data/youtube_video_history.csv")
MODEL_DIR = Path("models")
MODEL_FILE = MODEL_DIR / "video_performance_model.joblib"
REPORT_FILE = Path("data/model_evaluation.csv")


def duration_to_seconds(value):

    value = str(value)

    hours = re.search(r"(\d+)H", value)
    minutes = re.search(r"(\d+)M", value)
    seconds = re.search(r"(\d+)S", value)

    total = 0

    if hours:
        total += int(hours.group(1)) * 3600

    if minutes:
        total += int(minutes.group(1)) * 60

    if seconds:
        total += int(seconds.group(1))

    return total


def main():

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_FILE}"
        )

    print()
    print("========================================")
    print(" ML VIDEO PERFORMANCE TRAINING")
    print("========================================")

    df = pd.read_csv(DATA_FILE)

    required = {
        "title",
        "published_at",
        "views",
        "duration",
        "has_short_tag"
    }

    missing = required - set(df.columns)

    if missing:
        raise RuntimeError(
            "Missing columns: "
            + ", ".join(sorted(missing))
        )

    df["views"] = pd.to_numeric(
        df["views"],
        errors="coerce"
    ).fillna(0)

    df["published_at"] = pd.to_datetime(
        df["published_at"],
        errors="coerce",
        utc=True
    )

    df = df.dropna(
        subset=["published_at"]
    ).copy()

    df["upload_day"] = (
        df["published_at"]
        .dt.day_name()
    )

    df["upload_hour"] = (
        df["published_at"]
        .dt.tz_convert("Asia/Kolkata")
        .dt.hour
    )

    df["duration_seconds"] = (
        df["duration"]
        .apply(duration_to_seconds)
    )

    df["has_short_tag"] = (
        df["has_short_tag"]
        .astype(str)
        .str.lower()
        .isin(["true", "1", "yes"])
        .astype(int)
    )

    # -----------------------------------------
    # PERFORMANCE CLASSES
    # -----------------------------------------

    low_threshold = float(
        df["views"].quantile(0.33)
    )

    high_threshold = float(
        df["views"].quantile(0.67)
    )

    def performance_class(views):

        if views <= low_threshold:
            return "Low"

        if views >= high_threshold:
            return "High"

        return "Medium"

    df["performance_class"] = (
        df["views"]
        .apply(performance_class)
    )

    print()
    print("Performance thresholds:")
    print(
        f"Low    : <= {low_threshold:.0f} views"
    )
    print(
        f"Medium : between thresholds"
    )
    print(
        f"High   : >= {high_threshold:.0f} views"
    )

    print()
    print("Class distribution:")
    print(
        df["performance_class"]
        .value_counts()
        .to_string()
    )

    if df["performance_class"].nunique() < 2:
        raise RuntimeError(
            "Not enough variation in views to train model."
        )

    feature_columns = [
        "title",
        "upload_day",
        "upload_hour",
        "duration_seconds",
        "has_short_tag"
    ]

    X = df[feature_columns]
    y = df["performance_class"]

    stratify_value = None

    class_counts = y.value_counts()

    if class_counts.min() >= 2:
        stratify_value = y

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.25,
            random_state=42,
            stratify=stratify_value
        )
    )

    # -----------------------------------------
    # PREPROCESSING
    # -----------------------------------------

    preprocessing = ColumnTransformer(
        transformers=[
            (
                "title",
                TfidfVectorizer(
                    max_features=500,
                    ngram_range=(1, 2),
                    stop_words="english"
                ),
                "title"
            ),

            (
                "categories",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                ["upload_day"]
            ),

            (
                "numeric",
                StandardScaler(),
                [
                    "upload_hour",
                    "duration_seconds",
                    "has_short_tag"
                ]
            )
        ]
    )

    model = Pipeline(
        steps=[
            (
                "preprocessing",
                preprocessing
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ]
    )

    print()
    print("Training model...")

    model.fit(
        X_train,
        y_train
    )

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print()
    print("========================================")
    print(" MODEL TRAINING COMPLETE")
    print("========================================")
    print(
        f"Test Accuracy: {accuracy * 100:.2f}%"
    )

    print()
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    evaluation = pd.DataFrame({
        "Actual": y_test.values,
        "Predicted": predictions
    })

    evaluation.to_csv(
        REPORT_FILE,
        index=False
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    model_package = {
        "model": model,
        "low_view_threshold": low_threshold,
        "high_view_threshold": high_threshold,
        "training_rows": len(df),
        "features": feature_columns
    }

    joblib.dump(
        model_package,
        MODEL_FILE
    )

    print(
        f"Model saved: {MODEL_FILE}"
    )

    print(
        f"Evaluation saved: {REPORT_FILE}"
    )

    print()
    print(
        "NOTE: This is a prototype ML model."
    )
    print(
        "Accuracy will improve as more channel data is collected."
    )


if __name__ == "__main__":
    main()
