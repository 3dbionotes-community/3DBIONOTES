import React, { useState } from "react";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Pdb } from "../../../domain/entities/Pdb";
import { SelectionState } from "../../view-models/SelectionState";
import { ViewerBlock } from "../ViewerBlock";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";
import { BlockDef } from "./Protvista.types";
import { useBooleanState } from "../../hooks/use-boolean";
import { AnnotationsTool } from "../annotations-tool/AnnotationsTool";
import "./protvista-pdb.css";
import "./ProtvistaViewer.css";

export interface ProtvistaViewerProps {
    pdb: Pdb;
    selection: SelectionState;
    blocks: BlockDef[];
}

type OnActionCb = NonNullable<ProtvistaPdbProps["onAction"]>;

export const ProtvistaViewer: React.FC<ProtvistaViewerProps> = props => {
    const { pdb, selection, blocks } = props;
    const [isAnnotationToolOpen, { enable: openAnnotationTool, disable: closeAnnotationTool }] = useBooleanState(false);
    const [actionName, setAction] = useState<AddAction>();
    const onAction = React.useCallback<OnActionCb>(action => {
        setAction(action);
         openAnnotationTool();
        console.debug("TODO", "action", action);
    }, []);
        /*
        {isAnnotationToolOpen && (
                        <AnnotationsTool
                            
                            title={i18n.t("Upload your annotations in JSON format")}
                            onClose={closeAnnotationTool}
                        />
                    )}
        */
    return (
        <div>
            {blocks.map(block => {
                if (!blockHasRelevantData(block, pdb)) return null;
                const CustomComponent = block.component;

                return (
                    <ViewerBlock key={block.id} block={block}>
                        {CustomComponent ? (
                            <CustomComponent pdb={pdb} selection={selection} />
                        ) : (
                            <ProtvistaPdb pdb={pdb} block={block} onAction={onAction} />
                        )}
                        {isAnnotationToolOpen && (
                        <AnnotationsTool
                            action={actionName}
                            title={i18n.t("Upload your annotations in JSON format")}
                            onClose={closeAnnotationTool}
                        />
                    )}
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
                    </ViewerBlock>
                );
            })}
        </div>
    );
};

function blockHasRelevantData(block: BlockDef, pdb: Pdb): boolean {
    const tracks = _(pdb.tracks)
        .keyBy(track => track.id)
        .at(...block.tracks.map(trackDef => trackDef.id))
        .compact()
        .value();
    const trackIds = tracks.map(track => track.id);
    const hasCustomComponent = Boolean(block.component);
    const hasRelevantTracks = !_(tracks).isEmpty() && !_.isEqual(trackIds, ["structure-coverage"]);

    return hasCustomComponent || hasRelevantTracks;
}
