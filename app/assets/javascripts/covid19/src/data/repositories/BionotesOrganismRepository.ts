import { routes } from "../../routes";
import { Organism } from "../../domain/entities/LigandImageData";
import { getOrganism, OrganismsResponse, organismsResponseC } from "../Organisms";
import { OrganismRepository } from "../../domain/repositories/OrganismsRepository";
import { Future } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";
import { FutureData } from "../../domain/entities/FutureData";
import i18n from "../../utils/i18n";

export class BionotesOrganismRepository implements OrganismRepository {
    getOrganisms(): FutureData<Organism[]> {
        return getValidatedJSON<OrganismsResponse>(
            `${bionotesApi}/organisms/`,
            organismsResponseC
        ).flatMap(organisms =>
            organisms
                ? Future.success(organisms.results.map(organism => getOrganism(organism)))
                : Future.error({ message: i18n.t("No organisms found.") })
        );
    }
}

const { bionotesApi } = routes;
