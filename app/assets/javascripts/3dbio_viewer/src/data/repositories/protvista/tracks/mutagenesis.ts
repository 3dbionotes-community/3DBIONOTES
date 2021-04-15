/* Example: http://3dbionotes.cnb.csic.es/api/annotations/biomuta/Uniprot/O14920

Mutagenesis track uses /api/features of type: "MUTAGEN". This endpoint only adds variants.
*/

export type MutagenesisResponse = MutagenesisAnotation[];

export interface MutagenesisAnotation {
    start: number;
    end: number;
    position: number;
    original: string;
    variation: string;
    polyphen: string;
    evidence: Array<{
        references: [string]; // ["PubMed:null"] | ["PubMed:22895193"]
    }>;
    disease: string;
    source: string;
    type: string;
}

// TODO: See add_biomuta: add variants from mutagenesis response
