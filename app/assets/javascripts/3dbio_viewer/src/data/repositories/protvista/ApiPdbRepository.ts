import _ from "lodash";
import { Error, FutureData } from "../../../domain/entities/FutureData";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { getTotalFeaturesLength } from "../../../domain/entities/Track";
import { debugVariable } from "../../../utils/debug";
import { getEmValidationFragments, PdbAnnotations } from "./tracks/em-validation";
import { EbiVariation, GenomicVariantsCNCBResponse, getVariants } from "./tracks/variants";
import { getPhosphiteFragments, PhosphositeUniprot } from "./tracks/phosphite";
import { Features, getFeatureFragments } from "./tracks/feature";
import { Coverage, getStructureCoverageFragments } from "./tracks/structure-coverage";
import { getMobiUniprotFragments, MobiUniprot } from "./tracks/mobi";
import { Cv19Tracks, getFunctionalMappingFragments } from "./tracks/functional-mapping";
import { on, onF } from "../../../utils/misc";
import { getProteomicsFragments, Proteomics } from "./tracks/proteomics";
import { getPdbRedoFragments, PdbRedo } from "./tracks/pdb-redo";
import { getEpitomesFragments, IedbAnnotationsResponse } from "./tracks/epitomes";
import { getProtein, UniprotResponse } from "./uniprot";
import { getExperiment, PdbExperiment } from "./ebi-pdbe-api";
import { routes } from "../../../routes";
import { getTracksFromFragments } from "../../../domain/entities/Fragment2";
import { getPfamDomainFragments, PfamAnnotations } from "./tracks/pfam-domain";
import { getSmartDomainFragments, SmartAnnotations } from "./tracks/smart-domain";
import { getInterproDomainFragments, InterproAnnotations } from "./tracks/interpro-domain";
import { ElmdbUniprot, getElmdbUniprotFragments } from "./tracks/elmdb";
import { getJSON, getValidatedJSON, getXML, RequestError } from "../../request-utils";
import { DbPtmAnnotations, getDbPtmFragments } from "./tracks/db-ptm";
import { getMolprobityFragments, MolprobityResponse } from "./molprobity";
import { AntigenicResponse, getAntigenicFragments } from "./tracks/antigenic";
import { Variants } from "../../../domain/entities/Variant";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "../mapping";
import { MutagenesisResponse } from "./tracks/mutagenesis";
import { Maybe } from "../../../utils/ts-utils";
import {
    getPdbLigand,
    IDRWell,
    ImageDataResource,
    LigandToImageDataResponse,
    ligandToImageDataResponseC,
    PdbEntryResponse,
    pdbEntryResponseC,
    PdbLigandsResponse,
} from "../../PdbLigands";
import {
    LigandImageData,
    Organism,
    Plate,
    Screen,
    Well,
} from "../../../domain/entities/LigandImageData";
import i18n from "../../../webapp/utils/i18n";

interface Data {
    uniprot: UniprotResponse;
    pdbEmdbMapping: PdbEmdbMapping;
    features: Features;
    cv19Tracks: Cv19Tracks;
    pdbAnnotations: PdbAnnotations;
    ebiVariation: EbiVariation;
    coverage: Coverage;
    mobiUniprot: MobiUniprot;
    phosphositeUniprot: PhosphositeUniprot;
    dbPtm: DbPtmAnnotations;
    pfamAnnotations: PfamAnnotations;
    smartAnnotations: SmartAnnotations;
    interproAnnotations: InterproAnnotations;
    proteomics: Proteomics;
    pdbRedo: PdbRedo;
    iedb: IedbAnnotationsResponse;
    pdbExperiment: PdbExperiment;
    elmdbUniprot: ElmdbUniprot;
    molprobity: MolprobityResponse;
    antigenic: AntigenicResponse;
    mutagenesis: MutagenesisResponse;
    genomicVariantsCNCB: GenomicVariantsCNCBResponse;
    ligands: PdbLigandsResponse;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K] | undefined> };

interface Options {
    proteinId: string;
    pdbId: Maybe<string>;
    chainId: string;
}

export class ApiPdbRepository implements PdbRepository {
    get(options: Options): FutureData<Pdb> {
        return getData(options).map(data => this.getPdb(data, options));
    }

