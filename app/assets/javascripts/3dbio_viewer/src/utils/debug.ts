export function debugVariable(name: string, obj: object): void {
    console.log("[debug]", obj);
    Object.assign(window, obj);
}
