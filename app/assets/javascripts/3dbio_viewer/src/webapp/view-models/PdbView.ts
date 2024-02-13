import _ from "lodash";
import React from "react";
import { renderToString } from "react-dom/server";
import { Color } from "../../domain/entities/Color";
import { Pdb } from "../../domain/entities/Pdb";
import { Shape } from "../../domain/entities/Shape";
import { hasFragments, Subtrack, Track } from "../../domain/entities/Track";
import { Variant, Variants } from "../../domain/entities/Variant";
import { GenericTooltip } from "../components/protvista/GenericTooltip";
import { BlockDef } from "../components/protvista/Protvista.types";
import { Tooltip } from "../components/protvista/Tooltip";
import { trackDefinitions } from "../../domain/definitions/tracks";
import { getBlockTracks } from "../components/protvista/Protvista.helpers";

// https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track

export interface PdbView {
    displayNavigation: boolean;
    displaySequence: boolean;
    displayConservation: boolean;
    displayVariants: boolean;
    chainId?: string;
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
    id: string;
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
    options: { block: BlockDef; showAllTracks?: boolean; chainId?: string }
): PdbView {
    const { block, showAllTracks = false, chainId } = options;
    const data = showAllTracks ? pdb.tracks : getBlockTracks(pdb.tracks, block);

    const tracks = _(data)
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

    const variants = _(block.tracks).some(track => track === trackDefinitions.variants)
        ? getVariants(pdb)
        : undefined;

    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        expandFirstTrack: false,
        displayVariants: Boolean(variants),
        tracks,
        variants,
        chainId,
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
