export function debugVariable(name: string, obj: object): void {
    console.debug(`Debug ${name}`, obj);
    Object.assign(window, obj);
}
