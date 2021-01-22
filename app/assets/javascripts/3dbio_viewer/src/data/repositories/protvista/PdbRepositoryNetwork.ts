import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { AxiosBuilder, axiosRequest } from "../../../utils/future-axios";
import { getTotalFeaturesLength, Track } from "../../../domain/entities/Track";
import { debugVariable } from "../../../utils/debug";
import {
    EbiVariation,
    Cv19Annotations,
    PdbAnnotations,
    MobiUniprot,
} from "./PdbRepositoryNetwork.types";
import { getEmValidationTrack } from "./em-validation";
import { getVariants } from "./variants";
import { addPhosphiteSubtracks, PhosphositeUniprot } from "./phosphite";
import { getDomainFamiliesTrack, PfamAnnotations } from "./domain-families";
import { Features, getTrackFromFeatures } from "./feature-tracks";
import { Coverage, getStructureCoverageTrack } from "./structure-coverage";
import { addMobiSubtracks } from "./mobi";
import { getFunctionalMappingTrack } from "./functional-mapping";

interface Data {
    features: Features;
    covidAnnotations?: Cv19Annotations;
    pdbAnnotations?: PdbAnnotations;
    ebiVariation?: EbiVariation;
    coverage?: Coverage;
    mobiUniprot?: MobiUniprot;
    phosphositeUniprot?: PhosphositeUniprot;
    pfamAnnotations?: PfamAnnotations;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K]> };

type RequestError = { message: string };

interface Options {
    protein: string;
    pdb: string;
    chain: string;
}

export class PdbRepositoryNetwork implements PdbRepository {
    get(options: Options): FutureData<Pdb> {
        // TODO: Get protein from pdb
        return getData(options).map(data => this.getPdb(data));
    }

    getPdb(data: Data): Pdb {
        debugVariable(data);
        const {
            features,
            covidAnnotations,
            ebiVariation,
            pdbAnnotations,
            coverage,
            mobiUniprot,
            phosphositeUniprot,
            pfamAnnotations,
        } = data;

        const variants = ebiVariation ? getVariants(ebiVariation) : undefined;
        const mapping = covidAnnotations ? covidAnnotations[0] : undefined;
        const functionalMappingTrack = getFunctionalMappingTrack(mapping);
        const emValidationTrack = pdbAnnotations ? getEmValidationTrack(pdbAnnotations) : null;
        const structureCoverageTrack = coverage ? getStructureCoverageTrack(coverage) : null;
        const domainFamiliesTrack = pfamAnnotations
            ? getDomainFamiliesTrack(pfamAnnotations)
            : null;

        const tracks1: Track[] = _.compact([
            functionalMappingTrack,
            ...getTrackFromFeatures(features),
            emValidationTrack,
            domainFamiliesTrack,
            structureCoverageTrack,
        ]);

        const tracks2 = addMobiSubtracks(tracks1, mobiUniprot);
        const tracks3 = addPhosphiteSubtracks(tracks2, phosphositeUniprot);

        return {
            sequence: features ? features.sequence : "TODO",
            length: getTotalFeaturesLength(tracks3),
            tracks: tracks3,
            variants,
        };
    }
}

function getData(options: Options): FutureData<Data> {
    const bionotesUrl = "http://3dbionotes.cnb.csic.es";
    const { protein, pdb, chain } = options;

    const data$: DataRequests = {
        features: get(`https://www.ebi.ac.uk/proteins/api/features/${protein}`),
        covidAnnotations: getOrEmpty(`${bionotesUrl}/cv19_annotations/${protein}_annotations.json`),
        pdbAnnotations: getOrEmpty(
            `${bionotesUrl}/ws/lrs/pdbAnnotFromMap/all/${pdb}/${chain}/?format=json`
        ),
        ebiVariation: getOrEmpty(`https://www.ebi.ac.uk/proteins/api/variation/${protein}`),
        coverage: getOrEmpty(`${bionotesUrl}/api/alignments/Coverage/${pdb}${chain}`),
        mobiUniprot: getOrEmpty(`${bionotesUrl}/api/annotations/mobi/Uniprot/${protein}`),
        phosphositeUniprot: getOrEmpty(
            `${bionotesUrl}/api/annotations/Phosphosite/Uniprot/${protein}`
        ),
        pfamAnnotations: getOrEmpty(`${bionotesUrl}/api/annotations/Pfam/Uniprot/${protein}`),
    };

    const data1$ = Future.join3(data$.features, data$.covidAnnotations, data$.coverage);
    const data2$ = Future.join3(data$.ebiVariation, data$.pdbAnnotations, data$.mobiUniprot);
    const data3$ = Future.join(data$.phosphositeUniprot, data$.pfamAnnotations);

    return Future.join3(data1$, data2$, data3$).map(
        ([
            [features, covidAnnotations, coverage],
            [ebiVariation, pdbAnnotations, mobiUniprot],
            [phosphositeUniprot, pfamAnnotations],
        ]): Data => ({
            features,
            covidAnnotations,
            ebiVariation,
            pdbAnnotations,
            coverage,
            mobiUniprot,
            phosphositeUniprot,
            pfamAnnotations,
        })
    );
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
