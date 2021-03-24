export function getIf<Value, Result>(
    value: Value | undefined,
    mapper: (value: Value) => Result
): Result | undefined {
    return value === undefined ? undefined : mapper(value);
}

export function throwError(): never {
    throw new Error("Internal error");
}
