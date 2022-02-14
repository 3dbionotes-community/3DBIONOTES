import React from "react";
import _ from "lodash";
import { BlockDef, ProtvistaTrackElement } from "./Protvista.types";
import { PdbView } from "../../view-models/PdbView";
import { Pdb, pdbHasCustomTracks } from "../../../domain/entities/Pdb";
import { Profile, profiles } from "../../../domain/entities/Profile";

interface AddAction {
    type: "add";
    trackId: string;
}

export type ProtvistaAction = AddAction;

interface Options {
    onAction?(action: ProtvistaAction): void;
}

export function loadPdbView(
    elementRef: React.RefObject<ProtvistaTrackElement>,
    pdbView: PdbView,
    options: Options
) {
    const protvistaEl = elementRef.current;
    if (!protvistaEl) return;

    protvistaEl.viewerdata = pdbView;

    if (options.onAction) {
        protvistaEl.addEventListener("protvista-pdb.action", (ev: any) => {
            if (isProtvistaPdbActionEvent(ev) && options.onAction) {
                options.onAction(ev.detail);
            }
        });
    }
}

interface ProtvistaPdbActionEvent {
    detail: ProtvistaAction;
}

function isProtvistaPdbActionEvent(ev: any): ev is ProtvistaPdbActionEvent {
    return ev.detail && ev.detail.type === "add" && ev.detail.trackId;
}

export function getVisibleBlocks(
    blocks: BlockDef[],
    options: { pdb: Pdb; profile: Profile }
): BlockDef[] {
    const { pdb, profile } = options;

    return blocks
        .filter(block => blockHasRelevantData(block, pdb))
        .filter(block => profile === profiles.general || block.profiles.includes(profile));
}

function blockHasRelevantData(block: BlockDef, pdb: Pdb): boolean {
    if (pdbHasCustomTracks(block, pdb)) {
        return true;
    } else {
        const tracks = _(pdb.tracks)
            .keyBy(track => track.id)
            .at(...block.tracks.map(trackDef => trackDef.id))
            .compact()
            .value();
        const trackIds = tracks.map(track => track.id);
        const hasCustomComponent = Boolean(block.component);
        const hasRelevantTracks =
            !_(tracks).isEmpty() && !_.isEqual(trackIds, ["structure-coverage"]);

        return hasCustomComponent || hasRelevantTracks;
    }
}
