import _ from "lodash";
import { Evidence, getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { throwError } from "../../../../utils/misc";
import { recordOf } from "../../../../utils/ts-utils";
import { subtracks } from "../definitions";
import { lineBreak } from "../utils";
import { Feature } from "./feature";

/*
Example: http://3dbionotes.cnb.csic.es/api/annotations/Phosphosite/Uniprot/O00141

Note that we also have phosphite fragments coming from ebi /proteins/api/feature.
*/

export type PhosphositeUniprot = PhosphositeUniprotItem[];

export interface PhosphositeUniprotItem {
    position: number;
    start: number;
    end: number;
    type: string;
    subtype: string;
    description: string;
    link: Array<Array<[string, string]>>;
}

const domainSubtypes = [
    "Regulatory site",
    "Sustrate-Kinase interaction",
    "Diseases-associated site",
];

const bindingSubtypes = ["Sustrate-Kinase interaction"];

export function getPhosphiteFragments(
    phosphosite: PhosphositeUniprot | undefined,
    protein: string
): Fragments {
    if (!phosphosite) return [];

    const [domainItems, nonDomainItems] = _(phosphosite)
        .filter(obj => obj.type === "Ptm/processing")
        .partition(obj => domainSubtypes.includes(obj.subtype))
        .value();

    return _.flatten([
        getDomainFragments(protein, domainItems),
        getNonDomainFragments(protein, nonDomainItems),
    ]);
}

function getDomainFragments(protein: string, domainsItems: PhosphositeUniprotItem[]): Fragments {
    const itemsGroupedByInterval = _(domainsItems)
        .groupBy(item => [item.start, item.end].join("-"))
        .values()
        .value();

    return getFragments(
        itemsGroupedByInterval,
        (items): FragmentResult => {
            const item = items[0];
            if (!item) throwError();
            const isBinding = _(items).every(item => bindingSubtypes.includes(item.subtype));

            return {
                subtrack: isBinding
                    ? subtracks.bindingSite
                    : subtracks.otherStructuralRelevantSites,
                start: item.start,
                end: item.end,
                description: getDomainsAndSitesDescription(items),
                evidences: getEvidences(protein),
            };
        }
    );
}

function getDomainsAndSitesDescription(items: PhosphositeUniprotItem[]): string {
    return items
        .map(item => {
            const parts = item.description.split(";;");
            const notes = _(parts)
                .map(part => {
                    const [name, value] = part.split(": ", 2);
                    return name && value ? `<b>${name}</b>: ${value}` : null;
                })
                .compact()
                .value();
            return [`<b>${item.subtype}</b>`, ...notes].join(lineBreak);
        })
        .join("<hr />");
}

function getNonDomainFragments(protein: string, items: PhosphositeUniprotItem[]): Fragments {
    const mapping = mapSubTypeToSubtrack as Record<string, SubtrackDefinition>;

    return getFragments(
        items,
        (item): FragmentResult => {
            return {
                subtrack: mapping[item.subtype] || mapSubTypeToSubtrack.default,
                start: item.start,
                end: item.end,
                description: item.subtype,
                evidences: getEvidences(protein),
            };
        }
    );
}

/*
Subtypes:
    Acetylation -> acetylation
    Diseases-associated site -> otherStructuralRelevantSites
    Methylation -> methylation
    OGalNAc -> ?
    OGlcNAc -> Glycosylation
    Phosphorylation -> phosphorylation
    Regulatory site -> otherStructuralRelevantSites
    Sumoylation -> ?
    Sustrate-Kinase interaction -> bindingSite
    Ubiquitination -> ubiquitination
*/

const mapSubTypeToSubtrack = recordOf<SubtrackDefinition>()({
    Acetylation: subtracks.acetylation,
    OGlcNAc: subtracks.glycosylation,
    Methylation: subtracks.methylation,
    Phosphorylation: subtracks.phosphorylation,
    Ubiquitination: subtracks.ubiquitination,
    default: subtracks.modifiedResidue,
});

type PhosphositeSubtype = string;
type FeatureDescription = string;

// See extendProtVista/add_phosphosite.js
const matchingPairs: Array<[PhosphositeSubtype, FeatureDescription]> = [
    ["phospho", "phospho"],
    ["glcnac", "glcnac"],
    ["nitros", "nitros"],
    ["palmi", "palmi"],
    ["methyl", "methyl"],
    ["ubiquit", "ubiquit"],
    ["acetyl", "acetyl"],
    ["glyco", "glcnac"],
    ["sumo", "sumo"],
    ["prenyl", "prenyl"],
    ["prenyl", "farnesyl"],
    ["farnesyl", "prenyl"],
    ["farnesyl", "farnesyl"],
];

export function isPhosphosite(phosphositeType: string, feature: Feature): boolean {
    const values = {
        phosphositeSubtype: phosphositeType.toLowerCase(),
        featureDescription: feature.description.toLowerCase(),
    };

    return _(matchingPairs).some(
        ([phosphositeSubtype, featureDescription]) =>
            values.phosphositeSubtype.includes(phosphositeSubtype) &&
            values.featureDescription.includes(featureDescription)
    );
}

export type PhosphositeByInterval = _.Dictionary<PhosphositeUniprotItem[]>;

export function getPhosphiteEvidencesFromFeature(options: {
    protein: string;
    phosphositeByInterval: PhosphositeByInterval;
    feature: Feature;
}): Evidence[] {
    const { protein, feature, phosphositeByInterval } = options;

    const existsInPhosphosite = _(
        phosphositeByInterval[[feature.begin, feature.end].join("-")]
    ).some(phosphositeItem => isPhosphosite(phosphositeItem.subtype, feature));

    return existsInPhosphosite ? getEvidences(protein) : [];
}

function getEvidences(protein: string): Evidence[] {
    return getEvidencesFrom("PhosphoSitePlus", {
        name: protein,
        url: `http://www.phosphosite.org/uniprotAccAction.do?id=${protein}`,
    });
}
