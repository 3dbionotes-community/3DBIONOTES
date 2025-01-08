import { createHash } from "crypto";
import { Maybe } from "../utils/ts-utils";

const cacheExpiresMs = 60 * 60 * 1000; // 1 hour

export function hashUrl(url: string): string {
    return createHash("sha256").update(url).digest("hex");
}

export function getStorageCache<Data>(key: string): Maybe<Data> {
    const cached = localStorage.getItem(key);
    if (!cached) return undefined;

    try {
        const { value, timestamp } = JSON.parse(cached) as {
            value: Data;
            timestamp: number;
        };

        if (Date.now() - timestamp > cacheExpiresMs) {
            localStorage.removeItem(key);
            return undefined;
        }

        return value;
    } catch (error) {
        console.error("Error parsing storage cache:", error);
        localStorage.removeItem(key);

        return undefined;
    }
}

export function setStorageCache<Data>(key: string, value: Data): void {
    const cacheEntry = {
        value,
        timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(cacheEntry));
}

export function storageGarbageCollector(): void {
    const now = Date.now();
    const keysToRemove = Array.from({ length: localStorage.length })
        .map((_, i) => localStorage.key(i))
        .filter((key): key is string => key !== null)
        .filter(key => {
            const cached = localStorage.getItem(key);
            if (!cached) return false;
            try {
                const { timestamp } = JSON.parse(cached) as { timestamp: number };
                return now - timestamp > cacheExpiresMs;
            } catch (error) {
                console.error("Error parsing storage cache during garbage collection:", error);
                return true;
            }
        });

    keysToRemove.forEach(key => localStorage.removeItem(key));
}
