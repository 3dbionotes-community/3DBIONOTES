import _ from "lodash";
import { from } from "../../utils/misc";
import { groupedPairsBy, notNil } from "../../utils/ts-utils";
import { getTracksFromSubtrack, trackDefinitions } from "../definitions/tracks";
import { Color } from "./Color";
import { Evidence } from "./Evidence";
import { Legend } from "./Legend";
import { Subtrack, Track } from "./Track";
import { SubtrackDefinition } from "./TrackDefinition";

export type Fragments = Fragment2[];

export interface Fragment2 {
    id?: string;
    subtrack: SubtrackDefinition;
    start: number;
    end: number;
    description?: string;
    evidences?: Evidence[];
    color?: Color;
    legend?: Legend;
}

export function getTracksFromFragments(fragments: Fragments): Track[] {
    const indexes = _(trackDefinitions)
        .values()
        .map((trackDef, idx) => [trackDef.id, idx] as [string, number])
        .fromPairs()
        .value();

    const trackDefinitionsFromFragments = _(fragments)
        .flatMap(fragment => getTracksFromSubtrack(fragment.subtrack))
        .compact()
        .uniq()
        .sortBy(trackDefinition => indexes[trackDefinition.id])
        .value();

    const groupedFragments = groupedPairsBy(fragments, fragment => fragment.subtrack);

    const subtracks = groupedFragments.map(
        ([subtrackDef, fragmentsForSubtrack]): Subtrack => {
            return {
                accession: subtrackDef.dynamicSubtrack
                    ? subtrackDef.dynamicSubtrack.id
                    : subtrackDef.id,
                type: subtrackDef.name,
                label: subtrackDef.name,
                labelTooltip: subtrackDef.description,
                shape: subtrackDef.shape || "rectangle",
                source: subtrackDef.source,
                isBlast: subtrackDef.isBlast ?? true,
                locations: [
                    {
                        fragments: fragmentsForSubtrack.map(fragment => {
                            return {
                                start: fragment.start,
                                end: fragment.end,
                                description: fragment.description || "",
                                color: fragment.color || subtrackDef.color || "#200",
                                ...from({
                                    id: fragment.id,
                                    evidences: fragment.evidences,
                                    legend: fragment.legend,
                                }),
                            };
                        }),
                    },
                ],
            };
        }
    );

    const subtracksById = _.groupBy(subtracks, subtrack => subtrack.accession);

    return trackDefinitionsFromFragments.map(
        (trackDef): Track => {
            const subtrackIds = trackDef.subtracks.map(subtrack => subtrack.id);

            return {
                id: trackDef.id,
                label: trackDef.name,
                description: trackDef.description,
                overlapping: false,
                subtracks: _(subtracksById)
                    .at(...subtrackIds)
                    .flatten()
                    .compact()
                    .value(),
            };
        }
    );
}

export function getFragments<Feature>(
    features: Feature[] | undefined,
    mapper: (feature: Feature) => LooseFragment2 | undefined
): Fragment2[] {
    return (features || [])
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
