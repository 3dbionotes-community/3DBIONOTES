import React, { useState } from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import { BlockDef, TrackComponentProps } from "./Protvista.types";
import { useBooleanState } from "../../hooks/use-boolean";
import { AnnotationsTool } from "../annotations-tool/AnnotationsTool";
import { ProtvistaAction } from "./Protvista.helpers";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";
import { PPIViewer } from "../ppi/PPIViewer";
import { GeneViewer } from "../gene-viewer/GeneViewer";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: SelectionState;
    blocks: BlockDef[];
}

const mapping: Partial<Record<string, React.FC<TrackComponentProps>>> = {
    "ppi-viewer": PPIViewer,
    "gene-viewer": GeneViewer,
};

type OnActionCb = NonNullable<ProtvistaPdbProps["onAction"]>;

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks } = props;
    const [
        isAnnotationToolOpen,
        { enable: openAnnotationTool, disable: closeAnnotationTool },
    ] = useBooleanState(false);
    const [action, setAction] = useState<ProtvistaAction>();

    const onAction = React.useCallback<OnActionCb>(
        action => {
            setAction(action);
            openAnnotationTool();
            console.debug("TODO", "action", action);
        },
        [openAnnotationTool]
    );

    return (
        <div>
            {blocks.map(block => {
                const CustomComponent = block.component;
                return (
                    <ViewerBlock key={block.id} block={block}>
                        {CustomComponent ? (
                            <CustomComponent pdb={pdb} selection={selection} />
                        ) : (
                            <ProtvistaPdb pdb={pdb} block={block} onAction={onAction} />
                        )}
                        {block.tracks.map((trackDef, idx) => {
                            const CustomTrackComponent = mapping[trackDef.id];
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
                    </ViewerBlock>
                );
            })}
            {isAnnotationToolOpen && action && (
                <AnnotationsTool onClose={closeAnnotationTool} action={action} />
            )}
        </div>
    );
};
