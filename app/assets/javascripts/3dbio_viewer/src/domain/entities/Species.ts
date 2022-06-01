import { getKeys } from "../../utils/ts-utils";

export const speciesRecord = {
    athaliana: "Arabidopsis thaliana",
    bsubtilis: "Bacillus subtilis",
    btaurus: "Bos taurus",
    celegans: "Caenorhabditis elegans",
    cjejuni: "Campylobacter jejuni",
    fly: "Drosophila melanogaster",
    ecoli: "Escherichia coli",
    hpylori: "Helicobacter pylori",
    human: "Homo sapiens",
    mouse: "Mus musculus",
    mtuberculosis: "Mycobacterium tuberculosis",
    mpneumoniae: "Mycoplasma pneumoniae",
    pfalciparum: "Plasmodium falciparum",
    rat: "Rattus norvegicus",
    yeast: "Saccharomyces cerevisiae",
    spombe: "Schizosaccharomyces pombe",
    ssp: "Synechocystis sp. (strain PCC 6803 / Kazusa)",
    tpallidum: "Treponema pallidum",
} as const;

export const speciesList = getKeys(speciesRecord);

export type Species = typeof speciesList[number];
