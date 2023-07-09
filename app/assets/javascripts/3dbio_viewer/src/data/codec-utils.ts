import { Codec, array, nullType, number, oneOf, string } from "purify-ts";

export function maybeNull<Data>(type: Codec<Data>) {
    return oneOf([type, nullType]);
}

export function pagination<Data>(type: Codec<Data>): Codec<Pagination<Data>> {
    return Codec.interface({
        count: number,
        next: maybeNull(string),
        previous: maybeNull(string),
        results: array(type),
    });
}

export function getResults<Data>(pagination?: Pagination<Data>) {
    return pagination?.results ?? [];
}

export type Pagination<K> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: K[];
};
