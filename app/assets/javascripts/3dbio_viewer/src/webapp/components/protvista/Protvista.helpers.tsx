import React from "react";
import _ from "lodash";
import { BlockDef, BlockVisibility, ProtvistaTrackElement } from "./Protvista.types";
import { PdbView } from "../../view-models/PdbView";
import { Pdb } from "../../../domain/entities/Pdb";
import { Profile, profiles } from "../../../domain/entities/Profile";
import { Track } from "../../../domain/entities/Track";

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
    visibleBlocks: BlockVisibility[],
    options: { pdb: Pdb; profile: Profile }
): BlockDef[] {
    const { pdb, profile } = options;

    return visibleBlocks
        .flatMap(({ block, visible }) => (visible ? [block] : []))
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
        const hasCustomComponent = Boolean(block.component || block.id === "proteinInteraction");
        const hasRelevantTracks =
            !_(tracks).isEmpty() && !_.isEqual(trackIds, ["structure-coverage"]);

        return hasCustomComponent || hasRelevantTracks;
    }
}

export function pdbHasCustomTracks(block: BlockDef, pdb: Pdb): boolean {
    return block.hasUploadedTracks ? pdb.tracks.some(track => track.isCustom) : false;
}

export function getCustomTracksFromPdb(block: BlockDef, pdbTracks: Track[]): Track[] {
    return block.hasUploadedTracks ? pdbTracks.filter(track => track.isCustom) : [];
}

export function getBlockTracks(pdbTracks: Track[], block: BlockDef): Track[] {
    const pdbTracksById = _.keyBy(pdbTracks, t => t.id);
    const customTracks = getCustomTracksFromPdb(block, pdbTracks);
    return _(block.tracks.map(trackDef => pdbTracksById[trackDef.id]))
        .concat(customTracks)
        .compact()
        .value();
}
