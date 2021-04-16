import _ from "lodash";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { subtracks } from "../definitions";
import { getEvidenceFromDefaultReferences } from "../entities/ApiEvidenceSource";

// http://3dbionotes.cnb.csic.es/api/annotations/dbptm/Uniprot/O14920

export type DbPtmAnnotations = DbPtmAnnotation[];

export interface DbPtmAnnotation {
    start: string;
    end: string;
    evidences: string; // "10195894,9689078,10779355,10022904,11460167";
    type: string; //"Phosphorylation (MAP3K7)";
}

export function getDbPtmFragments(items: DbPtmAnnotations, protein: string): Fragments {
    return getFragments(
        items,
        (item): FragmentResult => {
            const subtrack = getPtmSubtrackFromDescription(item.type);
            if (!subtrack) return;

            const evidence = getEvidenceFromDefaultReferences({
                accession: protein,
                code: "ECO:0000269",
                references: item.evidences,
            });

            return {
                subtrack,
                start: item.start,
                end: item.end,
                evidences: [evidence],
            };
        }
    );
}

// From extendProtVista/rebuild_ptm.js
const ptmMappingFromDescription = {
    methyl: subtracks.methylation,
    acetyl: subtracks.acetylation,
    // "crotonyl": "MOD_RES_CRO",
    // "citrul": "MOD_RES_CIT",
    phospho: subtracks.phosphorylation,
    ubiq: subtracks.ubiquitination,
    // "sumo": "MOD_RES_SUM",
    glcnac: subtracks.glycosylation,
};

export function getPtmSubtrackFromDescription(description: string): SubtrackDefinition | undefined {
    const lowerDescription = description.toLowerCase();
    return _(ptmMappingFromDescription)
        .map((subtrack, descriptionSubstring) =>
            lowerDescription.includes(descriptionSubstring) ? subtrack : null
        )
        .compact()
        .first();
}
