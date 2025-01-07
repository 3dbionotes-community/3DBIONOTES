import { Fragment2, Interval } from "./Fragment2";
import { Fragment } from "./Fragment";

type FragmentP = Fragment | Fragment2;

export function isCovered(alignment: Interval[], fragment: FragmentP): boolean {
    return alignment.some(
        interval => fragment.start >= interval.start && fragment.end <= interval.end
    );
}

export function isPartiallyCovered(alignment: Interval[], fragment: FragmentP): boolean {
    return alignment.some(
        interval => fragment.start <= interval.end && fragment.end >= interval.start
    );
}

export function isNotCovered(alignment: Interval[], fragment: FragmentP): boolean {
    return !isCovered(alignment, fragment) && !isPartiallyCovered(alignment, fragment);
}
