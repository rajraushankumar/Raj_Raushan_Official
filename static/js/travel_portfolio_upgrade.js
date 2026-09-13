
document.addEventListener("DOMContentLoaded", function () {

    const elements =
        document.querySelectorAll(".rr-travel-reveal");

    if (!("IntersectionObserver" in window)) {

        elements.forEach(function (element) {
            element.classList.add("rr-travel-visible");
        });

        return;
    }

    const observer =
        new IntersectionObserver(

            function (entries, instance) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "rr-travel-visible"
                        );

                        instance.unobserve(
                            entry.target
                        );
                    }

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
