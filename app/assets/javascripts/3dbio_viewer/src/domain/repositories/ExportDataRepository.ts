import { FutureData } from "../entities/FutureData";
import { Emdb } from "../entities/Pdb";
import { Maybe } from "../../utils/ts-utils";

export interface ExportDataRepository {
    exportAllAnnotations(props: {
        proteinId: Maybe<string>;
        pdbId: Maybe<string>;
        chainId: string;
        emdbs: Emdb[];
    }): FutureData<void>;
}
