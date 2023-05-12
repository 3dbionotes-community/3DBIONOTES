import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { loadPdbView, ProtvistaAction } from "./Protvista.helpers";
import { BlockDef, BlockVisibility, ProtvistaTrackElement } from "./Protvista.types";
import { getPdbView } from "../../view-models/PdbView";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    block: BlockDef;
    showAllTracks?: boolean;
    setBlockVisibility?: (blockVisibility: BlockVisibility) => void;
    onAction?(action: ProtvistaAction): void;
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, block, showAllTracks, onAction, setBlockVisibility } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    const pdbView = React.useMemo(() => {
        const pdbView = getPdbView(pdb, { block, showAllTracks });
        if (block.id === "mapValidation" && setBlockVisibility) {
            const stats = _.first(pdb.emdbs)?.emv?.stats;
            //if only structure coverage is selected and there is no stats
            if (pdbView.tracks.every(track => track.id === "structure-coverage") && !stats)
                setBlockVisibility({ block, visible: false });
        }
        return pdbView;
    }, [pdb, block, showAllTracks, setBlockVisibility]);

    React.useEffect(() => {
        return loadPdbView(elementRef, pdbView, { onAction });
    }, [pdbView, elementRef, onAction]);

    if (_(pdbView.tracks).isEmpty()) return null;

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
