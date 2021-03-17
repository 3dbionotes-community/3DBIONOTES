import _ from "lodash";
import { groupedPairsBy, notNil } from "../../utils/ts-utils";
import { getTracksFromSubtrack } from "../definitions/tracks";
import { Evidence } from "./Evidence";
import { Subtrack, Track } from "./Track";
import { SubtrackDefinition } from "./TrackDefinition";

export type Fragments = Fragment2[];

export interface Fragment2 {
    subtrack: SubtrackDefinition;
    start: number;
    end: number;
    description: string;
    evidences?: Evidence[];
}

export function getTracksFromFragments(fragments: Fragments): Track[] {
    const trackDefinitions = _(fragments)
        .flatMap(fragment => getTracksFromSubtrack(fragment.subtrack))
        .compact()
        .uniq()
        .value();

    const groupedFragments = groupedPairsBy(fragments, fragment => fragment.subtrack);

    const subtracksById = _(groupedFragments)
        .map(
            ([subtrackDef, fragmentsForSubtrack]): Subtrack => {
                return {
                    accession: subtrackDef.id,
                    type: subtrackDef.id,
                    label: subtrackDef.name,
                    labelTooltip: subtrackDef.description,
                    shape: subtrackDef.shape || "rectangle",
                    locations: [
                        {
                            fragments: fragmentsForSubtrack.map(fragment => {
                                return {
                                    start: fragment.start,
                                    end: fragment.end,
                                    description: fragment.description,
                                    evidences: fragment.evidences,
                                    color: subtrackDef.color || "#200",
                                };
                            }),
                        },
                    ],
                };
            }
        )
        .keyBy(subtrack => subtrack.accession)
        .value();

    return trackDefinitions.map(
        (trackDef): Track => {
            return {
                id: trackDef.id,
                label: trackDef.name,
                description: trackDef.description,
                overlapping: false,
                subtracks: _(subtracksById)
                    .at(...trackDef.subtracks.map(subtrack => subtrack.id))
                    .compact()
                    .value(),
            };
        }
    );
}

export function getFragments<Feature>(
    features: Feature[],
    mapper: (feature: Feature) => LooseFragment2 | undefined
): Fragment2[] {
    return features
        .map(feature => {
            const looseFragment = mapper(feature);
            return looseFragment ? getFragment(looseFragment) : undefined;
        })
        .filter(notNil);
}

export type FragmentResult = LooseFragment2 | undefined;

/* Internal */

interface LooseFragment2 extends Omit<Fragment2, "start" | "end"> {
    start: number | string;
    end: number | string;
}

function getFragment(looseFragment: LooseFragment2): Fragment2 | undefined {
    const { start, end } = looseFragment;
    const startNum = Number(start);
    const endNum = Number(end);
    const fragment = { ...looseFragment, start: startNum, end: endNum };

    return isNaN(startNum) || isNaN(endNum) ? undefined : fragment;
}
