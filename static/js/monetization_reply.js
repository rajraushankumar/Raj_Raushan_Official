document.addEventListener(
    "DOMContentLoaded",
    function () {

        const csrf =
            document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || "";


        document
            .querySelectorAll(
                ".lead-card"
            )
            .forEach(
                function (card) {

                    const generateButton =
                        card.querySelector(
                            ".generate-reply"
                        );


                    const copyButton =
                        card.querySelector(
                            ".copy-reply"
                        );


                    const emailButton =
                        card.querySelector(
                            ".open-email"
                        );


                    const textarea =
                        card.querySelector(
                            ".generated-reply"
                        );


                    const tone =
                        card.querySelector(
                            ".reply-tone"
                        );


                    const status =
                        card.querySelector(
                            ".reply-status"
                        );


                    if (
                        !generateButton
                        ||
                        !textarea
                    ) {
                        return;
                    }


                    let email = "";
                    let subject = "";


                    generateButton.addEventListener(
                        "click",
                        async function () {

                            const leadId =
                                card.dataset.leadId;


                            generateButton.disabled =
                                true;


                            generateButton.textContent =
                                "Generating...";


                            status.textContent =
                                "";


                            try {

                                const response =
                                    await fetch(
                                        `/api/monetization/reply/${leadId}`,
                                        {
                                            method:
                                                "POST",

                                            headers:
                                                {
                                                    "Content-Type":
                                                        "application/json",

                                                    "X-CSRF-Token":
                                                        csrf
                                                },

                                            body:
                                                JSON.stringify(
                                                    {
                                                        tone:
                                                            tone.value
                                                    }
                                                )
                                        }
                                    );


                                const data =
                                    await response.json();


                                if (!response.ok) {

                                    throw new Error(
                                        data.message
                                        ||
                                        "Unable to generate reply."
                                    );
                                }


                                textarea.value =
                                    data.reply;


                                email =
                                    data.email
                                    || "";


                                subject =
                                    data.subject
                                    || "Collaboration";


                                copyButton.disabled =
                                    false;


                                emailButton.disabled =
                                    !email;


                                status.style.color =
                                    "#147a47";


                                status.textContent =
                                    "Reply generated successfully.";


                            } catch (error) {

                                status.style.color =
                                    "#c33131";


                                status.textContent =
                                    error.message;


                            } finally {

                                generateButton.disabled =
                                    false;


                                generateButton.textContent =
                                    "Generate Reply";

                            }

                        }
                    );


                    copyButton.addEventListener(
                        "click",
                        async function () {

                            if (!textarea.value) {
                                return;
                            }


                            try {

                                await navigator
                                    .clipboard
                                    .writeText(
                                        textarea.value
                                    );


                                status.style.color =
                                    "#147a47";


                                status.textContent =
                                    "Reply copied to clipboard.";


                            } catch (error) {

                                textarea.select();

                                document.execCommand(
                                    "copy"
                                );


                                status.textContent =
                                    "Reply copied.";

                            }

                        }
                    );


                    emailButton.addEventListener(
                        "click",
                        function () {

                            if (
                                !email
                                ||
                                !textarea.value
                            ) {
                                return;
                            }


                            const url =
                                "mailto:"
                                +
                                encodeURIComponent(
                                    email
                                )
                                +
                                "?subject="
                                +
                                encodeURIComponent(
                                    subject
                                )
                                +
                                "&body="
                                +
                                encodeURIComponent(
                                    textarea.value
                                );


                            window.location.href =
                                url;

                        }
                    );

                }
            );

    }
);
