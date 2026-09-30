document.addEventListener("DOMContentLoaded", function () {

    const button = document.getElementById("generatePlan");
    const result = document.getElementById("result");

    button.addEventListener("click", function () {

        const destination = document.getElementById("destination").value;
        const days = document.getElementById("days").value;
        const budget = document.getElementById("budget").value;
        const transport = document.getElementById("transport").value;

        const destinationNames = {
            nature: "Nature & Waterfall Adventure",
            history: "History & Heritage Journey",
            temple: "Temple & Spiritual Journey",
            city: "City & Local Exploration",
            mixed: "Complete Travel Experience"
        };

        const budgetNames = {
            low: "Budget Friendly",
            medium: "Comfort",
            high: "Premium"
        };

        const transportNames = {
            bike: "Bike",
            car: "Car",
            train: "Train",
            bus: "Bus",
            mixed: "Mixed Transport"
        };

        const tips = {
            nature: "Start early, carry drinking water and check the local weather before leaving.",
            history: "Read a little about the destination before visiting. It makes the experience more meaningful.",
            temple: "Respect local customs, dress appropriately and check visiting timings.",
            city: "Keep some flexible time for local food, markets and unexpected discoveries.",
            mixed: "Do not try to cover everything. Keep enough time to actually enjoy each place."
        };

        const checklistItems = [
            "Carry a valid ID and basic emergency contacts.",
            "Keep phone, power bank and charging cable ready.",
            "Check weather and local conditions before departure.",
            "Keep drinking water and basic medicines with you.",
            "Respect local culture, people and the environment."
        ];

        document.getElementById("resultTitle").textContent =
            destinationNames[destination];

        document.getElementById("resultIntro").textContent =
            "Your " + days + "-day travel plan is ready. Use this as a simple starting point and adjust it according to your destination.";

        document.getElementById("resultDays").textContent =
            days + (days === "1" ? " Day" : " Days");

        document.getElementById("resultBudget").textContent =
            budgetNames[budget];

        document.getElementById("resultTransport").textContent =
            transportNames[transport];

        const checklist = document.getElementById("checklist");
        checklist.innerHTML = "";

        checklistItems.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent = "✓ " + item;
            checklist.appendChild(li);
        });

        document.getElementById("travelTip").textContent =
            tips[destination];

        result.hidden = false;

        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
