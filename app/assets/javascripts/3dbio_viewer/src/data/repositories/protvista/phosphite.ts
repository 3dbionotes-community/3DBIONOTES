import _ from "lodash";
import { Color } from "../../../domain/entities/Color";
import { Fragment } from "../../../domain/entities/Fragment";
import { addToTrack, Subtrack, Track } from "../../../domain/entities/Track";
import { getColorFromString } from "./config";

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

export function addPhosphiteSubtracks(
    tracks: Track[],
    phosphosite: PhosphositeUniprot | undefined
): Track[] {
    if (!phosphosite) return tracks;

    return addToTrack({
        tracks,
        trackInfo: { id: "ptm", label: "PTM" },
        subtracks: getPhosphiteUniprotSubtracks(phosphosite),
    });
}

function getPhosphiteUniprotSubtracks(phosphiteUniprot: PhosphositeUniprot): Subtrack[] {
    if (!phosphiteUniprot) return [];

    const ptmItems = phosphiteUniprot.filter(obj => obj.type === "Ptm/processing");

    return _(ptmItems)
        .groupBy(obj => obj.subtype)
        .mapValues(getSubTrack)
        .values()
        .value();
}

function getSubTrack(values: PhosphositeUniprotItem[], subtype: string): Subtrack {
    const fragments = values.map(
        (obj): Fragment => {
            return {
                start: obj.start,
                end: obj.end,
                description: obj.description,
                color: getColorFromSubType(subtype),
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
    var i_t = i["type"].toLowerCase();

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
