import { D2Api } from "./types/d2-api";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";

export function getCompositionRoot(api: D2Api) {
    const dataValueRepository = new Dhis2DataValueRepository(api);

    return {
        dataValues: {
            get: new GetDataValuesUseCase(dataValueRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
