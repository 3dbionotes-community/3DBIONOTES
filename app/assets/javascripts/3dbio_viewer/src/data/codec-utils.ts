import { Codec, array, nullable, number, optional, string } from "purify-ts";

export function paginationCodec<Data>(type: Codec<Data>): Codec<Pagination<Data>> {
    return Codec.interface({
        count: number,
        next: optional(nullable(string)),
        previous: optional(nullable(string)),
        results: array(type),
    });
}

export function getResults<Data>(pagination?: Pagination<Data>) {
    return pagination?.results ?? [];
}

export type Pagination<K> = {
    count: number;
    next: string | null | undefined;
    previous: string | null | undefined;
    results: K[];
};
