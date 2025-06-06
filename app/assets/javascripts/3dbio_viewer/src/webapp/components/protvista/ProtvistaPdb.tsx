import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { loadPdbView, ProtvistaAction } from "./Protvista.helpers";
import { BlockDef, ProtvistaTrackElement } from "./Protvista.types";
import { getPdbView } from "../../view-models/PdbView";
import { useAppContext } from "../AppContext";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    block: BlockDef;
    showAllTracks?: boolean;
    setVisible: (visible: boolean) => void;
    onAction?(action: ProtvistaAction): void;
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, block, showAllTracks, onAction, setVisible } = props;
    const { sources } = useAppContext();
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    const pdbView = React.useMemo(() => {
        const pdbView = getPdbView(pdb, { block, showAllTracks, chainId: pdb.chainId, sources });
        if (block.id === "mapValidation") {
            const stats = _.first(pdb.emdbs)?.emv?.stats;
            //if only structure coverage is selected and there is no stats
            if (pdbView.tracks.every(track => track.id === "structure-coverage") && !stats)
                setVisible(false);
        }
        return pdbView;
    }, [pdb, block, showAllTracks, setVisible, sources]);

    React.useEffect(() => {
        return loadPdbView(elementRef, pdbView, { onAction });
    }, [pdbView, elementRef, onAction]);

    if (_(pdbView.tracks).isEmpty()) return null;

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
