import { Codec, array, nullable, number, string } from "purify-ts";

export function paginationCodec<Data>(type: Codec<Data>): Codec<Pagination<Data>> {
    return Codec.interface({
        count: number,
        next: nullable(string),
        previous: nullable(string),
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
