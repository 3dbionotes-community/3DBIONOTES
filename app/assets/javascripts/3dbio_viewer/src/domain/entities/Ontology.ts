export interface Ontology {
    id: string;
    name: string;
    description: string;
    externalLink: string;
}

export interface OntologyTerm extends Ontology {
    source: string; // ref to Ontology
}
