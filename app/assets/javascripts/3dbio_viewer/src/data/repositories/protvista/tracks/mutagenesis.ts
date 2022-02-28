/*
Example: http://3dbionotes.cnb.csic.es/api/annotations/biomuta/Uniprot/O14920

This endpoint is only used to add disease variants, the 'Mutagenesis' track uses
protein/api/features of type: "MUTAGEN".
*/

export type MutagenesisResponse = MutagenesisAnnotation[];

export interface MutagenesisAnnotation {
    start: number;
    end: number;
    position: number;
    original: string;
    variation: string;
    polyphen?: string;
    evidence: Array<{
        references: string[]; // "PubMed:null" | "PubMed:22895193"
    }>;
    disease: string;
    source: string;
    type: string;
}

// TODO: See add_biomuta: add variants from mutagenesis response
