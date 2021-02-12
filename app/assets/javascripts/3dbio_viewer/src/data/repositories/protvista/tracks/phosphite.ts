import _ from "lodash";
import { Color } from "../../../../domain/entities/Color";
import { Evidence } from "../../../../domain/entities/Evidence";
import { Fragment } from "../../../../domain/entities/Fragment";
import { addToTrack, Subtrack, Track } from "../../../../domain/entities/Track";
import { config, getColorFromString } from "../config";
import { Feature } from "./feature";

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

export function addPhosphiteSubtracks(
    tracks: Track[],
    protein: string,
    phosphosite: PhosphositeUniprot | undefined
): Track[] {
    if (!phosphosite) return tracks;

    const [domainsItems, ptmItems] = _(phosphosite)
        .filter(obj => obj.type === "Ptm/processing")
        .partition(obj => domainSubtypes.includes(obj.subtype))
        .value();

    // TODO: tracks may return [trackId, subtrackId, fragment] and group on the parent
    const tracks2 = addToTrack({
        tracks,
        trackInfo: { id: "ptm", label: "PTM" },
        subtracks: getPtmSubtracks(protein, ptmItems),
    });

    return addToTrack({
        tracks: tracks2,
        trackInfo: { id: "domains-and-sites", label: "Domains and sites" },
        subtracks: getDomainsAndSitesSubtracks(protein, domainsItems),
    });
}

function getDomainsAndSitesSubtracks(
    protein: string,
    domainsItems: PhosphositeUniprotItem[]
): Subtrack[] {
    const itemsGrouped = _(domainsItems)
        .groupBy(item => [item.start, item.end].join("-"))
        .values()
        .value();

    const fragments = itemsGrouped.map(
        (items): Fragment => {
            const item = items[0];
            if (!item) throw "internal";
            const isBinding = _.isEqual(
                items.map(i => i.subtype),
                bindingSubtypes
            );

            return {
                type: isBinding ? "binding" : "site",
                start: item.start,
                end: item.end,
                color: config.shapeByTrackName.site,
                description: getDomainsAndSitesDescription(items),
                evidences: getEvidences(protein),
            };
        }
    );

    const [bindingFragments, siteFragments] = _.partition(
        fragments,
        fragment => fragment.type === "binding"
    );

    const subtrackBinding: Subtrack = {
        type: "BINDING",
        label: "Binding",
        accession: "BINDING",
        shape: config.shapeByTrackName.binding,
        locations: [{ fragments: bindingFragments }],
    };

    const subtrackSite: Subtrack = {
        type: "SITE",
        label: "Site",
        accession: "BINDING",
        shape: config.shapeByTrackName.site,
        locations: [{ fragments: siteFragments }],
    };

    return [subtrackBinding, subtrackSite];
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
            return [`<b>${item.subtype}</b>`, ...notes].join("<br />");
        })
        .join("<hr />");
}

function getPtmSubtracks(protein: string, ptmItems: PhosphositeUniprotItem[]): Subtrack[] {
    return _(ptmItems)
        .groupBy(obj => obj.subtype)
        .mapValues((values, subtype) => getPtmSubTrack(protein, values, subtype))
        .values()
        .value();
}

function getPtmSubTrack(
    protein: string,
    values: PhosphositeUniprotItem[],
    subtype: string
): Subtrack {
    const fragments = values.map(
        (obj): Fragment => {
            return {
                start: obj.start,
                end: obj.end,
                description: obj.subtype,
                color: getColorFromSubType(subtype),
                evidences: getEvidences(protein),
            };
        }
    );

    return {
        type: subtype.toUpperCase(),
        accession: subtype.toUpperCase(),
        shape: "triangle",
        locations: [{ fragments }],
        label: subtype,
    };
}

function getColorFromSubType(subtype: string): Color {
    const obj = { type: subtype };
    filter_type(obj);
    const newType = obj.type.toLowerCase();
    return getColorFromString(newType) || "#777";
}

/* From: featureAnalysis/add_analysis_data.js */

function filter_type(i: { type: string }): void {
    const i_t = i["type"].toLowerCase();

    if (i_t.indexOf("methyl") > -1) {
        i["type"] = "MOD_RES_MET";
    } else if (i_t.indexOf("acetyl") > -1) {
        i["type"] = "MOD_RES_ACE";
    } else if (i_t.indexOf("crotonyl") > -1) {
        i["type"] = "MOD_RES_CRO";
    } else if (i_t.indexOf("citrul") > -1) {
        i["type"] = "MOD_RES_CIT";
    } else if (i_t.indexOf("phospho") > -1) {
        i["type"] = "MOD_RES_PHO";
    } else if (i_t.indexOf("ubiq") > -1) {
        i["type"] = "MOD_RES_UBI";
    } else if (i_t.indexOf("sumo") > -1) {
        i["type"] = "MOD_RES_SUM";
    } else if (i_t.indexOf("glcnac") > -1) {
        i["type"] = "CARBOHYD";
    } else if (i_t.indexOf("disulfid") > -1) {
        i["type"] = "DISULFID";
    } else if (i_t.indexOf("RIBOSYLA") > -1) {
        i["type"] = "RIBOSYLATION";
    } else if (i_t.indexOf("lip") > -1) {
        i["type"] = "linear_motif";
    }
}

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
        title: "Imported information",
        source: {
            name: "Imported from PhosphoSitePlus",
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
