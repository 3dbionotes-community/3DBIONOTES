import i18n from "d2-ui-components/locales";
import _ from "lodash";
import { Error, FutureData } from "../../domain/entities/FutureData";
import { ProteinId } from "../../domain/entities/Protein";
import { ProteinNetwork } from "../../domain/entities/ProteinNetwork";
import { Species } from "../../domain/entities/Species";
import {
    BuildNetworkOptions,
    BuildNetworkResult,
    NetworkRepository,
    OnProgress,
} from "../../domain/repositories/NetworkRepository";
import { routes } from "../../routes";
import { postFormRequest } from "../../utils/form-request";
import { Future, wait } from "../../utils/future";
import { Maybe } from "../../utils/ts-utils";
import {
    BioAnnotations,
    getAnnotationsFromJson,
    getChainsFromOptionsArray,
    OptionsArray,
} from "../BionotesAnnotations";
import { getFromUrl, request } from "../request-utils";

/* Build Protein-protein interaction networks. Workflow:

(For more details, check the old endpoint http://rinchen-dos.cnb.csic.es:8882/ws/network)

    POST http://3dbionotes.cnb.csic.es/network/build -> { jobId: string }

    GET http://3dbionotes.cnb.csic.es/api/job/status/JOBID
        {"status":0,"info":null,"step":1}
        ...
        {"status":100,"info":null,"step":1}
        ...
        {"status":0,"info":"P10398-P10398-MDL-4ehe.pdb1-B-0-A-0.pdb","step":2}
        ...
        {"status":100,"info":"P10398-P10398-MDL-4ehe.pdb1-B-0-A-0.pdb","step":2}

    GET http://3dbionotes.cnb.csic.es/network?job_id=JOBID
*/

interface NetworkBuildResponse {
    jobId: string;
    statusUrl: string;
}

interface NetworkStatusResponse {
    status: Percentage | null;
    info: string | null;
    step: number | null;
    outputs: Maybe<unknown>; // only filled when status is 100%
}

type Percentage = number;

type BuildNetworkApiOptions = {
    dataset: Species;
    queryId: string;
    viewer_type: "ngl";
    "has_structure_flag[flag]": "yes" | "no";
    annotations_file: File | undefined;
};

export interface BioNetworkResponse {
    jobId: string;
    defaultAcc: ProteinId;
    externalAnnotations: JSON<BioAnnotations>;
    selectionArray: Record<ProteinId, [name: string, info: JSON<unknown>]>;
    networkGraph: string;
    optionsArray: OptionsArray;
    pdbList: string[];
    alignment: object;
    identifierType: string;
}

type JSON<_T> = string;

export class BionotesNetworkRepository implements NetworkRepository {
    constructor() {}

    build(options: BuildNetworkOptions): FutureData<BuildNetworkResult> {
        const url = routes.bionotesStaging + "/network/build";
        const { network, onProgress = _.noop } = options;

        const params: BuildNetworkApiOptions = {
            dataset: network.species,
            queryId: network.proteins,
            viewer_type: "ngl",
            "has_structure_flag[flag]": network.includeNeighboursWithStructuralData ? "yes" : "no",
            annotations_file: network.annotationsFile,
        };

        return postFormRequest<NetworkBuildResponse>({ url, params }).flatMap(res => {
            const { statusUrl, jobId } = res.data;
            return this.waitForCompletion(statusUrl, onProgress).map(() => {
                return { token: jobId };
            });
        });
    }

    get(options: { jobId: string }): FutureData<ProteinNetwork> {
        const url = routes.bionotesStaging + `/network.json?job_id=${options.jobId}`;

        return request<BioNetworkResponse>({ method: "get", url }).flatMap(({ data }) => {
            return getAnnotationsFromJson(data.externalAnnotations).map(
                (annotations): ProteinNetwork => {
                    const chains = getChainsFromOptionsArray(data.optionsArray);
                    return {
                        networkGraph: data.networkGraph,
                        uploadData: { title: "", chains, annotations },
                        protein: data.defaultAcc,
                    };
                }
            );
        });
    }

    private waitForCompletion(statusUrl: string, onProgress: OnProgress): FutureData<void> {
        return getFromUrl<NetworkStatusResponse>(statusUrl).flatMap(data => {
            if (data.step === null || data.status === null || data.status < 0) {
                return Future.error({ message: i18n.t("Error on network job") });
            } else {
                onProgress({ totalSteps: 2, currentStep: data.step, value: data.status });

                if (data.step === 2 && data.outputs) {
                    return Future.success(undefined);
                } else {
                    return wait<Error>(2e3).flatMap(() => {
                        return this.waitForCompletion(statusUrl, onProgress);
                    });
                }
            }
        });
    }
}
