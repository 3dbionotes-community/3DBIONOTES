import _ from "lodash";
import React from "react";
import { renderToString } from "react-dom/server";

import { Color } from "../../domain/entities/Color";
import { Pdb } from "../../domain/entities/Pdb";
import { Shape } from "../../domain/entities/Shape";
import { hasFragments, Subtrack, Track } from "../../domain/entities/Track";
import { UploadData } from "../../domain/entities/UploadData";
import { Variant, Variants } from "../../domain/entities/Variant";
import { Maybe } from "../../utils/ts-utils";
import { GenericTooltip } from "../components/protvista/GenericTooltip";
import { BlockDef } from "../components/protvista/Protvista.types";
import { Tooltip } from "../components/protvista/Tooltip";

// https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track

export interface PdbView {
    displayNavigation: boolean;
    displaySequence: boolean;
    displayConservation: boolean;
    displayVariants: boolean;
    offset?: number;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
    sequence: string;
    length: number;
    tracks: TrackView[];
    variants?: VariantsView;
    sequenceConservation?: unknown;
    // New flag in @3dbionotes/protvista-pdb
    expandFirstTrack: boolean;
}

interface VariantsView extends Variants {
    variants: VariantView[];
}

export interface VariantView extends Variant {
    tooltipContent: string;
}

export interface TrackView {
    label: string;
    help: string;
    labelType?: "text" | "html";
    overlapping?: boolean;
    data: SubtrackView[];
    actions: { add?: { title: string } };
}

interface SubtrackView {
    accession: string;
    bestChainId: string;
    type: string; // Displayed in tooltip title
    label: string; // Supports: text and html.
    labelTooltip: string; // Label tooltip content. Support text and HTML mark-up
    overlapping?: boolean;
    shape: Shape;
    locations: Array<{ fragments: FragmentView[] }>;
    help: string;
}

export interface FragmentView {
    start: number;
    end: number;
    color: Color;
    tooltipContent: string;
}

export function getPdbView(
    pdb: Pdb,
    options: { block: BlockDef; showAllTracks?: boolean; uploadData: Maybe<UploadData> }
): PdbView {
    const { block, showAllTracks = false, uploadData } = options;
    const pdbTracksById = _.keyBy(pdb.tracks, t => t.id);

    const data = showAllTracks
        ? pdb.tracks
        : _.compact(block.tracks.map(trackDef => pdbTracksById[trackDef.id]));

    const customTracks = pdb.tracks.filter(track => track.isCustom);

    const tracks = _(data)
        .concat(block.id === "uploadData" && uploadData ? uploadData.tracks : []) // TODO
        .concat(block.id === "uploadData" ? customTracks : [])
        .map((pdbTrack): TrackView | undefined => {
            const subtracks = getSubtracks(pdb, pdbTrack);
            if (_.isEmpty(subtracks)) return undefined;

            return {
                ...pdbTrack,
                data: subtracks,
                help: pdbTrack.description || "",
                actions: {},
            };
        })
        .compact()
        .value();

    const variants = getVariants(pdb);

    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        expandFirstTrack: false,
        displayVariants: Boolean(variants),
        tracks,
        variants,
    };
}

function getVariants(pdb: Pdb): VariantsView | undefined {
    if (!pdb.variants || _.isEmpty(pdb.variants.variants)) return undefined;

    return {
        ...pdb.variants,
        variants: pdb.variants.variants.map(variant => ({
            ...variant,
            tooltipContent: renderToString(
                React.createElement(GenericTooltip, { items: variant.info })
            ),
        })),
    };
}

function getSubtracks(pdb: Pdb, track: Track): TrackView["data"] {
    return _.flatMap(track.subtracks, subtrack => {
        return hasFragments(subtrack) ? [getSubtrack(pdb, subtrack)] : [];
    });
}

function getSubtrack(pdb: Pdb, subtrack: Subtrack): SubtrackView {
    const label = subtrack.subtype
        ? `[${subtrack.subtype.name}] ${subtrack.label}`
        : subtrack.label;
    const labelTooltip = subtrack.subtype
        ? `[${subtrack.subtype.description}] ${subtrack.label}`
        : subtrack.label;

    return {
        ...subtrack,
        label,
        help: subtrack.labelTooltip || "",
        labelTooltip,
        bestChainId: pdb.chainId,
        locations: subtrack.locations.map(location => ({
            ...location,
            fragments: location.fragments.map(fragment => ({
                ...fragment,
                color: fragment.color || "black",
                tooltipContent: renderToString(
                    React.createElement(Tooltip, { pdb, subtrack, fragment })
                ),
            })),
        })),
    };
}
