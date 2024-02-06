import _ from "lodash";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb, PdbPublication } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { getTotalFeaturesLength } from "../../../domain/entities/Track";
import { debugVariable } from "../../../utils/debug";
import {
    getEmValidationFragments as _getEmValidationFragments,
    PdbAnnotations,
} from "./tracks/em-validation";
import { EbiVariation, GenomicVariantsCNCBResponse, getVariants } from "./tracks/variants";
import {
    getPhosphiteFragments as _getPhosphiteFragments,
    PhosphositeUniprot,
} from "./tracks/phosphite";
import { Features, getFeatureFragments as _getFeatureFragments } from "./tracks/feature";
import { Coverage, getStructureCoverageFragments } from "./tracks/structure-coverage";
import { getMobiUniprotFragments as _getMobiUniprotFragments, MobiUniprot } from "./tracks/mobi";
import {
    Cv19Tracks,
    getFunctionalMappingFragments as _getFunctionalMappingFragments,
} from "./tracks/functional-mapping";
import { getProteomicsFragments as _getProteomicsFragments, Proteomics } from "./tracks/proteomics";
import { getPdbRedoFragments as _getPdbRedoFragments, PdbRedo } from "./tracks/pdb-redo";
import {
    getEpitomesFragments as _getEpitomesFragments,
    IedbAnnotationsResponse,
} from "./tracks/epitomes";
import { getProtein, UniprotResponse } from "./uniprot";
import { getExperiment, PdbExperiment } from "./ebi-pdbe-api";
import { getTracksFromFragments } from "../../../domain/entities/Fragment2";
import {
    getPfamDomainFragments as _getPfamDomainFragments,
    PfamAnnotations,
} from "./tracks/pfam-domain";
import {
    getSmartDomainFragments as _getSmartDomainFragments,
    SmartAnnotations,
} from "./tracks/smart-domain";
import {
    getInterproDomainFragments as _getInterproDomainFragments,
    InterproAnnotations,
} from "./tracks/interpro-domain";
import {
    ElmdbUniprot,
    getElmdbUniprotFragments as _getElmdbUniprotFragments,
} from "./tracks/elmdb";
import { getJSON, getValidatedJSON, getXML, RequestError } from "../../request-utils";
import { DbPtmAnnotations, getDbPtmFragments as _getDbPtmFragments } from "./tracks/db-ptm";
import {
    getMolprobityFragments as _getMolprobityFragments,
    MolprobityResponse,
} from "./molprobity";
import {
    AntigenicResponse,
    getAntigenicFragments as _getAntigenicFragments,
} from "./tracks/antigenic";
import { Variants } from "../../../domain/entities/Variant";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "../mapping";
import { MutagenesisResponse } from "./tracks/mutagenesis";
import { Maybe } from "../../../utils/ts-utils";
import { Organism } from "../../../domain/entities/LigandImageData";
import { Ontology, OntologyTerm } from "../../../domain/entities/Ontology";
import { on, onF } from "../../../utils/misc";
import { routes } from "../../../routes";
import {
    ConsensusResponse,
    consensusResponseC,
    getEmValidations,
    PdbEmdbEmValidations,
    RankResponse,
    rankResponseC,
} from "../../PdbEmdbEmValidations";
import {
    getPdbLigand,
    PdbEntryResponse,
    pdbEntryResponseC,
    PdbLigandsResponse,
} from "../../PdbLigands";
import { getPublicationsCodec, EntryPublications, getPublications } from "../../PdbPublications";

interface Data {
    uniprot: UniprotResponse;
    pdbEmdbsEmValidations: PdbEmdbEmValidations[];
    features: Features;
    cv19Tracks: Cv19Tracks;
    pdbAnnotations: PdbAnnotations;
    pdbPublications: PdbPublication[];
    ebiVariation: EbiVariation;
    coverage: Coverage;
    pdbSummary: PdbSummary;
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

interface IDROptions {
    ontologies: Ontology[];
    ontologyTerms: OntologyTerm[];
    organisms: Organism[];
}

export class ApiPdbRepository implements PdbRepository {
    get(options: Options, idrOptions: IDROptions): FutureData<Pdb> {
        return getData(options).map(data => this.getPdb(data, options, idrOptions));
    }

