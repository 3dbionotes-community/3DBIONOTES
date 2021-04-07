import _ from "lodash";
import { AtomicStructure, ChainObject } from "../../domain/entities/AtomicStructure";
import {
    AtomicStructureRepository,
    BuildOptions,
} from "../../domain/entities/AtomicStructureRepository";
import { FutureData } from "../../domain/entities/FutureData";
import { request } from "../request-utils";
import { BionotesAnnotationResponse } from "./BionotesAnnotationResponse";

//const url = "http://3dbionotes.cnb.csic.es/upload";
const url = "/3dbionotes/upload";

export class BionotesAtomicStructureRepository implements AtomicStructureRepository {
    build(_options: BuildOptions): FutureData<AtomicStructure> {
        // Use _options to build a multiform part
        return request<BionotesAnnotationResponse>({ method: "POST", url }).map(
            getAtomicStructureFromResponse
        );
    }
}

function getAtomicStructureFromResponse(annotation: BionotesAnnotationResponse): AtomicStructure {
    return {
        ...annotation,
        chains: _.mapValues(annotation.chains, (chains, chainName) =>
            chains.map(
                (chain): ChainObject => ({
                    ...chain,
                    id: [chainName, chain.acc].join("-"),
                    chainName,
                    name: chain.title.name.long,
                    org: chain.title.org.long,
                })
            )
        ),
    };
}
