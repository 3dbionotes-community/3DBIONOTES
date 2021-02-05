import { ApiPdbRepository } from "./data/repositories/protvista/ApiPdbRepository";
import { GetPdbUseCase } from "./domain/usecases/GetPdbUseCase";

export function getCompositionRoot() {
    const pdbRepository = new ApiPdbRepository();

    return getExecute({
        getPdb: new GetPdbUseCase(pdbRepository),
    });
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

export interface UseCase {
    execute(...args: unknown[]): unknown;
}

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];

    return keys.reduce<{ [K in Key]?: UseCases[K]["execute"] }>((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, {}) as { [K in Key]: UseCases[K]["execute"] };
}