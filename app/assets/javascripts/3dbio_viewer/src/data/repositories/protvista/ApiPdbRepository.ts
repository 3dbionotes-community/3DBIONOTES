import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { AxiosBuilder, axiosRequest } from "../../../utils/future-axios";
import { getTotalFeaturesLength, Track } from "../../../domain/entities/Track";
import { debugVariable } from "../../../utils/debug";
import { getEmValidationTrack, PdbAnnotations } from "./tracks/em-validation";
import { EbiVariation, getVariants } from "./tracks/variants";
import { addPhosphiteSubtracks, PhosphositeUniprot } from "./tracks/phosphite";
import {
    getDomainFamiliesTrack,
    PfamAnnotations,
    SmartAnnotations,
} from "./tracks/domain-families";
import { Features, getTrackFromFeatures } from "./tracks/feature";
import { Coverage, getStructureCoverageTrack } from "./tracks/structure-coverage";
import { addMobiSubtracks, getMobiDisorderTrack, MobiUniprot } from "./tracks/mobi";
import { Cv19Annotations, getFunctionalMappingTrack } from "./tracks/functional-mapping";
import { getIf } from "../../../utils/misc";
import { getProteomicsTrack, Proteomics } from "./tracks/proteomics";
import { getPdbRedoTrack, PdbRedo } from "./tracks/pdb-redo";
import { getEpitomesTrack, Iedb } from "./tracks/epitomes";

interface Data {
    features: Features;
    covidAnnotations?: Cv19Annotations;
    pdbAnnotations?: PdbAnnotations;
    ebiVariation?: EbiVariation;
    coverage?: Coverage;
    mobiUniprot?: MobiUniprot;
    phosphositeUniprot?: PhosphositeUniprot;
    pfamAnnotations?: PfamAnnotations;
    smartAnnotations?: SmartAnnotations;
    proteomics?: Proteomics;
    pdbRedo?: PdbRedo;
    iedb?: Iedb;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K]> };

type RequestError = { message: string };

interface Options {
    protein: string;
    pdb: string;
    chain: string;
}

export class ApiPdbRepository implements PdbRepository {
    get(options: Options): FutureData<Pdb> {
        // TODO: Get protein from pdb
        return getData(options).map(data => this.getPdb(data, options));
    }

    getPdb(data: Data, options: Options): Pdb {
        debugVariable({ apiData: data });
        const { protein, chain } = options;
        const variants = getIf(data.ebiVariation, getVariants);
        const functionalMappingTracks =
            getIf(data.covidAnnotations, getFunctionalMappingTrack) || [];
        const emValidationTrack = getIf(data.pdbAnnotations, getEmValidationTrack);
        const structureCoverageTrack = getIf(data.coverage, getStructureCoverageTrack);
        const domainFamiliesTrack = getDomainFamiliesTrack(
            data.pfamAnnotations,
            data.smartAnnotations
        );
        const featureTracks = getTrackFromFeatures(data.features, data.phosphositeUniprot);
        const mobiDisorderTrack = getIf(data.mobiUniprot, getMobiDisorderTrack);
        const proteomicsTrack = getIf(data.proteomics, getProteomicsTrack);
        const pdbRedoTrack = getIf(data.pdbRedo, pdbRedo => getPdbRedoTrack(pdbRedo, chain));
        const epitomesTrack = getIf(data.iedb, getEpitomesTrack);

        const tracks1: Track[] = _.compact([
            ...functionalMappingTracks,
            ...featureTracks,
            emValidationTrack,
            domainFamiliesTrack,
            mobiDisorderTrack,
            structureCoverageTrack,
            epitomesTrack,
            proteomicsTrack,
            pdbRedoTrack,
        ]);

        const tracks2 = addMobiSubtracks(tracks1, data.mobiUniprot);
        const tracks3 = addPhosphiteSubtracks(tracks2, protein, data.phosphositeUniprot);
        console.debug("TODO: variants-removed", variants);

        return {
            protein: options.protein,
            sequence: data.features ? data.features.sequence : "",
            length: getTotalFeaturesLength(tracks3),
            tracks: tracks3,
            variants: undefined,
        };
    }
}

function getData(options: Options): FutureData<Data> {
    const { protein, pdb, chain } = options;
    const bionotesUrl = ""; // proxied to 3dbionotes on development (src/setupProxy.js)
    const ebiUrl = "https://www.ebi.ac.uk/proteins/api";

    const data$: DataRequests = {
        features: get(`${ebiUrl}/features/${protein}`),
        covidAnnotations: getOrEmpty(`${bionotesUrl}/cv19_annotations/${protein}_annotations.json`),
        pdbAnnotations: getOrEmpty(
            `${bionotesUrl}/ws/lrs/pdbAnnotFromMap/all/${pdb}/${chain}/?format=json`
        ),
        ebiVariation: getOrEmpty(`${ebiUrl}/variation/${protein}`),
        coverage: getOrEmpty(`${bionotesUrl}/api/alignments/Coverage/${pdb}${chain}`),
        mobiUniprot: getOrEmpty(`${bionotesUrl}/api/annotations/mobi/Uniprot/${protein}`),
        phosphositeUniprot: getOrEmpty(
            `${bionotesUrl}/api/annotations/Phosphosite/Uniprot/${protein}`
        ),
        pfamAnnotations: getOrEmpty(`${bionotesUrl}/api/annotations/Pfam/Uniprot/${protein}`),
        smartAnnotations: getOrEmpty(`${bionotesUrl}/api/annotations/SMART/Uniprot/${protein}`),
        proteomics: getOrEmpty(`${ebiUrl}/api/proteomics/${protein}`),
        pdbRedo: getOrEmpty(`${bionotesUrl}/api/annotations/PDB_REDO/${pdb}`),
        iedb: getOrEmpty(`${bionotesUrl}/api/annotations/IEDB/Uniprot/${protein}`),
    };

    return Future.joinObj(data$);
}

function get<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}

function getOrEmpty<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = get<Data>(url) as Future<RequestError, Data | undefined>;

    return data$.flatMapError(_err => {
        console.debug(`Cannot get data: ${url}`);
        return Future.success(undefined);
    });
}

const builder: AxiosBuilder<RequestError> = {
    mapResponse: res => {
        if (res.status >= 200 && res.status < 300) {
            return ["success", res.data];
        } else {
            return ["error", { message: JSON.stringify(res.data) }];
        }
    },
    mapNetworkError: (_req, message) => ({ status: 0, message }),
};

function request<Data>(request: AxiosRequestConfig): Future<RequestError, Data> {
    return axiosRequest<RequestError, Data>(builder, request);
}
