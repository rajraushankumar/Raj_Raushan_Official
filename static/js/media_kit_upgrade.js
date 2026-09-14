
document.addEventListener("DOMContentLoaded", function () {

    const elements =
        document.querySelectorAll(".rr-media-reveal");


    if (!("IntersectionObserver" in window)) {

        elements.forEach(function (element) {

            element.classList.add(
                "rr-media-visible"
            );

        });

        return;
    }


    const observer =
        new IntersectionObserver(

            function (entries, instance) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "rr-media-visible"
                    );


                    instance.unobserve(
                        entry.target
                    );

                });

            },

            {
                threshold: 0.10
            }

        );


    elements.forEach(function (element) {

        observer.observe(element);

    });

});
