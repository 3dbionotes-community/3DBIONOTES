import { FutureData } from "../entities/FutureData";
import { Organism } from "../entities/LigandImageData";

export interface OrganismRepository {
    getOrganisms(): FutureData<Organism[]>;
}
