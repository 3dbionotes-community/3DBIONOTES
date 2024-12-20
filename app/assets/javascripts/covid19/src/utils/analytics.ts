declare function gtag(type: "event", name: string, data?: object): void;

export function sendAnalytics(name: string, data?: object) {
    if (window.gtag !== undefined)
        gtag(
            "event",
            name,
            data && {
                ...data,
                location_hash: window.location.hash,
                location_pathname: window.location.pathname,
                location_href: window.location.href,
            }
        );
}
