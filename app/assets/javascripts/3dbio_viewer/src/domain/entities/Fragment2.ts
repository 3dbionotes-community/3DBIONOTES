import _ from "lodash";
import { from, throwError } from "../../utils/misc";
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
            // Some features may be repeated in differnet data sources, join them
            const uniqueFragments = _(fragmentsForSubtrack)
                .groupBy(fragment => [fragment.start, fragment.end].join("-"))
                .values()
                .map(joinFragments)
                .compact()
                .value();

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
                        fragments: uniqueFragments.map(fragment => {
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

function joinFragments(fragments: Fragment2[]): Fragment2 {
    const [reference, ...restFragments] = fragments;
    if (!reference) throwError();

    // The first fragment is used as reference, only different evidences from the rest of fragments are added
    const otherEvidences = _.flatMap(restFragments, f => f.evidences || []);
    const evidences = _.concat(reference.evidences || [], otherEvidences);
    return { ...reference, evidences };
}

export function getFragments<Feature>(
    features: Feature[] | undefined,
    mapper: (feature: Feature) => LooseFragment2 | undefined
): Fragment2[] {
    return (features || [])
        .map(feature => {
            const looseFragment = mapper(feature);
            return looseFragment ? toNumericInterval(looseFragment) : undefined;
        })
        .filter(notNil);
}

export type FragmentResult = LooseFragment2 | undefined;

/* Internal */

export interface Interval {
    start: number;
    end: number;
}

export function getIntervalKey<T extends LooseInterval>(obj: T): string {
    return [obj.start, obj.end].join("-");
}

interface LooseInterval {
    start: number | string;
    end: number | string;
}

type LooseFragment2 = Omit<Fragment2, "start" | "end"> & LooseInterval;

export function toNumericInterval<F extends LooseInterval>(
    looseFragment: F
): (Omit<F, "start" | "end"> & Interval) | undefined {
    const { start, end } = looseFragment;
    const startNum = Number(start);
    const endNum = Number(end);
    const fragment = { ...looseFragment, start: startNum, end: endNum };

    return isNaN(startNum) || isNaN(endNum) ? undefined : fragment;
}
