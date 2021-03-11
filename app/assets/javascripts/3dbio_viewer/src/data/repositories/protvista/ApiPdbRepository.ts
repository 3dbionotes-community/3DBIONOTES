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

        const variants = getIf(data.ebiVariation, getVariants);
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
        console.debug("TODO: variants-removed", variants);
        const protein = getProtein(data.uniprot) 

        return {
            protein,
            sequence: data.features ? data.features.sequence : "",
            length: getTotalFeaturesLength(tracks3),
            tracks: tracks3,
            variants: undefined,
        };
    }
}

function getData(options: Options): FutureData<Partial<Data>> {
    const { protein, pdb, chain } = options;
    const bionotesUrl = ""; // proxied to 3dbionotes on development (src/setupProxy.js)
    const ebiUrl = "https://www.ebi.ac.uk/proteins/api";
    const pdbAnnotUrl = `${bionotesUrl}/ws/lrs/pdbAnnotFromMap`;

    const data$: DataRequests = {
        uniprot: getFromXml(`https://www.uniprot.org/uniprot/${protein}.xml`),
        features: get(`${ebiUrl}/features/${protein}`),
        covidAnnotations: get(`${bionotesUrl}/cv19_annotations/${protein}_annotations.json`),
        pdbAnnotations: get(`${pdbAnnotUrl}/all/${pdb}/${chain}/?format=json`),
        ebiVariation: get(`${ebiUrl}/variation/${protein}`),
        coverage: get(`${bionotesUrl}/api/alignments/Coverage/${pdb}${chain}`),
        mobiUniprot: get(`${bionotesUrl}/api/annotations/mobi/Uniprot/${protein}`),
        phosphositeUniprot: get(`${bionotesUrl}/api/annotations/Phosphosite/Uniprot/${protein}`),
        pfamAnnotations: get(`${bionotesUrl}/api/annotations/Pfam/Uniprot/${protein}`),
        smartAnnotations: get(`${bionotesUrl}/api/annotations/SMART/Uniprot/${protein}`),
        proteomics: get(`${ebiUrl}/api/proteomics/${protein}`),
        pdbRedo: get(`${bionotesUrl}/api/annotations/PDB_REDO/${pdb}`),
        iedb: get(`${bionotesUrl}/api/annotations/IEDB/Uniprot/${protein}`),
    };

    return Future.joinObj(data$);
}

function getFromUrl<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}

function get<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = getFromUrl<Data>(url) as Future<RequestError, Data | undefined>;

    return data$.flatMapError(_err => {
        console.debug(`Cannot get data: ${url}`);
        return Future.success(undefined);
    });
}

function getFromXml<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = get<string>(url);

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
