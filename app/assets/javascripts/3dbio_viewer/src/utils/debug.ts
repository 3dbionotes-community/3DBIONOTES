import _ from "lodash";

export function debugVariable(record: Record<string, any>): void {
    _(record).forEach((obj, name) => {
        console.debug(`Debug ${name}`, obj);
        Object.assign(window, { [name]: obj });
    });
}

export function isDebugMode(): boolean {
    return window.localStorage.getItem("isDev") === "true";
}
