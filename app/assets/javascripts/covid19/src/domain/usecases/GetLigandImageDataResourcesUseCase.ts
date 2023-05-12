import { LigandsRepository } from "../repositories/LigandsRepository";
import { Future } from "../../data/utils/future";
import { Organism } from "../entities/LigandImageData";
import { Ontology, OntologyTerm } from "../entities/Ontology";
import { OntologyRepository } from "../repositories/OntologyRepository";
import { OrganismRepository } from "../repositories/OrganismsRepository";
import { Maybe } from "../../data/utils/ts-utils";

export class GetLigandImageDataResourcesUseCase {
    idrCache: Maybe<IDROptions>;
    constructor(
        private ligandsRepository: LigandsRepository,
        private ontologyRepository: OntologyRepository,
        private organismRepository: OrganismRepository
    ) {}

    execute(inChI: string, pdbId: string) {
        if (this.idrCache)
            return this.ligandsRepository.getImageDataResource(inChI, pdbId, this.idrCache);
        else
            return Future.joinObj({
                ontologies: this.ontologyRepository.getOntologies(),
                ontologyTerms: this.ontologyRepository.getOntologyTerms(),
                organisms: this.organismRepository.getOrganisms(),
            })
                .tap(idrCache => {
                    this.idrCache = idrCache;
                })
                .flatMap(idrCache =>
                    this.ligandsRepository.getImageDataResource(inChI, pdbId, idrCache)
                );
    }
}

export interface IDROptions {
    ontologies: Ontology[];
    ontologyTerms: OntologyTerm[];
    organisms: Organism[];
}
