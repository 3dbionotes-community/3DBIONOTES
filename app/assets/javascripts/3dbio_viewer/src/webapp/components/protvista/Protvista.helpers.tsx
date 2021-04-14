import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { BlockDef, PdbView, ProtvistaTrackElement, TrackView } from "./Protvista.types";
import { hasFragments, Track } from "../../../domain/entities/Track";
import { renderToString } from "react-dom/server";
import { Tooltip } from "./Tooltip";
import i18n from "../../utils/i18n";

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

    if (protvistaEl.layoutHelper && !_.isEmpty(pdbView.tracks)) {
        protvistaEl.layoutHelper.hideSubtracks(0);
    }

    // Collapse first track, which is expanded by default
    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });

    if (options.onAction) {
        protvistaEl.addEventListener("protvista-pdb.action", (ev: any) => {
            if (isProtvistaPdbActionEvent(ev) && options.onAction) {
                options.onAction(ev.detail);
            }
        });
    }
}

export function getPdbView(
    pdb: Pdb,
    options: { block: BlockDef; showAllTracks?: boolean }
): PdbView {
    const { block, showAllTracks = false } = options;
    const pdbTracksById = _.keyBy(pdb.tracks, t => t.id);

    const data = showAllTracks
        ? pdb.tracks
        : _.compact(block.tracks.map(trackDef => pdbTracksById[trackDef.id]));

    const tracks = _(data)
        .map((pdbTrack): TrackView | undefined => {
            const subtracks = getTrackData(pdb, pdbTrack);
            if (_.isEmpty(subtracks)) return undefined;

            return {
                ...pdbTrack,
                data: subtracks,
                help: pdbTrack.description || "",
                actions: { add: { title: i18n.t("Upload custom annotations") } },
            };
        })
        .compact()
        .value();

    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        displayVariants: !!pdb.variants,
        tracks,
        variants: pdb.variants
            ? {
                  ...pdb.variants,
                  variants: pdb.variants.variants.map(variant => ({
                      ...variant,
                      tooltipContent: variant.description,
                  })),
              }
            : undefined,
    };
}

function getTrackData(pdb: Pdb, track: Track): TrackView["data"] {
    return _.flatMap(track.subtracks, subtrack =>
        hasFragments(subtrack)
            ? [
                  {
                      ...subtrack,
                      help: subtrack.labelTooltip || "",
                      labelTooltip: subtrack.label,
                      locations: subtrack.locations.map(location => ({
                          ...location,
                          fragments: location.fragments.map(fragment => ({
                              ...fragment,
                              color: fragment.color || "black",
                              tooltipContent: renderToString(
                                  <Tooltip pdb={pdb} subtrack={subtrack} fragment={fragment} />
                              ),
                          })),
                      })),
                  },
              ]
            : []
    );
}

interface ProtvistaPdbActionEvent {
    detail: ProtvistaAction;
}

function isProtvistaPdbActionEvent(ev: any): ev is ProtvistaPdbActionEvent {
    return ev.detail && ev.detail.type === "add" && ev.detail.trackId;
}
