import _ from "lodash";

export type Maybe<T> = T | undefined;

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/* Define only the value type of an object and infer the keys:

    // values :: Record<"key1" | "key2", {value: string}>
    const values = recordOf<{value: string}>()({
        key1: {value: "1"},
        key2: {value: "2"},
    })
*/
export function recordOf<T>() {
    return function <Obj>(obj: { [K in keyof Obj]: T }) {
        return obj;
    };
}

export function assert<T>(value: T | undefined): T {
    if (value === undefined) throw new Error("Assert error");
    return value;
}
