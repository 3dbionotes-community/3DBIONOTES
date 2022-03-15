//= require jquery
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "UA-93698320-4");

var $j = jQuery.noConflict();

function createFunctionWithTimeout(callback, opt_timeout) {
    var called = false;
    function fn() {
        if (!called) {
            called = true;
            callback();
        }
    }
    setTimeout(fn, opt_timeout || 1000);
    return fn;
}

$j(document).ready(function () {
    $j("#btn-contact").bind("click", () => {
        gtag("event", "contact", {
            event_category: "home_page",
            event_label: "Clicked contact",
        });
    });
    $j("#cta-covid").bind("click", () => {
        gtag("event", "view_page", {
            event_category: "call_to_action",
            event_label: "/covid19",
        });
        e.preventDefault();
    });
    $j("#cta-example").bind("click", () => {
        gtag("event", "view_item", {
            event_category: "call_to_action",
            event_label: $j("#cta-example").data("id"),
        });
    });

    const form = document.querySelector(".search_form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        gtag("event", "search", {
            event_category: "home_page",
            event_label: $j("#input-search").val(),
            event_callback: createFunctionWithTimeout(function () {
                form.submit();
            }),
        });
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
