import _ from "lodash";
import { AtomicStructure, ChainObject } from "../../domain/entities/AtomicStructure";
import {
    AtomicStructureRepository,
    BuildOptions,
} from "../../domain/entities/AtomicStructureRepository";
import { FutureData } from "../../domain/entities/FutureData";
import { routes } from "../../routes";
import { request } from "../request-utils";
import { BionotesAnnotationResponse } from "./BionotesAnnotationResponse";

const url = routes.rinchen2 + "/upload";

export class BionotesAtomicStructureRepository implements AtomicStructureRepository {
    build(options: BuildOptions): FutureData<AtomicStructure> {
        const data = new FormData();
        const headers = {
            "content-type": "multipart/form-data",
            accept: "application/json",
        };

        data.append("structure_file", options.structureFile);
        if (options.jobTitle) {
            data.append("title", options.jobTitle);
        }
        if (options.annotationsFile) {
            data.append("annotations_file", options.annotationsFile);
        }
        return request<BionotesAnnotationResponse>({ method: "POST", url, data, headers }).map(
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
