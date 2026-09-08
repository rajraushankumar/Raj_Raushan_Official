document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (window.__rrCreatorAvatarLoaded) {
            return;
        }

        window.__rrCreatorAvatarLoaded = true;

        const avatarPath =
            "/static/images/rajraushan_dp.jpg";

        const candidates =
            document.querySelectorAll(
                "header *, nav *, .logo-mark, .brand-mark, .rr-logo"
            );

        candidates.forEach(
            function (element) {

                const text =
                    element.textContent
                    .trim()
                    .toUpperCase();

                if (
                    element.children.length === 0
                    &&
                    text === "RR"
                ) {

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.src =
                        avatarPath;

                    image.alt =
                        "Rajraushan Kumar";

                    image.className =
                        "rr-brand-avatar";

                    image.loading =
                        "eager";

                    element.innerHTML =
                        "";

                    element.classList.add(
                        "rr-brand-avatar-wrap"
                    );

                    element.appendChild(
                        image
                    );

                }

            }
        );

    }
);
