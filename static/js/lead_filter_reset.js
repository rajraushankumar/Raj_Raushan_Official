document.addEventListener("DOMContentLoaded", function () {

    const filter = document.getElementById("statusFilter");
    const search = document.getElementById("leadSearch");

    function resetLeads() {

        if (filter) {
            filter.value = "all";
        }

        if (search) {
            search.value = "";
        }

        document.querySelectorAll(".lead-card").forEach(function (card) {
            card.hidden = false;
            card.style.removeProperty("display");
        });

        const empty = document.getElementById("leadFilterEmpty");

        if (empty) {
            empty.style.display = "none";
        }
    }

    resetLeads();

    window.addEventListener("pageshow", resetLeads);
});
