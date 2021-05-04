import React from "react";
import { Viewers } from "./viewers/Viewers";
import { MolecularStructure } from "./molecular-structure/MolecularStructure";
import { ViewerSelector } from "./viewer-selector/ViewerSelector";
import { useViewerState } from "./viewer-selector/viewer-selector.hooks";
import { usePdbInfo } from "../hooks/loader-hooks";
import { Ligand } from "../../domain/entities/Ligand";

export const RootViewer: React.FC = React.memo(() => {
    const [viewerState, { setSelection }] = useViewerState();
    const { selection } = viewerState;
    const pdbInfo = usePdbInfo(selection);
    const [ligands, setLigands] = React.useState<Ligand[]>();
    console.debug({ ligands });

    return (
        <div id="viewer">
            <ViewerSelector
                /* ligands={ligands} */
                pdbInfo={pdbInfo}
                selection={selection}
                onSelectionChange={setSelection}
            />

            <div id="left">
                <MolecularStructure
                    selection={selection}
                    onSelectionChange={setSelection}
                    onLigandsLoaded={setLigands}
                />
            </div>

            <div id="right">{pdbInfo && <Viewers pdbInfo={pdbInfo} selection={selection} />}</div>
        </div>
    );
});
