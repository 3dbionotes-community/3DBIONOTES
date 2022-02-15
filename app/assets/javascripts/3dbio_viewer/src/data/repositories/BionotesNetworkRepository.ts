import { FutureData } from "../../domain/entities/FutureData";
import {
    BuildResponse,
    NetworkDefinition,
    NetworkRepository,
} from "../../domain/repositories/NetworkRepository";
import { routes } from "../../routes";
import { postFormRequest } from "../../utils/form-request";
import { Future } from "../../utils/future";

/*

Calculate Protein-protein interaction networks.

Workflow:

(Check old endpoint http://rinchen-dos.cnb.csic.es:8882/ws/network)

    POST http://3dbionotes.cnb.csic.es/network/build
    Location -> http://3dbionotes.cnb.csic.es/network/restore/JOBID

    GET http://3dbionotes.cnb.csic.es/api/job/status/JOBID
        {"status":0,"info":null,"step":1}
        ...
        {"status":100,"info":null,"step":1}
        ...
        {"status":0,"info":"P10398-P10398-MDL-4ehe.pdb1-B-0-A-0.pdb","step":2}
        ...
        {"status":100,"info":"P10398-P10398-MDL-4ehe.pdb1-B-0-A-0.pdb","step":2}

    GET http://3dbionotes.cnb.csic.es/network?job_id=JOBID&queryId=null
*/

export class BionotesNetworkRepository implements NetworkRepository {
    constructor() {}

    build(network: NetworkDefinition): FutureData<BuildResponse> {
        const url = routes.bionotesDev + "/network/build";

        const params = {
            model: network.species,
            queryId: network.proteins,
            viewer_type: "ngl",
            "has_structure_flag[flag]": network.includeNeighboursWithStructuralData ? "yes" : "no",
            annotations_file: network.annotationsFile,
        };

        return postFormRequest({ url, params }).flatMap(res => {
            const location = res.response.location;
            // network/restore/JOBID
            console.log({ location });
            return Future.success({});
        });
    }
}
