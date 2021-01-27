export function debugVariable(obj: object): void {
    console.log("[debug]", obj);
    Object.assign(window, obj);
}
