import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { loadPdbView, ProtvistaAction } from "./Protvista.helpers";
import { BlockDef, ProtvistaTrackElement } from "./Protvista.types";
import { getPdbView } from "../../view-models/PdbView";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    block: BlockDef;
    showAllTracks?: boolean;
    onAction?(action: ProtvistaAction): void;
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, block, showAllTracks, onAction } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    const pdbView = React.useMemo(() => {
        return getPdbView(pdb, { block, showAllTracks });
    }, [pdb, block, showAllTracks]);

    React.useEffect(() => {
        return loadPdbView(elementRef, pdbView, { onAction });
    }, [pdbView, elementRef, onAction]);

    if (_(pdbView.tracks).isEmpty()) return null;

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
