import _ from "lodash";
import {
    addPdbValidationToStructure,
    buildPdbRedoValidation,
    Covid19Info,
} from "../entities/Covid19Info";
import { CacheRepository, fromCache } from "../repositories/CacheRepository";
import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class AddDynamicInfoToCovid19InfoUseCase {
    constructor(
        private covid19InfoRepository: Covid19InfoRepository,
        private cacheRepository: CacheRepository
    ) {}

    execute(data: Covid19Info, options: { ids: string[] }) {
        return this.addPdbRedoValidation(data, options);
    }

    async addPdbRedoValidation(
        data: Covid19Info,
        options: { ids: string[] }
    ): Promise<Covid19Info> {
        if (_.isEmpty(options.ids)) return data;

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

        const structuresUpdated = await Promise.all(structuresUpdated$);
        if (_.isEqual(structuresToUpdate, structuresUpdated)) return data;

        const structuresUpdatedById = _.keyBy(structuresUpdated, structure => structure.id);
        const structures2 = data.structures.map(st => structuresUpdatedById[st.id] || st);

        return { structures: structures2 };
    }
}
