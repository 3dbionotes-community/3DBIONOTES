import { FragmentResult, Fragments, getFragments } from "../../../domain/entities/Fragment2";
import { subtracks } from "./definitions";
import _ from "lodash";
import { SubtrackDefinition } from "../../../domain/entities/TrackDefinition";

// http://3dbionotes.cnb.csic.es/compute/molprobity/1iyj

export interface MolprobityResponse {
    id: string;
    status: string;
    rota?: ItemsByChain[];
    rama?: ItemsByChain[];
    omega?: ItemsByChain[];
}

type ItemsByChain = Record<string, MolprobityItem[]>;

export interface MolprobityItem {
    begin: number;
    end: number;
    type: string;
    description: string;
}

export function getMolprobityFragments(response: MolprobityResponse, chain: string): Fragments {
    return _.concat(
        getFragmentsFor(subtracks.rotamerOutlier, response.rota || [], chain),
        getFragmentsFor(subtracks.phiPsiOutliers, response.rama || [], chain)
    );
}

export function getFragmentsFor(
    subtrack: SubtrackDefinition,
    itemsByChainList: ItemsByChain[],
    chain: string
): Fragments {
    const itemsByChain: ItemsByChain = _.merge({}, ...itemsByChainList);

    return getFragments(
        itemsByChain[chain],
        (item): FragmentResult => {
            return {
                subtrack,
                start: item.begin,
                end: item.begin,
                description: item.description,
            };
        }
    );
}
