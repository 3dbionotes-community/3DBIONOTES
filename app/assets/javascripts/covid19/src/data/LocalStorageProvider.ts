import { StorageProvider } from "../domain/usecases/common/StorageProvider";

export class LocalStorageProvider implements StorageProvider {
    private getFromLocalStorage<T>(key: string): T | undefined {
        const value = localStorage.getItem(key);
        return value === null ? undefined : (JSON.parse(value) as T);
    }

    private set<T>(key: string, value: T): void {
        const json = JSON.stringify(value);
        localStorage.setItem(key, json);
    }

    get<T>(options: { key: string; getter: () => T }): T {
        const { key, getter } = options;
        const valueFromCache = this.getFromLocalStorage<T>(key);

        if (valueFromCache !== undefined) {
            return valueFromCache;
        } else {
            const value = getter();
            this.set(key, value);
            return value;
        }
    }
}