    getPdb(data: Partial<Data>, options: Options): Pdb {
        debugVariable({ apiData: data });
        const { proteinId } = options;

        const featureFragments = on(data.features, features =>
            getFeatureFragments(options.proteinId, features)
        );
        const pfamDomainFragments = on(data.pfamAnnotations, pfamAnnotations =>
            getPfamDomainFragments(pfamAnnotations, proteinId)
        );
        const smartDomainFragments = on(data.smartAnnotations, smartAnnotations =>
            getSmartDomainFragments(smartAnnotations, proteinId)
        );
        const interproFragments = on(data.interproAnnotations, interproAnnotations =>
            getInterproDomainFragments(interproAnnotations, proteinId)
        );

        const elmdbFragments = on(data.elmdbUniprot, elmdbUniprot =>
            getElmdbUniprotFragments(elmdbUniprot, proteinId)
        );

        const variants = getVariants(
            data.ebiVariation,
            data.mutagenesis,
            data.genomicVariantsCNCB,
            proteinId
        );

        const functionalMappingFragments = on(data.cv19Tracks, getFunctionalMappingFragments);
        const structureCoverageFragments = on(data.coverage, coverage =>
            getStructureCoverageFragments(coverage, options.chainId)
        );

        const emValidationFragments = on(data.pdbAnnotations, pdbAnnotations =>
            getEmValidationFragments(pdbAnnotations, options.chainId)
        );
        const mobiFragments = on(data.mobiUniprot, mobiUniprot =>
            getMobiUniprotFragments(mobiUniprot, proteinId)
        );
        const proteomicsFragments = on(data.proteomics, proteomics =>
            getProteomicsFragments(proteomics, proteinId)
        );
        const pdbRedoFragments = on(data.pdbRedo, pdbRedo =>
            getPdbRedoFragments(pdbRedo, options.chainId)
        );
        const epitomesFragments = on(data.iedb, getEpitomesFragments);

        const protein = getProtein(proteinId, data.uniprot);
        const experiment = on(data.pdbExperiment, pdbExperiment =>
            options.pdbId ? getExperiment(options.pdbId, pdbExperiment) : undefined
        );

        const phosphiteFragments = on(data.phosphositeUniprot, phosphositeUniprot =>
            getPhosphiteFragments(phosphositeUniprot, proteinId)
        );
        const dbPtmFragments = on(data.dbPtm, dbPtm => getDbPtmFragments(dbPtm, proteinId));

        const molprobityFragments = on(data.molprobity, molprobity =>
            getMolprobityFragments(molprobity, options.chainId)
        );

        const antigenFragments = on(data.antigenic, antigenic =>
            getAntigenicFragments(antigenic, proteinId)
        );

        const fragmentsList = [
            featureFragments,
            pfamDomainFragments,
            smartDomainFragments,
            interproFragments,
            functionalMappingFragments,
            structureCoverageFragments,
            mobiFragments,
            elmdbFragments,
            phosphiteFragments,
            dbPtmFragments,
            pdbRedoFragments,
            emValidationFragments,
            molprobityFragments,
            proteomicsFragments,
            epitomesFragments,
            antigenFragments,
        ];

        const sequence = data.features ? data.features.sequence : "";

        const pdbVariants: Variants = {
            sequence,
            variants: (variants?.variants || []).filter(v => v.variant),
            filters: variants?.filters || [],
        };
        const tracks = getTracksFromFragments(_(fragmentsList).compact().flatten().value());
        const emdbs = on(data.pdbEmdbMapping, mapping =>
            options.pdbId ? getEmdbsFromMapping(mapping, options.pdbId).map(id => ({ id })) : []
        );
        debugVariable({ tracks, variants });

        const ligands = on(data.ligands, ligands => ligands.map(ligand => getPdbLigand(ligand)));

        return {
            id: options.pdbId,
            emdbs: emdbs || [],
            protein,
            sequence,
            chainId: options.chainId,
            length: getTotalFeaturesLength(tracks),
            tracks,
            variants: pdbVariants,
            experiment,
            proteinNetwork: undefined,
            file: undefined,
            path: undefined,
            customAnnotations: undefined,
            ligands: ligands,
        };
    }

