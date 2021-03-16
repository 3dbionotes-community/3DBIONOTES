import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { getPdbView, loadPdbView } from "./Protvista.helpers";
import { ProtvistaTrackElement } from "./Protvista.types";

export interface ProtvistaPdbProps {
    pdb: Pdb;
    trackIds?: string[];
}

export const ProtvistaPdb: React.FC<ProtvistaPdbProps> = React.memo(props => {
    const { pdb, trackIds } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => {
        return loadPdbView(elementRef, getPdbView(pdb, { trackIds }));
    }, [pdb, trackIds, elementRef]);

    return <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>;
});
