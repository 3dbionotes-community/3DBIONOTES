import { Codec } from "purify-ts/Codec";
import { FutureData } from "../../domain/entities/FutureData";
import { Future } from "./future";

export function parseFromCodec<T>(codec: Codec<T>, contents: string): FutureData<T> {
    let json: unknown;

    try {
        json = JSON.parse(contents);
    } catch (err: unknown) {
        return Future.error(err as Error);
    }

    return codec.decode(json).caseOf({
        Left: err => {
            return Future.error({ message: err });
        },
        Right: data => {
            return Future.success(data);
        },
    });
}
