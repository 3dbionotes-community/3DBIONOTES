export interface StorageProvider {
    get<T>(options: { key: string; getter: () => T }): T;
}
