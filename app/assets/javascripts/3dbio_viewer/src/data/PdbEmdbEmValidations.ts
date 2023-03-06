import _ from "lodash";
import { array, Codec, GetType, number, optional, string } from "purify-ts";
import { EMValidations as EmdbEmValidations } from "../domain/entities/Pdb";
import { Maybe } from "../utils/ts-utils";

function getEmvResponse<T>(codec: Codec<T>) {
    return Codec.interface({
        resource: string,
        method_type: string,
        software_version: string,
        entry: Codec.interface({
            date: string,
            volume_map: string,
        }),
        data: codec,
        warnings: optional(array(error)),
        errors: optional(array(error)),
    });
}

const error = Codec.interface({
    mapping: optional(string),
    processing: optional(string),
});

const localResolutionConsensusC = Codec.interface({
    unit: string,
    sampling: number, //should be removed
    metrics: Codec.interface({
        resolutionMedian: number,
        quartile25: number,
        quartile75: number,
    }),
});

const localResolutionRankC = Codec.interface({
    rank: number,
    resolution: number,
});

export const consensusResponseC = getEmvResponse(localResolutionConsensusC);
export const rankResponseC = getEmvResponse(localResolutionRankC);

export type ConsensusResponse = GetType<typeof consensusResponseC>;
export type RankResponse = GetType<typeof rankResponseC>;

export interface PdbEmdbEmValidations {
    id: string;
    emv: EMValidations;
}

interface EMValidations {
    localResolution: {
        consensus: Maybe<ConsensusResponse>;
        rank: Maybe<RankResponse>;
    };
    // deepres: {};
    // monores: {};
    // blocres: {};
    // mapq: {};
    // fscq: {};
    // daq: {};
}

export function getEmValidations(emv: EMValidations): EmdbEmValidations {
    const { localResolution } = emv;

    return {
        stats: localResolution.consensus &&
            localResolution.rank && {
                ...localResolution.consensus.data.metrics,
                rank: localResolution.rank.data.rank,
                unit: (() => {
                    if (localResolution.consensus.data.unit === "Angstrom") return "Å";
                    else
                        throw new Error(
                            `Unsupported unit type: ${localResolution.consensus.data.unit}`
                        );
                })() as "Angstrom",
                warnings: localResolution.consensus.warnings
                    ?.map(warning => _.compact([warning.mapping, warning.processing]))
                    .flat(), // .rank doesn't have warnings
                errors: localResolution.consensus.errors
                    ?.map(error => _.compact([error.mapping, error.processing]))
                    .flat(), // .rank doesn't have errors
            },
    };
}
