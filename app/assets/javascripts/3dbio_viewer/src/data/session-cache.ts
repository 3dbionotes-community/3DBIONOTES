import { createHash } from "crypto";
import { Maybe } from "../utils/ts-utils";

const cacheExpires = 3.6e6;

export function hashUrl(url: string): string {
    return createHash("sha256").update(url).digest("hex");
}

export function getSessionCache<Data>(key: string): Maybe<Data> {
    const cached = sessionStorage.getItem(key);
    if (!cached) return undefined;

    const { value, timestamp } = JSON.parse(cached) as {
        value: Data;
        timestamp: number;
    };

    if (Date.now() - timestamp > cacheExpires) {
        sessionStorage.removeItem(key);
        return undefined;
    }

    return value;
}

export function setSessionCache<Data>(key: string, value: Data): void {
    const cacheEntry = {
        value,
        timestamp: Date.now(),
    };

    sessionStorage.setItem(key, JSON.stringify(cacheEntry));
}
