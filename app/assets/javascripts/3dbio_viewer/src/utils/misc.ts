import _ from "lodash";

export function on<Value, Result>(
    value: Value | undefined,
    mapper: (value: Value) => Result
): Result | undefined {
    if (value !== undefined) {
        try {
            return mapper(value);
        } catch (err) {
            console.error("ERROR", mapper, err);
        }
    }
}

export function throwError(msg?: string): never {
    throw new Error(msg || "Internal error");
}

export function props<Prop extends string, Value>(
    prop: Prop,
    value: Value | undefined
): Record<Prop, Value> | {} {
    return value ? { [prop]: value } : {};
}

export function from<Obj>(obj: Obj): Partial<Obj> {
    return _.omitBy(obj, _.isUndefined) as Partial<Obj>;
}
