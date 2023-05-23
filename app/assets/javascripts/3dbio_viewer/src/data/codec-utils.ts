import { Codec, nullType, number, oneOf, string } from "purify-ts";

export function maybeNull<Data>(type: Codec<Data>) {
    return oneOf([type, nullType]);
}

export function pagination<Data>(type: Codec<Data>) {
    return Codec.interface({
        count: number,
        next: maybeNull(string),
        previous: maybeNull(string),
        results: type,
    });
}
