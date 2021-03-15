import _ from "lodash";
import xml2js from "xml2js";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { axiosRequest, defaultBuilder } from "../../../utils/future-axios";
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
import { getProtein, UniprotResponse } from "./uniprot";
import { getExperiment, PdbExperiment } from "./ebi-pdbe-api";
import { routes } from "../../../routes";

interface Data {
    uniprot: UniprotResponse;
    features: Features;
    covidAnnotations: Cv19Annotations;
    pdbAnnotations: PdbAnnotations;
    ebiVariation: EbiVariation;
    coverage: Coverage;
    mobiUniprot: MobiUniprot;
    phosphositeUniprot: PhosphositeUniprot;
    pfamAnnotations: PfamAnnotations;
    smartAnnotations: SmartAnnotations;
    proteomics: Proteomics;
    pdbRedo: PdbRedo;
    iedb: Iedb;
    pdbExperiment: PdbExperiment;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K] | undefined> };

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

    getPdb(data: Partial<Data>, options: Options): Pdb {
        debugVariable({ apiData: data });
        // if (!data.uniprot)

        const _variants = getIf(data.ebiVariation, getVariants);
        const functionalMappingTracks =
            getIf(data.covidAnnotations, getFunctionalMappingTrack) || [];
        const emValidationTrack = getIf(data.pdbAnnotations, getEmValidationTrack);
        const structureCoverageTrack = getIf(data.coverage, getStructureCoverageTrack);
        const domainFamiliesTrack = getDomainFamiliesTrack(
            data.pfamAnnotations,
            data.smartAnnotations
        );
        const featureTracks =
            getIf(data.features, features =>
                getTrackFromFeatures(features, data.phosphositeUniprot)
            ) || [];
        const mobiDisorderTrack = getIf(data.mobiUniprot, getMobiDisorderTrack);
        const proteomicsTrack = getIf(data.proteomics, getProteomicsTrack);
        const pdbRedoTrack = getIf(data.pdbRedo, pdbRedo =>
            getPdbRedoTrack(pdbRedo, options.chain)
        );
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
        const tracks3 = addPhosphiteSubtracks(tracks2, options.protein, data.phosphositeUniprot);
        const protein = getProtein(options.protein, data.uniprot);
        const experiment = getIf(data.pdbExperiment, pdbExperiment =>
            getExperiment(options.pdb, pdbExperiment)
        );

        return {
            id: options.pdb,
            emdb: undefined,
            protein,
            sequence: data.features ? data.features.sequence : "",
            length: getTotalFeaturesLength(tracks3),
            tracks: tracks3,
            variants: undefined,
            experiment,
        };
    }
}

function getData(options: Options): FutureData<Partial<Data>> {
    const { protein, pdb, chain } = options;
    const { bionotes: bioUrl, ebi: ebiBaseUrl } = routes;

    const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;
    const pdbAnnotUrl = `${bioUrl}/ws/lrs/pdbAnnotFromMap`;

    const data$: DataRequests = {
        uniprot: getXML(`https://www.uniprot.org/uniprot/${protein}.xml`),
        features: getJSON(`${ebiProteinsApiUrl}/features/${protein}`),
        covidAnnotations: getJSON(`${bioUrl}/cv19_annotations/${protein}_annotations.json`),
        pdbAnnotations: getJSON(`${pdbAnnotUrl}/all/${pdb}/${chain}/?format=json`),
        ebiVariation: getJSON(`${ebiProteinsApiUrl}/variation/${protein}`),
        coverage: getJSON(`${bioUrl}/api/alignments/Coverage/${pdb}${chain}`),
        mobiUniprot: getJSON(`${bioUrl}/api/annotations/mobi/Uniprot/${protein}`),
        phosphositeUniprot: getJSON(`${bioUrl}/api/annotations/Phosphosite/Uniprot/${protein}`),
        pfamAnnotations: getJSON(`${bioUrl}/api/annotations/Pfam/Uniprot/${protein}`),
        smartAnnotations: getJSON(`${bioUrl}/api/annotations/SMART/Uniprot/${protein}`),
        proteomics: getJSON(`${ebiProteinsApiUrl}/api/proteomics/${protein}`),
        pdbRedo: getJSON(`${bioUrl}/api/annotations/PDB_REDO/${pdb}`),
        iedb: getJSON(`${bioUrl}/api/annotations/IEDB/Uniprot/${protein}`),
        pdbExperiment: getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/experiment/${pdb}`),
    };

    return Future.joinObj(data$);
}

function getFromUrl<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}

function getJSON<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = getFromUrl<Data>(url) as Future<RequestError, Data | undefined>;

    return data$.flatMapError(_err => {
        console.debug(`Cannot get data: ${url}`);
        return Future.success(undefined);
    });
}

function getXML<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = getJSON<string>(url);

    return data$.flatMap(xml => {
        return xml ? xmlToJs<Data>(xml) : Future.success(undefined);
    });
}

function xmlToJs<Data>(xml: string): Future<RequestError, Data> {
    const parser = new xml2js.Parser();

    return Future.fromComputation((resolve, reject) => {
        parser.parseString(xml, (err: any, result: Data) => {
            if (err) {
                reject({ message: err ? err.toString() : "Unknown error" });
            } else {
                resolve(result);
            }
        });
        return () => {};
    });
}

function request<Data>(request: AxiosRequestConfig): Future<RequestError, Data> {
    return axiosRequest<RequestError, Data>(defaultBuilder, request);
}
