import _ from "lodash";
import { Codec, GetType, nullType, number, oneOf, string } from "purify-ts";
import { NMRFragmentTarget } from "../domain/entities/Protein";
import { commonLigand, pdbLigandC } from "./PdbLigands";

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
        type: string, // binding | notbinding
        entity: string, // NMR target
    }),
    start: number,
    end: number,
    featureType: featureTypeCodec,
});

export type NMRScreeningFragment = GetType<typeof nmrFragmentCodec>;

export function getNMR(nmrScreenings: NMRScreeningFragment[]): NMRFragmentTarget[] {
    const fragments = nmrScreenings.map(nmr => ({
        ...nmr,
        binding: !nmr.details.type.toLowerCase().includes("not"),
    }));

    const targets = _(fragments)
        .groupBy(i => i.details.entity)
        .toPairs()
        .value();

    return targets.flatMap(([name, targetFragments]) => {
        const fragments = targetFragments.map(
            ({ name, description, externalLink, binding, ligandentity, start, end }) => ({
                name,
                description,
                externalLink,
                binding,
                ligand: {
                    ...ligandentity,
                    inChI: ligandentity.IUPACInChIkey,
                    smiles: ligandentity.canonicalSMILES,
                    pubchemId: ligandentity.pubChemCompoundId,
                    formula: ligandentity.formula,
                    imageDataResource: undefined,
                },
                start,
                end,
            })
        );

        const start = _.first(fragments.map(({ start }) => start));
        const end = _.first(fragments.map(({ end }) => end));
        const uniprotId = _.first(targetFragments.map(({ uniprotentry }) => uniprotentry));
        if (!start || !end || !uniprotId) return [];

        return [
            {
                name,
                uniprotId,
                fragments,
                bindingCount: fragments.filter(({ binding }) => binding).length,
                notBindingCount: fragments.filter(({ binding }) => !binding).length,
                start,
                end,
            },
        ];
    });
}
