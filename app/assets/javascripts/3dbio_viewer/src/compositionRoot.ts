import { PdbRepositoryNetwork } from "./data/repositories/protvista/PdbRepositoryNetwork";
import { GetPdbUseCase } from "./domain/usecases/GetPdbUseCase";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCompositionRoot() {
    const pdbRepository = new PdbRepositoryNetwork();

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
