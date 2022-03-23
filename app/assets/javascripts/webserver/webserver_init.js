//= require jquery
(function (i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
        i[r] ||
        function () {
            (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(
    window,
    document,
    "script",
    "https://www.google-analytics.com/analytics.js",
    "ga"
);
ga("create", "UA-93698320-4", "auto");
ga("send", "pageview");

var $j = jQuery.noConflict();

$j(document).ready(function () {
    $j(".btn-contact").bind("click", () => {
        ga("send", {
            hitType: "event",
            eventCategory: "home_page",
            eventAction: "contact",
            transport: "beacon",
        });
    });
    $j(".cta-covid").bind("click", () => {
        ga("send", {
            hitType: "event",
            eventCategory: "call_to_action",
            eventAction: "view_page",
            eventLabel: "/covid19",
        });
    });
    $j(".cta-example").bind("click", () => {
        ga("send", {
            hitType: "event",
            eventCategory: "call_to_action",
            eventAction: "view_example",
            eventLabel: $j(".cta-example").data("id"),
        });
    });

    const form = document.querySelector(".search_form");
    if (form)
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            ga("send", {
                hitType: "event",
                eventCategory: "home_page",
                eventAction: "search",
                eventLabel: $j("#input-search").val(),
                transport: "beacon",
            });
            form.submit();
        });

    $j(".submit_form").submit(function (event) {
        if (!$j("#structure_file").val()) {
            alert("No file selected. Please select a coordinates file.");
            event.preventDefault();
        } else {
            $j(".submit_form").css("display", "none");
            $j(".wait_div").css("display", "block");
        }
    });

    $j(".database_form").submit(function (event) {
        if (!$j("#queryId").val()) {
            alert("MISSING ID");
            event.preventDefault();
        } else {
            $j(".database_form").css("display", "none");
            $j(".wait_div").css("display", "block");
        }
    });

    $j("#network_example").click(function () {
        $j("#queryId").html("P01111\nP01112\nP01116");
        $j("#has_structure_flag_flag").prop("checked", true);
    });
});
