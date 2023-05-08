import _ from "lodash";
import { array, Codec, exactly, GetType, number, oneOf, optional, string } from "purify-ts";
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
        warnings: optional(array(string)),
        errors: optional(array(string)),
    });
}

const localResolutionConsensusC = Codec.interface({
    sampling: number, //should be removed
    threshold: number,
    metrics: array(
        oneOf([
            Codec.interface({
                resolutionMedian: number,
                unit: exactly("Angstrom"),
            }),
            Codec.interface({
                quartile25: number,
            }),
            Codec.interface({
                quartile75: number,
            }),
        ])
    ),
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
                quartile25: (localResolution.consensus.data.metrics.find(
                    metric => "quartile25" in metric
                ) as { quartile25: number })?.quartile25,
                quartile75: (localResolution.consensus.data.metrics.find(
                    metric => "quartile75" in metric
                ) as { quartile75: number })?.quartile75,
                ...(localResolution.consensus?.data.metrics.find(
                    metric => "resolutionMedian" in metric
                ) as { resolutionMedian: number; unit: "Angstrom" }),
                rank: localResolution.rank.data.rank,
                warnings: localResolution.consensus.warnings,
                errors: localResolution.consensus.errors,
            },
    };
}
