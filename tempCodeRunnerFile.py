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
