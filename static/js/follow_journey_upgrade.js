
document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.getElementById("rr-follow-journey");

    if (!section) {
        return;
    }


    const requiredLabels = [
        "VIDEOS",
        "TOTAL VIEWS",
        "DESTINATIONS",
        "LIVE CHANNELS"
    ];


    function exactTextElement(text) {

        const elements =
            document.querySelectorAll(
                "span, p, div, strong, h3, h4"
            );


        for (const element of elements) {

            const value =
                (element.textContent || "")
                .trim()
                .replace(/\s+/g, " ")
                .toUpperCase();


            if (value === text) {
                return element;
            }

        }


        return null;
    }


    const labelElements =
        requiredLabels
        .map(exactTextElement)
        .filter(Boolean);


    if (labelElements.length !== requiredLabels.length) {
        return;
    }


    function commonParent(elements) {

        let parent =
            elements[0];


        while (parent) {

            const containsAll =
                elements.every(
                    function (element) {

                        return (
                            parent === element ||
                            parent.contains(element)
                        );

                    }
                );


            if (containsAll) {
                return parent;
            }


            parent =
                parent.parentElement;

        }


        return null;
    }


    const statsContainer =
        commonParent(labelElements);


    if (
        statsContainer &&
        statsContainer.parentNode
    ) {

        statsContainer.parentNode.insertBefore(
            section,
            statsContainer.nextSibling
        );

    }

});
