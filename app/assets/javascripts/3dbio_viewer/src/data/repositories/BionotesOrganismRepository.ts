import { FutureData } from "../../domain/entities/FutureData";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getValidatedJSON } from "../request-utils";
import { Organism } from "../../domain/entities/LigandImageData";
import { getOrganism, OrganismsResponse, organismsResponseC } from "../Organisms";
import { OrganismRepository } from "../../domain/repositories/OrganismRepository";
import i18n from "../../domain/utils/i18n";

export class BionotesOrganismRepository implements OrganismRepository {
    getOrganisms(): FutureData<Organism[]> {
        return getValidatedJSON<OrganismsResponse>(
            `${bioUrlDev}/bws/api/organisms/`,
            organismsResponseC
        ).flatMap(organisms =>
            organisms
                ? Future.success(organisms.results.map(organism => getOrganism(organism)))
                : Future.error({ message: i18n.t("No organisms found.") })
        );
    }
}

const { bionotes: _bioUrl, bionotesStaging: bioUrlDev } = routes;
