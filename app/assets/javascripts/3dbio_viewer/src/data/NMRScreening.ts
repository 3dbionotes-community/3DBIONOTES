import _ from "lodash";
import { Codec, GetType, nullType, number, oneOf, string } from "purify-ts";
import { NSPTarget } from "../domain/entities/Protein";
import { commonLigand, pdbLigandC } from "./PdbLigands";

const featureTypeCodec = Codec.interface({
    dataSource: string,
    name: string, // binding | not binding
    description: string,
    externalLink: string,
});

const nmrFragmentCodec = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
    pdbentry: nullType,
    uniprotentry: string,
    ligandentity: oneOf([Codec.interface(commonLigand), pdbLigandC]),
    details: Codec.interface({
        type: string, //binding | not binding
        entity: string, //NSP
    }),
    start: number, // start and end will be used for highlighting
    end: number,
    featureType: featureTypeCodec,
});

export type NMRScreeningFragment = GetType<typeof nmrFragmentCodec>;

export function getNMR(nmrScreenings: NMRScreeningFragment[]): NSPTarget[] {
    const fragments = nmrScreenings.map(nmr => ({
        ...nmr,
        binding: !nmr.details.type.toLowerCase().includes("not"),
    }));

    const targets = _(fragments)
        .groupBy(i => i.details.entity)
        .toPairs()
        .value();

    return targets.map(([name, targetFragments]) => {
        const fragments = targetFragments.map(
            ({ name, description, externalLink, binding, ligandentity }) => ({
                name,
                description,
                externalLink,
                binding,
                ligand: { ...ligandentity, inChI: ligandentity.IUPACInChIkey },
            })
        );

        return {
            name,
            fragments,
            bindingCount: fragments.filter(({ binding }) => binding).length,
            notBindingCount: fragments.filter(({ binding }) => !binding).length,
        };
    });
}
