export function sendAnalytics(name: string, data?: object) {
    if (window.gtag !== undefined)
        window.gtag(
            "event",
            name,
            data && {
                ...data,
                location_hash: window.location.hash,
                location_pathname: window.location.pathname,
                location_href: window.location.href,
            }
        );
    else throw new Error("gtag() function has not been declared.");
}
