import { Maybe } from "../../utils/ts-utils";
import { Color } from "./Color";
import { Experiment } from "./Experiment";
import { Link } from "./Link";
import { Protein } from "./Protein";
import { Track } from "./Track";
import { Variants } from "./Variant";

export interface Pdb {
    id: string;
    experiment: Maybe<Experiment>;
    emdb: { id: string } | undefined;
    protein: Protein;
    sequence: string;
    length: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: Track[];
    variants?: Variants;
    sequenceConservation?: unknown;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
}

type PdbEntity = "pdb" | "emdb" | "uniprot";

export function getEntityLink(pdb: Pdb, entity: PdbEntity): Link | undefined {
    switch (entity) {
        case "pdb": {
            const pdbId = pdb.id.toUpperCase();
            return { name: pdbId, url: `https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId}` };
        }
        case "emdb": {
            const emdbId = pdb.emdb?.id.toUpperCase();
            return emdbId
                ? { name: emdbId, url: `https://www.ebi.ac.uk/pdbe/entry/emdb/${emdbId}` }
                : undefined;
        }
        case "uniprot": {
            const proteinId = pdb.protein.id.toUpperCase();
            return { name: proteinId, url: `https://www.uniprot.org/uniprot/${proteinId}` };
        }
    }
}
