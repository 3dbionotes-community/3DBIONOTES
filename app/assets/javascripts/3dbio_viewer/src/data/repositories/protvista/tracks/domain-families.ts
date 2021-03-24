import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Fragments, getFragments } from "../../../../domain/entities/Fragment2";

// Domain family: Pfam, smart, interpro

export type PfamAnnotations = PfamAnnotation[];

export interface PfamAnnotation {
    start: string;
    end: string;
    acc: string;
    id: string;
    info: {
        description: string;
        go: Partial<{
            component: string[];
            function: string[];
            process: string[];
        }>;
    };
}

export type SmartAnnotations = SmartAnnotation[];

export interface SmartAnnotation {
    domain: string;
    start: string;
    end: string;
    evalue: string;
    type: string;
    status: string;
}

export function getDomainFamiliesFragments(
    pfamAnnotations: PfamAnnotations | undefined,
    smartAnnotations: SmartAnnotations | undefined
): Fragments {
    const pfamFragments = getFragments(pfamAnnotations, annotation => {
        return {
            subtrack: subtracks.pfamDomain,
            start: annotation.start,
            end: annotation.end,
            description: "Imported from Pfam",
        };
    });

    const smartFragments = getFragments(smartAnnotations, annotation => {
        return {
            subtrack: subtracks.smartDomains,
            start: annotation.start,
            end: annotation.end,
            description: "Imported from SMART",
        };
    });

    return _.concat(pfamFragments, smartFragments);
}
