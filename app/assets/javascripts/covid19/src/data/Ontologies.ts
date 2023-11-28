import { array, Codec, GetType, nullable, number, string } from "purify-ts";

function getOntologiesResponse<T>(codec: Codec<T>) {
    return Codec.interface({
        count: number,
        next: nullable(string),
        previous: nullable(string),
        results: codec,
    });
}

const ontology = {
    dbId: string,
    name: string,
    description: string,
    externalLink: string,
};

const ontologyC = Codec.interface(ontology);
const ontologyTermC = Codec.interface({ ...ontology, source: string });

export const ontologiesResponseC = getOntologiesResponse(array(ontologyC));
export const ontologyTermsResponseC = getOntologiesResponse(array(ontologyTermC));

export type OntologiesResponse = GetType<typeof ontologiesResponseC>;
export type OntologyTermsResponse = GetType<typeof ontologyTermsResponseC>;

export function getFromBioRef<T extends { dbId: string }>(bioRef: T): T & { id: string } {
    return {
        ...bioRef,
        id: bioRef.dbId,
    };
}
