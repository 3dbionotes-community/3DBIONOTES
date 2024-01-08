import { Future } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import { Organism } from "../entities/LigandImageData";
import { Ontology, OntologyTerm } from "../entities/Ontology";
import { OntologyRepository } from "../repositories/OntologyRepository";
import { OrganismRepository } from "../repositories/OrganismRepository";
import { PdbOptions, PdbRepository } from "../repositories/PdbRepository";

export class GetPdbUseCase {
    idrCache: Maybe<IDROptions>;

    constructor(
        private pdbRepository: PdbRepository,
        private ontologyRepository: OntologyRepository,
        private organismRepository: OrganismRepository
    ) {}

    execute(options: PdbOptions) {
        if (this.idrCache) return this.pdbRepository.get(options, this.idrCache);
        else
            return Future.joinObj({
                ontologies: this.ontologyRepository.getOntologies(),
                ontologyTerms: this.ontologyRepository.getOntologyTerms(),
                organisms: this.organismRepository.getOrganisms(),
            })
                .tap(idrCache => {
                    this.idrCache = idrCache;
                })
                .flatMap(idrCache => this.pdbRepository.get(options, idrCache));
    }
}

export interface IDROptions {
    ontologies: Ontology[];
    ontologyTerms: OntologyTerm[];
    organisms: Organism[];
}
