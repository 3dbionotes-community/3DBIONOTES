import _ from "lodash";
import { AtomicStructure, ChainObject } from "../../domain/entities/AtomicStructure";
import {
    AtomicStructureRepository,
    BuildOptions,
} from "../../domain/entities/AtomicStructureRepository";
import { FutureData } from "../../domain/entities/FutureData";
import { Future } from "../../utils/future";
import {
    BionotesAnnotationResponse,
    annotationResponseExample,
} from "./BionotesAnnotationResponse";

const _url = "http://3dbionotes.cnb.csic.es/upload";

export class BionotesAtomicStructureRepository implements AtomicStructureRepository {
    build(_options: BuildOptions): FutureData<AtomicStructure> {
        // return request(config.upload.url, options).map(_res => uploadMockData);
        return Future.success<BionotesAnnotationResponse, Error>(annotationResponseExample).map(
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
