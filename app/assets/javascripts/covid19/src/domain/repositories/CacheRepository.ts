export interface CacheRepository {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
}

export async function fromCache<T>(
    repository: CacheRepository,
    options: { key: string; get: () => Promise<T> }
): Promise<T> {
    const { key, get } = options;
    const valueFromCache = repository.get<T>(key);

    if (valueFromCache !== undefined) {
        return valueFromCache;
    } else {
        const value = await get();
        repository.set(key, value);
        return value;
    }
}
