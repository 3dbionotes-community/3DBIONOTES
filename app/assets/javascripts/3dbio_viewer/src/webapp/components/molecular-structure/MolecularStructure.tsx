import React from "react";
import _ from "lodash";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { Selection } from "../../view-models/Selection";
import { Ligand } from "../../../domain/entities/Ligand";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { ProteinNetwork } from "../../../domain/entities/ProteinNetwork";
import { LoaderKey } from "../RootViewerContents";
import "./molstar.css";
import "./molstar-light.css";
import { usePdbePlugin } from "./usePdbPlugin";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

export interface MolecularStructureProps {
    pdbInfo: Maybe<PdbInfo>;
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    onLigandsLoaded(ligands: Ligand[]): void;
    proteinNetwork: Maybe<ProteinNetwork>;
    loaderBusy: boolean;
    updateLoader: <T>(key: LoaderKey, promise: Promise<T>, message?: string) => Promise<T>;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props);

    return (
        <React.Fragment>
            <div ref={pluginRef} className="molecular-structure"></div>
        </React.Fragment>
    );
};
