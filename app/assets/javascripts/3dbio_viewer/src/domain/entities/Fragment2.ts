import _ from "lodash";
import { from as withoutUndefinedValues, throwError } from "../../utils/misc";
import { groupedPairsBy } from "../../utils/ts-utils";
import { getTracksFromSubtrack, trackDefinitions } from "../definitions/tracks";
import { Color } from "./Color";
import { Evidence, Reference } from "./Evidence";
import { Fragment } from "./Fragment";
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
    color?: Color;
    legend?: Legend;
    alternativeSequence?: string;
    evidences?: Evidence[];
    crossReferences?: Reference[];
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
        ([subtrack, fragmentsForSubtrack]): Subtrack => {
            // Some features may be repeated in different data sources, join them
            const uniqueFragments = _(fragmentsForSubtrack)
                .groupBy(fragment => [fragment.start, fragment.end].join("-"))
                .values()
                .map(joinFragments)
                .compact()
                .value();

            const fragments: Fragment2[] = uniqueFragments.map(
                (fragment): Fragment2 => {
                    return {
                        subtrack: fragment.subtrack,
                        start: fragment.start,
                        end: fragment.end,
                        description: fragment.description || "",
                        color: fragment.color || subtrack.color || "#200",
                        ...withoutUndefinedValues({
                            id: fragment.id,
                            evidences: fragment.evidences,
                            legend: fragment.legend,
                            alternativeSequence: fragment.alternativeSequence,
                            crossReferences: fragment.crossReferences,
                        }),
                    };
                }
            );

            return {
                accession: subtrack.dynamicSubtrack ? subtrack.dynamicSubtrack.id : subtrack.id,
                type: subtrack.name,
                label: subtrack.name,
                labelTooltip: subtrack.description,
                shape: subtrack.shape || "rectangle",
                source: subtrack.source,
                isBlast: subtrack.isBlast ?? true,
                locations: [{ fragments }],
                subtype: subtrack.subtype,
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

export function getFragmentsList<Feature>(
    features: Feature[] | undefined,
    mapper: (feature: Feature) => Array<LooseFragment2 | undefined>
): Fragment2[] {
    return _(features || [])
        .flatMap(feature => mapper(feature))
        .compact()
        .map(looseFragment => toNumericInterval(looseFragment))
        .compact()
        .value();
}

export function getFragments<Feature>(
    features: Feature[] | undefined,
    mapper: (feature: Feature) => LooseFragment2 | undefined
): Fragment2[] {
    return getFragmentsList(features, feature => _.compact([mapper(feature)]));
}

export type FragmentResult = LooseFragment2 | undefined;

export function getConflict(sequence: string, fragment: Fragment | Fragment2): string | undefined {
    if (!fragment.alternativeSequence) return;

    const { start, end, alternativeSequence } = fragment;
    const original = sequence.substring(start - 1, end) || "-";
    return `${original} > ${alternativeSequence}`;
}

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
