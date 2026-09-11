"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const grid =
        document.querySelector(".channels-section .channel-grid") ||
        document.querySelector(".channels-section .channels-grid") ||
        document.querySelector(".channel-grid") ||
        document.querySelector(".channels-grid");

    if (!grid) {
        console.warn("YouTube channel grid not found.");
        return;
    }


    /*
     Remove old Instagram cards if script reloads.
    */

    grid.querySelectorAll(".rr-instagram-card")
        .forEach(card => card.remove());


    grid.classList.add("rr-four-channel-grid");


    const youtubeCards =
        Array.from(
            grid.querySelectorAll(".channel-card:not(.rr-instagram-card)")
        ).slice(0, 2);


    const instagramProfiles = [

        {
            name: "Raj Raushan Official",
            handle: "@rajraushanofficial",
            posts: "190",
            followers: "230",
            following: "85",
            url: "https://www.instagram.com/rajraushanofficial/",
            image: "/static/images/rajraushan_dp.jpg"
        },

        {
            name: "Rajraushan Singh Rajput",
            handle: "@rajraushan_singh_rajputt",
            posts: "102",
            followers: "175",
            following: "72",
            url: "https://www.instagram.com/rajraushan_singh_rajputt/",
            image: "/static/images/instagram_rajputt.jpg"
        }

    ];


    function createInstagramCard(profile) {

        const card =
            document.createElement("article");

        card.className =
            "channel-card rr-instagram-card";


        card.innerHTML = `

            <div class="rr-instagram-profile-ring">

                <img
                    class="rr-instagram-profile-image"
                    src="${profile.image}"
                    alt="${profile.name}"
                    loading="lazy"
                >

            </div>


            <div class="rr-instagram-card-content">

                <div class="rr-instagram-badge">
                    Instagram
                </div>


                <h3>
                    ${profile.name}
                </h3>


                <p class="rr-instagram-handle">
                    ${profile.handle}
                </p>


                <div class="channel-stats rr-instagram-stats">

                    <div>

                        <strong>
                            ${profile.posts}
                        </strong>

                        <span>
                            Posts
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${profile.followers}
                        </strong>

                        <span>
                            Followers
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${profile.following}
                        </strong>

                        <span>
                            Following
                        </span>

                    </div>

                </div>


                <a
                    class="channel-btn rr-instagram-button"
                    href="${profile.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Instagram
                </a>

            </div>

        `;


        /*
         Second image fallback:
         if instagram_rajputt.jpg doesn't exist yet,
         use main DP instead of showing broken image.
        */

        const image =
            card.querySelector(
                ".rr-instagram-profile-image"
            );


        image.addEventListener(
            "error",
            () => {

                if (
                    !image.src.includes(
                        "rajraushan_dp.jpg"
                    )
                ) {

                    image.src =
                        "/static/images/rajraushan_dp.jpg";

                }

            },
            {
                once: true
            }
        );


        return card;
    }


    const instagramCard1 =
        createInstagramCard(
            instagramProfiles[0]
        );


    const instagramCard2 =
        createInstagramCard(
            instagramProfiles[1]
        );


    /*
     Desired desktop order:

     YouTube 1 | Instagram 1
     YouTube 2 | Instagram 2
    */

    if (youtubeCards[0]) {

        youtubeCards[0].after(
            instagramCard1
        );

    }
    else {

        grid.appendChild(
            instagramCard1
        );

    }


    if (youtubeCards[1]) {

        youtubeCards[1].after(
            instagramCard2
        );

    }
    else {

        grid.appendChild(
            instagramCard2
        );

    }

});