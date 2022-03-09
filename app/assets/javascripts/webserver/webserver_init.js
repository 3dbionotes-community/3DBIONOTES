//= require jquery
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "UA-222241504-1");

var $j = jQuery.noConflict();

$j(document).ready(function () {
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
