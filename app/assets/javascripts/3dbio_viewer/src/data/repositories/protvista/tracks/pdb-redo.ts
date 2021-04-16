import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Chain } from "../../../../domain/entities/Chain";
import { Evidence, getEvidencesFrom } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { isElementOfUnion } from "../../../../utils/ts-utils";

// Example: http://3dbionotes.cnb.csic.es/api/annotations/PDB_REDO/2r5t

export type PdbRedo = Record<Chain, PdbRedoItem[]>;

interface PdbRedoItem {
    begin: number;
    end: number;
    type: PdbRedoType;
    description: string;
    evidences: {
        "Imported information"?: Array<{
            name: string;
            id: string;
            url: string;
        }>;
    };
}

const pdbRedoKnownTypes = ["changed_rotamer", "completed_res", "h_bond_flip"] as const;
type PdbRedoKnownType = typeof pdbRedoKnownTypes[number];

type PdbRedoType = PdbRedoKnownType | string;

const subtrackByType: Record<PdbRedoKnownType, SubtrackDefinition> = {
    changed_rotamer: subtracks.changedRotamers,
    completed_res: subtracks.completedResidues,
    h_bond_flip: subtracks.hBondFlip,
};

export function getPdbRedoFragments(pdbRedo: PdbRedo, chain: Chain): Fragments {
    const items = pdbRedo[chain];
    if (!items) return [];

    return getFragments(
        items,
        (item): FragmentResult => {
            if (!isElementOfUnion(item.type, pdbRedoKnownTypes)) return;
            const subtrack = subtrackByType[item.type];

            return {
                subtrack,
                start: item.begin,
                end: item.end,
                description: item.description,
                evidences: getEvidences(item),
            };
        }
    );
}

function getEvidences(item: PdbRedoItem): Evidence[] {
    return _.flatMap(item.evidences["Imported information"], info =>
        getEvidencesFrom("PDB_REDO", { name: info.id, url: info.url })
    );
}
