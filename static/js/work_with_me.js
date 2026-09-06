document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "brandEnquiryForm"
            );

        const service =
            document.getElementById(
                "leadService"
            );

        const status =
            document.getElementById(
                "formStatus"
            );

        const submitButton =
            document.getElementById(
                "submitEnquiry"
            );


        document
            .querySelectorAll(
                ".service-card button"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const card =
                                button.closest(
                                    ".service-card"
                                );

                            if (
                                card
                                &&
                                service
                            ) {

                                service.value =
                                    card.dataset.service
                                    || "";

                            }


                            document
                                .getElementById(
                                    "enquiry"
                                )
                                .scrollIntoView(
                                    {
                                        behavior:
                                            "smooth",

                                        block:
                                            "start"
                                    }
                                );

                        }
                    );

                }
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                status.className =
                    "form-status";

                status.textContent =
                    "";


                const payload = {

                    name:
                        document
                        .getElementById(
                            "leadName"
                        )
                        .value
                        .trim(),

                    email:
                        document
                        .getElementById(
                            "leadEmail"
                        )
                        .value
                        .trim(),

                    company:
                        document
                        .getElementById(
                            "leadCompany"
                        )
                        .value
                        .trim(),

                    service:
                        document
                        .getElementById(
                            "leadService"
                        )
                        .value,

                    budget:
                        document
                        .getElementById(
                            "leadBudget"
                        )
                        .value,

                    message:
                        document
                        .getElementById(
                            "leadMessage"
                        )
                        .value
                        .trim()
                };


                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Sending...";


                try {

                    const response =
                        await fetch(
                            "/api/brand-enquiry",
                            {
                                method:
                                    "POST",

                                headers:
                                    {
                                        "Content-Type":
                                            "application/json"
                                    },

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message
                            ||
                            "Unable to send enquiry."
                        );

                    }


                    status.classList.add(
                        "success"
                    );

                    status.textContent =
                        "Enquiry received successfully. Thank you for your interest.";


                    form.reset();


                } catch (error) {

                    status.classList.add(
                        "error"
                    );

                    status.textContent =
                        error.message;

                } finally {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Send Business Enquiry";

                }

            }
        );

    }
);

// ==========================================================
// FORM STATUS CLEANUP
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "brandEnquiryForm"
            );

        const status =
            document.getElementById(
                "formStatus"
            );

        if (!form || !status) {
            return;
        }


        function clearStatus() {

            status.textContent = "";

            status.classList.remove(
                "success",
                "error"
            );

        }


        form.querySelectorAll(
            "input, select, textarea"
        ).forEach(
            function (field) {

                field.addEventListener(
                    "input",
                    clearStatus
                );

                field.addEventListener(
                    "change",
                    clearStatus
                );

                field.addEventListener(
                    "invalid",
                    clearStatus
                );

            }
        );

    }
);
