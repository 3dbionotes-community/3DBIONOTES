import _ from "lodash";
import {
    AtomicStructure,
    AtomicStructureMapping,
    ChainObject,
} from "../../domain/entities/AtomicStructure";
import {
    AtomicStructureRepository,
    BuildOptions,
} from "../../domain/repositories/AtomicStructureRepository";
import { FutureData } from "../../domain/entities/FutureData";
import { routes } from "../../routes";
import { request } from "../request-utils";
import { BionotesAnnotationResponse } from "./BionotesAnnotationResponse";
import { Future } from "../../utils/future";
import { postFormRequest } from "../../utils/form-request";

interface ChainMappingPost {
    rand: string;
    file: "structure_file.cif";
    mapping: string; // JSON string of Mapping
    // app/controllers/main_controller.rb: acc, db, title, organism, gene_symbol = params[ch].split("__")
    // Example: A: "Q64FG1__trembl__S2 protein (Fragment)__SARS coronavirus GD322__S2";
    [chainId: string]: string;
}

export class BionotesAtomicStructureRepository implements AtomicStructureRepository {
    get(options: BuildOptions): FutureData<AtomicStructure> {
        const url = routes.bionotesDev + "/upload";

        const params = {
            structure_file: options.structureFile,
            title: options.jobTitle,
            annotations_file: options.annotationsFile,
        };

        return postFormRequest<BionotesAnnotationResponse>({ url, params }).flatMap(res =>
            getAtomicStructureFromResponse(res.data)
        );
    }

    uploadMapping(structure: AtomicStructureMapping): FutureData<void> {
        const url = routes.bionotesDev + "/chain_mapping";

        const base: ChainMappingPost = {
            rand: structure.token,
            file: "structure_file.cif",
            mapping: JSON.stringify(structure.mapping),
        };

        const chainsInfo = _(structure.chainObjects)
            .map(obj => {
                // A: "Q64FG1__trembl__S2 protein (Fragment)__SARS coronavirus GD322__S2"
                const value = [obj.acc, obj.db, obj.name, obj.org, obj.gene].join("__");
                return [obj.chain, value] as [string, string];
            })
            .fromPairs()
            .value();

        const data: ChainMappingPost = _.merge({}, base, chainsInfo);

        return request({ method: "POST", url, data }).map(() => undefined);
    }
}

function getAtomicStructureFromResponse(
    res: BionotesAnnotationResponse
): FutureData<AtomicStructure> {
    const token = res.dataUrl.match(/upload\/(\w+)/)?.[1];
    if (!token) return Future.error({ message: `Cannot get ID from dataUrl: ${res.dataUrl}` });

    const tracks = _.mapValues(res.tracks, (chains, chainId) =>
        chains.map(
            (chain): ChainObject => ({
                id: [chainId, chain.acc].join("-"),
                acc: chain.acc,
                chain: chainId,
                name: chain.title.name.long,
                org: chain.title.org.long,
                gene: chain.title.gene,
                evalue: chain.evalue,
                cov: chain.cov,
                start: chain.start,
                end: chain.end,
                db: chain.db,
            })
        )
    );

    const structure: AtomicStructure = { token, tracks, mapping: res.mapping };

    return Future.success(structure);
}
