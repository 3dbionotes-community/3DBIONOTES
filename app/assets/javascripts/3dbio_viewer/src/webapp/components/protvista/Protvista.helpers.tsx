import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { State } from "./Protvista";
import { PdbView, ProtvistaTrackElement, TrackView } from "./Protvista.types";
import { hasFragments, Track } from "../../../domain/entities/Track";
import { renderToString } from "react-dom/server";
import { Tooltip } from "./Tooltip";

export function loadPdb(
    protvistaRef: React.RefObject<ProtvistaTrackElement>,
    pdb: Pdb,
    options: Partial<PdbView> = {}
): React.RefObject<ProtvistaTrackElement> | undefined {
    const protvistaEl = protvistaRef.current;
    if (!protvistaEl || _(pdb.tracks).isEmpty()) return;

    const pdbView = getPdbView(pdb);
    protvistaEl.viewerdata = { ...pdbView, ...options };

    protvistaEl.layoutHelper.hideSubtracks(0);

    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });

    return protvistaRef;
}

export function getSectionStyle(
    state: State,
    ref: React.RefObject<ProtvistaTrackElement>
): React.CSSProperties {
    return {
        opacity: state.type !== "loaded" || !state.refs.includes(ref) ? 0 : 1,
    };
}

function getPdbView(pdb: Pdb): PdbView {
    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        displayVariants: !!pdb.variants,
        tracks: _.compact(
            pdb.tracks.map(track => {
                const trackData = getTrackData(track);
                return _.isEmpty(trackData) ? null : { ...track, data: trackData };
            })
        ),
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

function getTrackData(track: Track): TrackView["data"] {
    return _.flatMap(track.subtracks, subtrack =>
        hasFragments(subtrack)
            ? [
                  {
                      ...subtrack,
                      labelTooltip: subtrack.label,
                      locations: subtrack.locations.map(location => ({
                          ...location,
                          fragments: location.fragments.map(fragment => ({
                              ...fragment,
                              tooltipContent: renderToString(<Tooltip fragment={fragment} />),
                          })),
                      })),
                  },
              ]
            : []
    );
}
