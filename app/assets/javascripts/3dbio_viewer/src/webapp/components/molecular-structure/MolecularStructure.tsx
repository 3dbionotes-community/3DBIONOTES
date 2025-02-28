import _ from "lodash";
import React from "react";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { Selection } from "../../view-models/Selection";
import { Ligand } from "../../../domain/entities/Ligand";
import { PdbInfo } from "../../../domain/entities/PdbInfo";
import { Maybe } from "../../../utils/ts-utils";
import { ProteinNetwork } from "../../../domain/entities/ProteinNetwork";
import { LoaderKey } from "../RootViewerContents";
import { usePdbePlugin } from "./usePdbPlugin";
import "./molstar.css";
import "./molstar-light.css";

declare global {
    interface Window {
        PDBeMolstarPlugin: typeof PDBeMolstarPlugin;
    }
}

/* Rendering cycle issue to be aware of:
 *
 * On recent changes, pdbInfo was added to the props of MolecularStructure, and usePdbPlugin was updated to use it.
 * And as pdbInfo is also changed by selection, it triggers two times the function updatePluginOnNewSelection inside usePdbPlugin,
 * as that callback is used in a useEffect with its dependencies.
 * Therefore, when selection changes, it changes at the same time both pdbInfo and usePdbPlugin. And after pdbInfo has changed, as it has changed,
 * it changes usePdbPlugin again, causing the plugin to be updated twice.
 *
 * The conceptual solution approach would be to put selection inside pdbInfo, and use selection as pdbInfo.selection.
 * That way, when selection changes, it will change pdbInfo, and then usePdbPlugin will be updated only once.
 */

export interface MolecularStructureProps {
    chains: PdbInfo["chains"];
    selection: Selection;
    onSelectionChange(newSelection: Selection): void;
    onLigandsLoaded(ligands: Ligand[]): void;
    proteinNetwork: Maybe<ProteinNetwork>;
    loaderBusy: boolean;
    updateLoader: <T>(key: LoaderKey, promise: Promise<T>, message?: string) => Promise<T>;
    proteinId: Maybe<string>;
}

export const MolecularStructure: React.FC<MolecularStructureProps> = props => {
    const { pluginRef } = usePdbePlugin(props);

    return (
        <React.Fragment>
            <div ref={pluginRef} className="molecular-structure"></div>
        </React.Fragment>
    );
};
