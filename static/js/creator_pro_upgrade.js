
document.addEventListener("DOMContentLoaded", function () {

    const elements =
        document.querySelectorAll(".rr-pro-reveal");

    if (!("IntersectionObserver" in window)) {

        elements.forEach(function (element) {
            element.classList.add("rr-pro-visible");
        });

        return;
    }

    const observer =
        new IntersectionObserver(

            function (entries, observerInstance) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "rr-pro-visible"
                        );

                        observerInstance.unobserve(
                            entry.target
                        );
                    }

                });

            },

            {
                threshold: 0.12
            }

        );


    elements.forEach(function (element) {
        observer.observe(element);
    });

});
