import { FutureData } from "../entities/FutureData";
import { Ontology, OntologyTerm } from "../entities/Ontology";

export interface OntologyRepository {
    getOntologies(): FutureData<Ontology[]>;
    getOntologyTerms(): FutureData<OntologyTerm[]>;
}