    getPdb(data: Partial<Data>, options: Options, idrOptions: IDROptions): Pdb {
        const { ontologies, ontologyTerms, organisms } = idrOptions;

        debugVariable({ apiData: data });
        const { proteinId } = options;

        const variants = getVariants(
            data.ebiVariation,
            data.mutagenesis,
            data.genomicVariantsCNCB,
            proteinId
        );

        // prettier-ignore
        const fragmentsList = {
            featureFragments: on(data.features, features => getFeatureFragments(options.proteinId, features)),
            pfamDomainFragments: on(data.pfamAnnotations, pfamAnnotations => getPfamDomainFragments(pfamAnnotations, proteinId)),
            smartDomainFragments: on(data.smartAnnotations, smartAnnotations => getSmartDomainFragments(smartAnnotations, proteinId)),
            interproFragments: on(data.interproAnnotations, interproAnnotations => getInterproDomainFragments(interproAnnotations, proteinId)),
            elmdbFragments: on(data.elmdbUniprot, elmdbUniprot => getElmdbUniprotFragments(elmdbUniprot, proteinId)),
            functionalMappingFragments: on(data.cv19Tracks, getFunctionalMappingFragments),
            structureCoverageFragments: on(data.coverage, coverage => getStructureCoverageFragments(coverage, options.chainId)),
            emValidationFragments: on(data.pdbAnnotations, pdbAnnotations => getEmValidationFragments(pdbAnnotations, options.chainId)),
            mobiFragments: on(data.mobiUniprot, mobiUniprot => getMobiUniprotFragments(mobiUniprot, proteinId)),
            proteomicsFragments: on(data.proteomics, proteomics => getProteomicsFragments(proteomics, proteinId)),
            pdbRedoFragments: on(data.pdbRedo, pdbRedo => getPdbRedoFragments(pdbRedo, options.chainId)),
            epitomesFragments: on(data.iedb, getEpitomesFragments),
            phosphiteFragments: on(data.phosphositeUniprot, phosphositeUniprot => getPhosphiteFragments(phosphositeUniprot, proteinId)),
            dbPtmFragments: on(data.dbPtm, dbPtm => getDbPtmFragments(dbPtm, proteinId)),
            molprobityFragments: on(data.molprobity, molprobity => getMolprobityFragments(molprobity, options.chainId)),
            antigenFragments: on(data.antigenic, antigenic => getAntigenicFragments(antigenic, proteinId)),
        };

        const protein = getProtein(proteinId, data.uniprot);
        const experiment = on(data.pdbExperiment, pdbExperiment =>
            options.pdbId ? getExperiment(options.pdbId, pdbExperiment) : undefined
        );

        const sequence = data.features ? data.features.sequence : "";

        const pdbVariants: Variants = {
            sequence,
            variants: (variants?.variants || []).filter(v => v.variant),
            filters: variants?.filters || [],
        };
        const tracks = getTracksFromFragments(
            _(fragmentsList).values().compact().flatten().value()
        );
        const emdbs = on(data.pdbEmdbsEmValidations, pdbEmdbsEmValidations =>
            pdbEmdbsEmValidations.map(({ id, emv }) => ({ id, emv: getEmValidations(emv) }))
        );

        debugVariable({ tracks, variants });

        const ligands = on(data.ligands, ligands =>
            ligands.map(ligand => getPdbLigand({ ligand, ontologyTerms, ontologies, organisms }))
        );

        const pdbTitle =
            options.pdbId && data.pdbSummary && _.first(data.pdbSummary[options.pdbId])?.title;

        return {
            id: options.pdbId,
            title: pdbTitle,
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
            ligands,
            publications: data.pdbPublications ?? [],
        };
    }
}

function getData(options: Options): FutureData<Partial<Data>> {
    const { proteinId, pdbId, chainId } = options;
    const { bionotes: bioUrl, bionotesStaging: bioUrlDev, ebi: ebiBaseUrl } = routes;
    const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;
    const pdbAnnotUrl = `${bioUrl}/ws/lrs/pdbAnnotFromMap`;

    const pdbEmdbsEmValidations = onF(pdbId, pdbId =>
        getJSON<PdbEmdbMapping>(`${emdbsFromPdbUrl}/${pdbId}`).flatMap(pdbEmdbMapping => {
            const emdbs = pdbEmdbMapping ? getEmdbsFromMapping(pdbEmdbMapping, pdbId) : [];
            const pdbEmdbsEmValidations = emdbs?.map(id => ({
                id,
                emv: Future.joinObj({
                    localResolution: getValidatedJSON<ConsensusResponse>(
                        `${bioUrlDev}/bws/api/emv/${id}/localresolution/consensus/`,
                        consensusResponseC
                    ).flatMap(consensus =>
                        getValidatedJSON<RankResponse>(
                            `${bioUrlDev}/bws/api/emv/${id}/localresolution/rank/`,
                            rankResponseC
                        ).map(rank => ({ consensus, rank }))
                    ),
                    // deepres, monores, blocres, mapq, fscq, daq:
                    // getValidatedJSON<StatsResponse>(`${bws}/api/emv/${id}/stats`, statsResponseC),
                }),
            }));

            return Future.parallel(
                pdbEmdbsEmValidations.map(emdb => emdb.emv.map(emv => ({ id: emdb.id, emv })))
            );
        })
    );

    const pdbPublications = onF(pdbId, pdbId =>
        getValidatedJSON<EntryPublications>(
            `${ebiBaseUrl}/pdbe/api/pdb/entry/publications/${pdbId}`,
            getPublicationsCodec(pdbId)
        ).map(entryPublications => getPublications(entryPublications?.[pdbId] ?? []))
    );

    const ligands = onF(pdbId, pdbId =>
        getValidatedJSON<PdbEntryResponse>(
            `${bioUrlDev}/bws/api/pdbentry/${pdbId}/ligands/`,
            pdbEntryResponseC
        ).map(pdbEntryResponse => pdbEntryResponse?.results)
    );

    // Move URLS to each track module?
    //prettier-ignore
    const data$: DataRequests = {
        uniprot: getXML(`${routes.uniprot}/uniprotkb/${proteinId}.xml`),
        pdbEmdbsEmValidations,
        features: getJSON(`${ebiProteinsApiUrl}/features/${proteinId}`),
        cv19Tracks: getJSON(`${bioUrl}/cv19_annotations/${proteinId}_annotations.json`),
        pdbAnnotations: onF(pdbId, pdbId => getJSON(`${pdbAnnotUrl}/all/${pdbId}/${chainId}/?format=json`)),
        pdbPublications,
        coverage: onF(pdbId, pdbId => getJSON(`${bioUrl}/api/alignments/Coverage/${pdbId}${chainId}`)),
        pdbSummary: onF(pdbId, pdbId => getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/summary/${pdbId}`)),
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
        pdbExperiment: onF(pdbId, pdbId => getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/experiment/${pdbId}`)),
        elmdbUniprot: getJSON(`${bioUrl}/api/annotations/elmdb/Uniprot/${proteinId}`),
        molprobity: onF(pdbId, pdbId => getJSON(`${bioUrl}/compute/molprobity/${pdbId}`)),
        antigenic: getJSON(`${ebiProteinsApiUrl}/antigen/${proteinId}`),
        mutagenesis: getJSON(`${bioUrl}/api/annotations/biomuta/Uniprot/${proteinId}`),
        genomicVariantsCNCB: getJSON(`${bioUrl}/ws/lrs/features/variants/Genomic_Variants_CNCB/${proteinId}/`),
        ligands,
    };

    return Future.joinObj(data$);
}

interface PdbSummary {
    [key: string]: {
        title: string;
    }[];
}