    getIDR(inChIKey: string): FutureData<Maybe<LigandImageData>> {
        const { publicBionotesDev: bws } = routes;
        const ligandToImageData$ = getValidatedJSON<LigandToImageDataResponse>(
            `${bws}/api/ligandToImageData/${inChIKey}`,
            ligandToImageDataResponseC
        )
            .flatMapError<Error>(() =>
                Future.error(err("Error: the api response type was not the expected."))
            )
            .flatMap(
                (ligandToImageData): FutureData<Maybe<LigandImageData>> => {
                    if (!ligandToImageData) return Future.success(undefined);
                    // return Future.error(err("Error: the api response is undefined."));
                    else if ("detail" in ligandToImageData) return Future.success(undefined);
                    // return Future.error(err('Error: "detail": Not found.'));

                    const data = ligandToImageData;
                    const { imageData } = data;

                    if (!imageData) return Future.success(undefined);
                    // return Future.error(err("Error: imageData is undefined."));
                    else if (imageData.length > 1)
                        return Future.error(err("Error: there is more than one IDR."));
                    //it shouldn't be an array...
                    else if (_.isEmpty(imageData))
                        return Future.error(err("Error: imageData is empty."));

                    const idr = _.first(imageData) as ImageDataResource;

                    return Future.success<LigandImageData, Error>({
                        ...idr,
                        externalLink: data.externalLink,
                        assays: idr.assays.map(assay => {
                            const {
                                screens,
                                additionalAnalyses,
                                dbId,
                                assayType,
                                assayTypeTermAccession,
                            } = assay;

                            //Compound: inhibition cytopathicity
                            const wellsFromPlates = screens
                                .find(({ dbId }) => dbId === "2602")
                                ?.plates.map(({ wells }) => wells);
                            const allPercentageInhibition = wellsFromPlates
                                ?.map(plate =>
                                    plate.flatMap(({ percentageInhibition }) =>
                                        percentageInhibition ? [`${percentageInhibition}%`] : []
                                    )
                                )
                                .join(", "); //it should be only one...¿?, but just in case...

                            //Compounds: cytotoxicity, dose response, cytotoxic index
                            const cytotoxicity = additionalAnalyses.find(
                                ({ name }) => name === "CC50"
                            );
                            const doseResponse = additionalAnalyses.find(
                                ({ name }) => name === "IC50"
                            );
                            const cytotoxicIndex = additionalAnalyses.find(
                                ({ name }) => name === "Selectivity index"
                            );

                            return {
                                ...assay,
                                id: dbId,
                                type: assayType,
                                typeTermAccession: assayTypeTermAccession,
                                bioStudiesAccessionId: assay.BIAId,
                                organisms: assay.organisms.map(
                                    (organism): Organism => ({
                                        id: organism.ncbi_taxonomy_id,
                                        name: organism.scientific_name,
                                        commonName: organism.common_name,
                                        externalLink: organism.externalLink,
                                    })
                                ),
                                screens: screens.map(
                                    (screen): Screen => ({
                                        ...screen,
                                        id: screen.dbId,
                                        doi: screen.dataDoi,
                                        well: _.first(_.first(screen.plates)?.wells)?.externalLink,
                                        plates: screen.plates.map(
                                            (plate): Plate => ({
                                                id: plate.dbId,
                                                name: plate.name,
                                                wells: plate.wells.flatMap(flatMapWell),
                                                controlWells: plate.wells.flatMap(flatMapWell),
                                            })
                                        ),
                                    })
                                ),
                                compound: {
                                    percentageInhibition: allPercentageInhibition,
                                    cytotoxicity: cytotoxicity
                                        ? `${cytotoxicity.value} ${cytotoxicity.units ?? ""}`
                                        : undefined,
                                    cytotoxicityIndex: cytotoxicIndex
                                        ? `${cytotoxicIndex.value} ${cytotoxicIndex.units ?? ""}`
                                        : undefined,
                                    doseResponse: doseResponse
                                        ? `${doseResponse.value} ${doseResponse.units ?? ""}`
                                        : undefined,
                                },
                            };
                        }),
                    });
                }
            );
        return ligandToImageData$;
    }
}

