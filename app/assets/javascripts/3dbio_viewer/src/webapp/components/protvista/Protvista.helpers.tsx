import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbView, ProtvistaBlock, ProtvistaTrackElement, TrackView } from "./Protvista.types";
import { hasFragments, Track } from "../../../domain/entities/Track";
import { renderToString } from "react-dom/server";
import { Tooltip } from "./Tooltip";
import { recordOf } from "../../../utils/ts-utils";

export type BlockDef = Omit<ProtvistaBlock, "pdbView">;

const blockDefs = recordOf<BlockDef>()({
    main: {
        id: "structural-info",
        title: "Structural information",
        description:
            "Spike protein, trimeric complex S1-S2-S2: Attaches the virion to the cell membrane  by interacting with host receptor, initiating the infection. Binding to human ACE2 receptor and internalization of the virus into the endosomes of the host cell induces conformational changes in the Spike glycoprotein. Uses also human TMPRSS2 for priming in human lung cells which is an essential step for viral entry.",
        help: "Some help",
    },
    validations: {
        id: "map-validation",
        title: "Map Validation",
        description:
            "The merge function allows the user to merge multiple .po files into a single file. During the process of merging that application will validate that the table, language, and column for the PO files are the same. If they are not then an error will be returned. The action here is to take unique rowId entries from each file and merge them to a single file.",
        help: "Some help",
    },
});

export function getBlocks(pdb: Pdb): ProtvistaBlock[] {
    const [tracks1, tracks2] = _.partition(pdb.tracks, track => track.id !== "em-validation");

    const pdbs = recordOf<Pdb>()({
        main: { ...pdb, tracks: tracks1 },
        validations: { ...pdb, tracks: tracks2, variants: undefined },
    });

    const blocks = [
        { ...blockDefs.main, pdbView: getPdbView(pdbs.main) },
        { ...blockDefs.validations, pdbView: getPdbView(pdbs.validations) },
    ];

    return _.compact(blocks);
}

export function loadPdbView(elementRef: React.RefObject<ProtvistaTrackElement>, pdbView: PdbView) {
    const protvistaEl = elementRef.current;
    if (!protvistaEl) return;

    protvistaEl.viewerdata = pdbView;

    protvistaEl.layoutHelper.hideSubtracks(0);

    // Collapse first track, which is expanded by default
    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });
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
                const subtracks = getTrackData(track);
                if (_.isEmpty(subtracks)) return null;
                return {
                    ...track,
                    data: subtracks,
                    help: "TODO",
                };
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
                      help: "TODO",
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
