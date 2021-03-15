import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { SelectionState } from "../../view-models/SelectionState";
import { getPdbView, loadPdbView } from "./Protvista.helpers";
import { ProtvistaBlock as ProtvistaBlockM, ProtvistaTrackElement } from "./Protvista.types";

export interface BlockProps {
    block: ProtvistaBlockM;
    pdb: Pdb;
    selection: SelectionState;
}

export const ProtvistaPdb: React.FC<BlockProps> = React.memo(props => {
    const { pdb, block, selection } = props;
    const elementRef = React.useRef<ProtvistaTrackElement>(null);

    React.useEffect(() => {
        return loadPdbView(elementRef, getPdbView(pdb, block));
    }, [pdb, block, elementRef]);

    return (
        <div>
            <protvista-pdb custom-data="true" ref={elementRef}></protvista-pdb>

            {block.tracks.map((trackDef, idx) => {
                const CustomTrackComponent = trackDef.component;
                return (
                    CustomTrackComponent && (
                        <CustomTrackComponent
                            key={idx}
                            trackDef={trackDef}
                            pdb={pdb}
                            selection={selection}
                        />
                    )
                );
            })}
        </div>
    );
});