function getData(options: Options): FutureData<Partial<Data>> {
    const { proteinId, pdbId, chainId } = options;
    const { bionotes: bioUrl, ebi: ebiBaseUrl, publicBionotesDev: bws } = routes;
    const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;
    const pdbAnnotUrl = `${bioUrl}/ws/lrs/pdbAnnotFromMap`;

    // Move URLS to each track module?
    const data$: DataRequests = {
        uniprot: getXML(`${routes.uniprot}/uniprot/${proteinId}.xml`),
        pdbEmdbMapping: onF(pdbId, pdbId => getJSON(`${emdbsFromPdbUrl}/${pdbId}`)),
        features: getJSON(`${ebiProteinsApiUrl}/features/${proteinId}`),
        cv19Tracks: getJSON(`${bioUrl}/cv19_annotations/${proteinId}_annotations.json`),
        pdbAnnotations: onF(pdbId, pdbId =>
            getJSON(`${pdbAnnotUrl}/all/${pdbId}/${chainId}/?format=json`)
        ),
        coverage: onF(pdbId, pdbId =>
            getJSON(`${bioUrl}/api/alignments/Coverage/${pdbId}${chainId}`)
        ),
        ebiVariation: getJSON(`${ebiProteinsApiUrl}/variation/${proteinId}`),
        mobiUniprot: getJSON(`${bioUrl}/api/annotations/mobi/Uniprot/${proteinId}`),
        phosphositeUniprot: getJSON(`${bioUrl}/api/annotations/Phosphosite/Uniprot/${proteinId}`),
        dbPtm: getJSON(`${bioUrl}/api/annotations/dbptm/Uniprot/${proteinId}`),
        pfamAnnotations: getJSON(`${bioUrl}/api/annotations/Pfam/Uniprot/${proteinId}`),
        smartAnnotations: getJSON(`${bioUrl}/api/annotations/SMART/Uniprot/${proteinId}`),
        interproAnnotations: getJSON(`${bioUrl}/api/annotations/interpro/Uniprot/${proteinId}`),
        proteomics: getJSON(`${ebiProteinsApiUrl}/proteomics/${proteinId}`),
        pdbRedo: onF(pdbId, pdbId => getJSON(`${bioUrl}/api/annotations/PDB_REDO/${pdbId}`)),
        iedb: getJSON(`${bioUrl}/api/annotations/IEDB/Uniprot/${proteinId}`),
        pdbExperiment: onF(pdbId, pdbId =>
            getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/experiment/${pdbId}`)
        ),
        elmdbUniprot: getJSON(`${bioUrl}/api/annotations/elmdb/Uniprot/${proteinId}`),
        molprobity: onF(pdbId, pdbId => getJSON(`${bioUrl}/compute/molprobity/${pdbId}`)),
        antigenic: getJSON(`${ebiProteinsApiUrl}/antigen/${proteinId}`),
        mutagenesis: getJSON(`${bioUrl}/api/annotations/biomuta/Uniprot/${proteinId}`),
        genomicVariantsCNCB: getJSON(
            `${bioUrl}/ws/lrs/features/variants/Genomic_Variants_CNCB/${proteinId}/`
        ),
        ligands: onF(pdbId, pdbId =>
            getValidatedJSON<PdbEntryResponse>(
                `${bws}/api/pdbentry/${pdbId}/ligands/`,
                pdbEntryResponseC
            ).map(pdbEntryResponse => pdbEntryResponse?.results)
        ),
    };

    return Future.joinObj(data$);
}

function flatMapWell(well: IDRWell): Well[] {
    const [_void, a, b] = well.name.toLowerCase().split(/^(.)/, 1);
    const codePoint = a && a.codePointAt(0);
    const x = codePoint ? _.clamp(codePoint - 97, 0, 7) : undefined;
    const y = b ? _.toNumber(b) : undefined;
    if (x && y)
        return [
            {
                id: well.dbId,
                position: { x, y },
                image: well.imageThumbailLink,
            },
        ];
    else return [];
}

function err(message: string) {
    return { message: i18n.t(message, { nsSeparator: false }) };
}
