import _ from "lodash";

export function getIf<Value, Result>(
    value: Value | undefined,
    mapper: (value: Value) => Result
): Result | undefined {
    return value === undefined ? undefined : mapper(value);
}

export function throwError(): never {
    throw new Error("Internal error");
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
