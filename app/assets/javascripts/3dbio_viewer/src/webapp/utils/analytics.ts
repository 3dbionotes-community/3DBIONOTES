declare function gtag(type: "event", name: string, data?: object): void;

export function sendAnalytics(name: string, data?: object) {
    gtag("event", name, data ? { ...data, location: window.location.hash } : undefined);
}
