import { GetDataValuesUseCase } from "./domain/usecases/GetDataValuesUseCase";

export function getCompositionRoot() {
    return {};
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
