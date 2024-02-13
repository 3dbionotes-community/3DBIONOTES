import _ from "lodash";
import { array, Codec, GetType, nullType, number, oneOf, string } from "purify-ts";
import { Organism } from "../domain/entities/LigandImageData";

function maybeNull<Data>(type: Codec<Data>) {
    return oneOf([type, nullType]);
}

function getOrganismsResponse<T>(codec: Codec<T>) {
    return Codec.interface({
        count: number,
        next: maybeNull(string),
        previous: maybeNull(string),
        results: codec,
    });
}

const organismC = Codec.interface({
    ncbi_taxonomy_id: string,
    scientific_name: string,
    common_name: string,
    externalLink: string,
});

export const organismsResponseC = getOrganismsResponse(array(organismC));

export type OrganismsResponse = GetType<typeof organismsResponseC>;

export function getOrganism(bioOrganism: GetType<typeof organismC>): Organism {
    return {
        id: bioOrganism.ncbi_taxonomy_id,
        name: bioOrganism.common_name,
        commonName: bioOrganism.common_name,
        externalLink: bioOrganism.externalLink,
    };
}
