import { createHash } from "crypto";
import { Maybe } from "../utils/ts-utils";

const cacheExpiresMs = 60 * 60 * 1000; // 1 hour

export function hashUrl(url: string): string {
    return createHash("sha256").update(url).digest("hex");
}

export function getSessionCache<Data>(key: string): Maybe<Data> {
    const cached = sessionStorage.getItem(key);
    if (!cached) return undefined;

    try {
        const { value, timestamp } = JSON.parse(cached) as {
            value: Data;
            timestamp: number;
        };

        if (Date.now() - timestamp > cacheExpiresMs) {
            sessionStorage.removeItem(key);
            return undefined;
        }

        return value;
    } catch (error) {
        console.error("Error parsing session cache:", error);
        sessionStorage.removeItem(key);

        return undefined;
    }
}

export function setSessionCache<Data>(key: string, value: Data): void {
    const cacheEntry = {
        value,
        timestamp: Date.now(),
    };

    sessionStorage.setItem(key, JSON.stringify(cacheEntry));
}
