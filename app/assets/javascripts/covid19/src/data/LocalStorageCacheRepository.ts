import { CacheRepository } from "../domain/repositories/CacheRepository";

export class LocalStorageCacheRepository implements CacheRepository {
    get<T>(key: string): T | undefined {
        const value = localStorage.getItem(key);
        return value === null ? undefined : (JSON.parse(value) as T);
    }

    set<T>(key: string, value: T): void {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
    }
}
