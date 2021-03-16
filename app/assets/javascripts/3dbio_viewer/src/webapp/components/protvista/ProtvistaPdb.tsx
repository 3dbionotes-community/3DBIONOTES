import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { getPdbView, loadPdbView } from "./Protvista.helpers";
import { BlockDef, ProtvistaTrackElement } from "./Protvista.types";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    block: BlockDef;
    showAllTracks?: boolean;
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, block, showAllTracks } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => {
        return loadPdbView(elementRef, getPdbView(pdb, { block, showAllTracks }));
    }, [pdb, block, showAllTracks, elementRef]);

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
