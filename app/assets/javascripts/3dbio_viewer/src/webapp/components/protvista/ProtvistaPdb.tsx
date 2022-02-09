import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { loadPdbView, ProtvistaAction } from "./Protvista.helpers";
import { BlockDef, ProtvistaTrackElement } from "./Protvista.types";
import { getPdbView } from "../../view-models/PdbView";
import { UploadData } from "../../../domain/entities/UploadData";
import { Maybe } from "../../../utils/ts-utils";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    block: BlockDef;
    showAllTracks?: boolean;
    onAction?(action: ProtvistaAction): void;
    uploadData: Maybe<UploadData>;
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, block, showAllTracks, onAction, uploadData } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => {
        const pdbView = getPdbView(pdb, { block, showAllTracks, uploadData });
        return loadPdbView(elementRef, pdbView, { onAction });
    }, [pdb, block, showAllTracks, elementRef, onAction, uploadData]);

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
