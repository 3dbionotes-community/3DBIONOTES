import _ from "lodash";
import { DbItem, Selection } from "../../view-models/Selection";
import { Maybe } from "../../../utils/ts-utils";
import { InitParams } from "@3dbionotes/pdbe-molstar/lib/spec";

interface PdbState {
    type: "pdb";
    items: DbItem[];
    chainId: Maybe<string>;
}

interface LigandState {
    type: "ligand";
}

export type MolstarState = PdbState | LigandState;

export class MolstarStateActions {
    static fromInitParams(initParams: InitParams, newSelection: Selection): MolstarState {
        const pdbItem = newSelection.type === "free" ? newSelection.main.pdb : undefined;

        return initParams.ligandView
            ? { type: "ligand" }
            : {
                  type: "pdb",
                  chainId: newSelection.chainId,
                  items: _.compact([pdbItem]),
              };
    }

    static updateItems(state: MolstarState, items: DbItem[]): MolstarState {
        return state.type === "pdb" ? { ...state, items: items } : state;
    }

    static setChain(state: MolstarState, chainId: Maybe<string>): MolstarState {
        return state.type === "pdb" ? { ...state, chainId } : state;
    }
}
