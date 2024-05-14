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
    "https://www.googletagmanager.com/gtag/js?id=G-1WTRK5CB7C", // GA4 KEY CHANGE ALSO
    "gtag"
);
gtag("config", "G-1WTRK5CB7C"); // RINCHEN: G-1WTRK5CB7C / 3DBIONOTES: G-BRPGRQ278S

var $j = jQuery.noConflict();

$j(document).ready(function () {
    $j(".btn-contact").bind("click", () => {
        gtag("event", "clicked_contact", {
            location_hash: window.location.hash,
            location_pathname: window.location.pathname,
            location_href: window.location.href,
        });
    });
    $j(".cta-covid").bind("click", () => {
        gtag("event", "clicked_cta", {
            action: "go_to",
            location_hash: window.location.hash,
            location_pathname: window.location.pathname,
            location_href: window.location.href,
            href: "/covid19",
        });
    });
    $j(".cta-example").bind("click", () => {
        gtag("event", "clicked_cta", {
            action: "view_example",
            location_hash: window.location.hash,
            location_pathname: window.location.pathname,
            location_href: window.location.href,
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
    
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookieArray = decodedCookie.split(';');
        for (var i = 0; i < cookieArray.length; i++) {
            var cookie = cookieArray[i].trim();
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return "";
    }

    function hideCookiePolicyBanner() {
        $j("#cookiesConsent").hide();
    }
    if (Boolean(getCookie("cookie_consent")) && JSON.parse(getCookie("cookie_consent"))) {
        hideCookiePolicyBanner();
    }

    $j("#agreeCookies").click(function () {
        setCookie("cookie_consent", JSON.stringify(true), 90);
        hideCookiePolicyBanner();
    });

});
