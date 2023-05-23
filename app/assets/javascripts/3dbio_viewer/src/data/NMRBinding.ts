import { Codec, GetType, array, nullType, number, string } from "purify-ts";
import { maybeNull, pagination } from "./codec-utils";

const featureRegionEntityFeaturesCodec = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
    pdbentry: nullType,
    uniprotentry: string,
    ligandentity: string,
    start: number,
    end: number,
});

const nmrCodec = pagination(
    Codec.interface({
        dataSource: string,
        name: string, // binding | not binding
        description: string,
        externalLink: string,
        featureregionentity_features: array(featureRegionEntityFeaturesCodec),
    })
);

export type NMRBinding = GetType<typeof nmrCodec>;
