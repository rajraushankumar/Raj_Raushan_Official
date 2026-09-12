
document.addEventListener("DOMContentLoaded", function () {

    const sections =
        document.querySelectorAll(".rr-about-reveal");

    if (!("IntersectionObserver" in window)) {

        sections.forEach(function (section) {
            section.classList.add("rr-about-show");
        });

        return;
    }


    const observer =
        new IntersectionObserver(

            function (entries, instance) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "rr-about-show"
                        );

                        instance.unobserve(
                            entry.target
                        );
                    }

                });

            },

            {
                threshold: 0.12
            }

        );


    sections.forEach(function (section) {
        observer.observe(section);
    });

});
