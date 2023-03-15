//= require jquery
(function (window, document, element, src, name, a, m) {
    window["GoogleAnalytics4Object"] = name;
    (window[name] =
        window[name] ||
        function () {
            (window.dataLayer = window.dataLayer || []).push(arguments);
        })("js", new Date());
    (a = document.createElement(element)),
        (m = document.getElementsByTagName(element)[0]);
    a.async = 1;
    a.src = src;
    m.parentNode.insertBefore(a, m);
})(
    window,
    document,
    "script",
    "https://www.googletagmanager.com/gtag/js?id=G-1WTRK5CB7C",
    "gtag"
);
gtag("config", "G-1WTRK5CB7C");

var $j = jQuery.noConflict();

$j(document).ready(function () {
    $j(".btn-contact").bind("click", () => {
        gtag("event", "clicked_contact", {
            location: window.location.hash,
        });
    });
    $j(".cta-covid").bind("click", () => {
        gtag("event", "clicked_cta", {
            action: "go_to",
            location: window.location.hash,
            href: "/covid19",
        });
    });
    $j(".cta-example").bind("click", () => {
        gtag("event", "clicked_cta", {
            action: "view_example",
            location: window.location.hash,
            href: $j(".cta-example").data("id"),
        });
    });

    const form = document.querySelector(".search_form");
    if (form)
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            gtag("event", "search", {
                on: "home_page",
                query: $j("#input-search").val(),
                location: window.location.hash,
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
