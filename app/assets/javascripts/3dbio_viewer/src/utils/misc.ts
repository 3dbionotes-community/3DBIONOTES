import _ from "lodash";
import { FutureData } from "../domain/entities/FutureData";
import { Future } from "./future";

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

export function onF<Value, Result>(
    value: Value | undefined,
    mapper: (value: Value) => FutureData<Result>
): FutureData<Result | undefined> {
    if (value !== undefined) {
        try {
            return mapper(value);
        } catch (err) {
            console.error("ERROR", mapper, err);
            return Future.success(undefined);
        }
    } else {
        return Future.success(undefined);
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
