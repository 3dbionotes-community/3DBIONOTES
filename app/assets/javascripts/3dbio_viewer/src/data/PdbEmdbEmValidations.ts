import _ from "lodash";
import { array, Codec, GetType, number, optional, string } from "purify-ts";
import { EMValidations as EmdbEmValidations } from "../domain/entities/Pdb";
import { Maybe } from "../utils/ts-utils";

const error = Codec.interface({
    processing: string,
});

export const statsResponseC = Codec.interface({
    resource: string,
    method_type: string,
    software_version: string,
    entry: Codec.interface({
        date: string,
        volume_map: string,
    }),
    data: Codec.interface({
        unit: string,
        sampling: number, //should be removed
        metrics: Codec.interface({
            rank: optional(number),
            resolutionMedian: number,
            quartile25: number,
            quartile75: number,
        }),
    }),
    warnings: array(error),
    errors: array(error),
});

export type StatsResponse = GetType<typeof statsResponseC>;

export interface PdbEmdbEmValidations {
    id: string;
    emv: EMValidations;
}

interface EMValidations {
    stats: Maybe<StatsResponse>;
    // deepres: {};
    // monores: {};
    // blocres: {};
    // mapq: {};
    // fscq: {};
    // daq: {};
}

export function getEmValidations(emv: EMValidations): EmdbEmValidations {
    const { stats } = emv;

    return {
        stats:
            (stats && {
                ...stats.data.metrics,
                rank: stats.data.metrics.rank ?? 50, //"50" TEMPORAL PATCH, REMOVE
                unit: (() => {
                    if (stats.data.unit === "Angstrom") return "Å";
                    else throw new Error(`Unsupported unit type: ${stats.data.unit}`);
                })() as "Angstrom",
            }) ||
            undefined,
    };
}
