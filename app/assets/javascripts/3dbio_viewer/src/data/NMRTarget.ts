import _ from "lodash";
import { Codec, GetType, number, string } from "purify-ts";

export const nmrTargetCodec = Codec.interface({
    entity: string,
    start: number,
    end: number,
    uniprot_acc: string,
});

export type NMRTarget = GetType<typeof nmrTargetCodec>;
