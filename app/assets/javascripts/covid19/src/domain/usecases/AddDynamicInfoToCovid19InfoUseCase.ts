import _ from "lodash";
import { Covid19Info, Structure } from "../entities/Covid19Info";
import { CacheRepository } from "../repositories/CacheRepository";
import { Covid19InfoRepository } from "../repositories/Covid19InfoRepository";

export class AddDynamicInfoToCovid19InfoUseCase {
    constructor(
        private covid19InfoRepository: Covid19InfoRepository,
        private cacheRepository: CacheRepository
    ) {}

    execute(data: Covid19Info, options: { ids: string[] }): Promise<Structure[]> {
        return this.getStructures(data, options);
    }

    async getStructures(data: Covid19Info, options: { ids: string[] }): Promise<Structure[]> {
        if (_.isEmpty(options.ids)) return [];

        const structuresById = _.keyBy(data.structures, structure => structure.id);
        const structuresToUpdate = _(structuresById).at(options.ids).compact().value();

        const structuresUpdated$ = structuresToUpdate;

        return Promise.all(structuresUpdated$);
    }
}
