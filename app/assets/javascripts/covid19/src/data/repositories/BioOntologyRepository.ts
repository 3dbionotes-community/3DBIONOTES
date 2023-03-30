import {
    getFromBioRef,
    OntologiesResponse,
    ontologiesResponseC,
    OntologyTermsResponse,
    ontologyTermsResponseC,
} from "../Ontologies";
import { FutureData } from "../../domain/entities/FutureData";
import { Ontology, OntologyTerm } from "../../domain/entities/Ontology";
import { OntologyRepository } from "../../domain/repositories/OntologyRepository";
import { routes } from "../../routes";
import { Future } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import i18n from "../../utils/i18n";

export class BionotesOntologyRepository implements OntologyRepository {
    getOntologies(): FutureData<Ontology[]> {
        return getValidatedJSON<OntologiesResponse>(
            `${bionotesApi}/ontologies/`,
            ontologiesResponseC
        ).flatMap(ontology =>
            ontology
                ? Future.success(ontology.results.map(ontology => getFromBioRef(ontology)))
                : Future.error({ message: i18n.t("No ontologies found.") })
        );
    }

    getOntologyTerms(): FutureData<OntologyTerm[]> {
        return getValidatedJSON<OntologyTermsResponse>(
            `${bionotesApi}/ontologies/terms/`,
            ontologyTermsResponseC
        ).flatMap(ontologyTerms =>
            ontologyTerms
                ? Future.success(
                      ontologyTerms.results.map(ontologyTerm => getFromBioRef(ontologyTerm))
                  )
                : Future.error({ message: i18n.t("No ontology terms found.") })
        );
    }
}

const { bionotesApi } = routes;
