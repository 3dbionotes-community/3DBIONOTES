import _ from "lodash";
import { Codec, GetType, nullType, number, oneOf, string } from "purify-ts";
import { commonLigand, pdbLigandC } from "./LigandToImageData";

const featureTypeCodec = Codec.interface({
    dataSource: string,
    name: string, // binding | not binding
    description: string,
    externalLink: string,
});

export const nmrFragmentCodec = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
    pdbentry: nullType,
    uniprotentry: string,
    ligandentity: oneOf([Codec.interface(commonLigand), pdbLigandC]),
    details: Codec.interface({
        type: string, //binding | notbinding
        entity: string, //NSP
    }),
    start: number,
    end: number,
    featureType: featureTypeCodec,
});

export type NMRScreeningFragment = GetType<typeof nmrFragmentCodec>;
