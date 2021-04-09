import _ from "lodash";
import axios, { AxiosResponse } from 'axios';
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
    async doPostRequest(_options: BuildOptions): Promise<AxiosResponse> {
        const formData = new FormData();
        formData.append('structure_file', _options.structureFile);
        formData.append('title', "test");

        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                "accept": "application/json",
            }
    }
    const ff = await axios.post(routes.rinchen2+"/upload", formData, config);
    return ff;
    }
    build(options: BuildOptions): FutureData<AtomicStructure> {
        const data = new FormData();
        data.append('structure_file', options.structureFile);
        data.append('title', "test");
        //const fff = this.doPostRequest(options);
        // TODO:  Post a multipart form from options
        return request<BionotesAnnotationResponse>({ method: "POST", url, data, headers: {'content-type': 'multipart/form-data',
        "accept": "application/json",} }).map(
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
