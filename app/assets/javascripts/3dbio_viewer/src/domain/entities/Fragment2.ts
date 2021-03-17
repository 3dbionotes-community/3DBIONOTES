import _ from "lodash";
import { notNil } from "../../utils/ts-utils";
import { getSubtrackFromId, getTrackFromSubtrack, SubtrackId } from "../definitions/tracks";
import { Evidence } from "./Evidence";
import { Subtrack, Track } from "./Track";

export type Fragments = Fragment2[];

export interface Fragment2 {
    subtrackId: SubtrackId;
    start: number;
    end: number;
    description: string;
    evidences?: Evidence[];
}

export function getTracksFromFragments(fragments: Fragments): Track[] {
    return _(fragments)
        .map(fragment => ({ trackDef: getTrackFromSubtrack(fragment.subtrackId), fragment }))
        .groupBy(obj => obj.trackDef?.id)
        .map((objs, trackId) => {
            const trackDef = objs[0]!.trackDef!;

            const track: Track = {
                id: trackId,
                label: trackDef.name,
                description: trackDef.description,
                overlapping: false,
                subtracks: _(objs)
                    .groupBy(obj => obj.fragment.subtrackId)
                    .map((objs, subtrackId) => {
                        const subtrackDef = getSubtrackFromId(subtrackId);
                        if (!subtrackDef) return;

                        const subtrack: Subtrack = {
                            accession: subtrackId,
                            type: subtrackId,
                            label: subtrackDef.name,
                            labelTooltip: subtrackDef.description,
                            shape: "rectangle", // TODO
                            locations: [
                                {
                                    fragments: objs.map(({ fragment }) => {
                                        return {
                                            start: fragment.start,
                                            end: fragment.end,
                                            description: fragment.description,
                                            evidences: fragment.evidences,
                                            color: "black", // TODO
                                        };
                                    }),
                                },
                            ],
                        };

                        return subtrack;
                    })
                    .compact()
                    .value(),
            };

            return track;
        })
        .value();
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
