import _ from "lodash";
import {
    addPdbValidationToStructure,
    buildPdbRedoValidation,
    Covid19Info,
    Structure,
} from "../entities/Covid19Info";
import { CacheRepository, fromCache } from "../repositories/CacheRepository";
import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class AddDynamicInfoToCovid19InfoUseCase {
    constructor(
        private covid19InfoRepository: Covid19InfoRepository,
        private cacheRepository: CacheRepository
    ) {}

    execute(data: Covid19Info, options: { ids: string[] }): Promise<Structure[]> {
        return this.getStructuresWithPdbRedoValidation(data, options);
    }

    async getStructuresWithPdbRedoValidation(
        data: Covid19Info,
        options: { ids: string[] }
    ): Promise<Structure[]> {
        if (_.isEmpty(options.ids)) return [];

        const structuresById = _.keyBy(data.structures, structure => structure.id);
        const structuresToUpdate = _(structuresById).at(options.ids).compact().value();

        const structuresUpdated$ = structuresToUpdate.map(async structure => {
            const { pdb } = structure;
            if (!pdb) return structure;

            const validation = buildPdbRedoValidation(pdb.id);

            const hasPdbRedo = await fromCache(this.cacheRepository, {
                key: `pdb-${pdb.id}`,
                get: () => this.covid19InfoRepository.hasPdbRedoValidation(pdb.id),
            });

            return hasPdbRedo ? addPdbValidationToStructure(structure, validation) : structure;
        });

        return Promise.all(structuresUpdated$);
    }
}
