import _ from "lodash";
import { Evidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import i18n from "../../../../domain/utils/i18n";
import { throwError } from "../../../../utils/misc";
import { recordOf } from "../../../../utils/ts-utils";
import { subtracks } from "../definitions";
import { lineBreak } from "../utils";
import { Feature } from "./feature";

// http://3dbionotes.cnb.csic.es/api/annotations/Phosphosite/Uniprot/O00141

// Note that we also have phosphite fragments coming from the feature endpoint

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

function getDomainsAndSitesDescription(items: PhosphositeUniprotItem[]) {
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

const mapSubTypeToSubtrack = recordOf<SubtrackDefinition>()({
    Acetylation: subtracks.acetylation,
    Glycosylation: subtracks.glycosylation,
    Methylation: subtracks.methylation,
    default: subtracks.modifiedResidue,
    Phosphorylation: subtracks.phosphorylation,
    Ubiquitination: subtracks.ubiquitination,
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

function isPhosphosite(phosphositeItem: PhosphositeUniprotItem, feature: Feature): boolean {
    const values = {
        phosphositeSubtype: phosphositeItem.subtype.toLowerCase(),
        featureDescription: feature.description.toLowerCase(),
    };

    return _(matchingPairs).some(
        ([phosphositeSubtype, featureDescription]) =>
            values.phosphositeSubtype.includes(phosphositeSubtype) &&
            values.featureDescription.includes(featureDescription)
    );
}

type PhosphositeByInterval = _.Dictionary<PhosphositeUniprotItem[]>;

export function getPhosphiteEvidencesFromFeature(options: {
    protein: string;
    phosphositeByInterval: PhosphositeByInterval;
    feature: Feature;
}): Evidence[] {
    const { protein, feature, phosphositeByInterval } = options;
    const existsInPhosphosite = _(
        phosphositeByInterval[[feature.begin, feature.end].join("-")]
    ).some(phosphositeItem => isPhosphosite(phosphositeItem, feature));
    if (!existsInPhosphosite) return [];

    return getEvidences(protein);
}

function getEvidences(protein: string): Evidence[] {
    const evidence: Evidence = {
        title: i18n.t("Imported information"),
        source: {
            name: i18n.t("Imported from PhosphoSitePlus"),
            links: [
                {
                    name: protein,
                    url: `http://www.phosphosite.org/uniprotAccAction.do?id=${protein}`,
                },
            ],
        },
    };

    return [evidence];
}
