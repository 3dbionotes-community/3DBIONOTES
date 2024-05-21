import { FutureData } from "../../domain/entities/FutureData";
import { Ontology, OntologyTerm } from "../../domain/entities/Ontology";
import { OntologyRepository } from "../../domain/repositories/OntologyRepository";
import i18n from "../../domain/utils/i18n";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getValidatedJSON } from "../request-utils";
import {
    getFromBioRef,
    OntologiesResponse,
    ontologiesResponseC,
    OntologyTermsResponse,
    ontologyTermsResponseC,
} from "../Ontologies";

export class BionotesOntologyRepository implements OntologyRepository {
    getOntologies(): FutureData<Ontology[]> {
        return getValidatedJSON<OntologiesResponse>(
            `${bioUrl}/bws/api/ontologies/`,
            ontologiesResponseC
        ).flatMap(ontology =>
            ontology
                ? Future.success(ontology.results.map(ontology => getFromBioRef(ontology)))
                : Future.error({ message: i18n.t("No ontologies found.") })
        );
    }

    getOntologyTerms(): FutureData<OntologyTerm[]> {
        return getValidatedJSON<OntologyTermsResponse>(
            `${bioUrl}/bws/api/ontologies/terms/`,
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

const { bionotes: bioUrl } = routes;
