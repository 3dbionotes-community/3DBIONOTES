import _ from "lodash";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb, PdbPublication } from "../../../domain/entities/Pdb";
import { PdbOptions, PdbRepository } from "../../../domain/repositories/PdbRepository";
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
import { getProteomicsFragments, Proteomics } from "./tracks/proteomics";
import { getPdbRedoFragments, PdbRedo } from "./tracks/pdb-redo";
import { getEpitomesFragments, IedbAnnotationsResponse } from "./tracks/epitomes";
import { getProtein, UniprotResponse } from "./uniprot";
import { getExperiment, getFallbackOrganism, PdbExperiment, PdbMolecules } from "./ebi-pdbe-api";
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
import { getResults, Pagination, paginationCodec } from "../../codec-utils";
import { getPublicationsCodec, EntryPublications, getPublications } from "../../PdbPublications";
import { getNMRSubtrack } from "./tracks/nmr";
import { NMRTarget, nmrTargetCodec } from "../../NMRTarget";

interface Data {
    uniprot: UniprotResponse;
    pdbEmdbsEmValidations: PdbEmdbEmValidations[];
    nmrTargets: NMRTarget[];
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
    pdbMolecules: PdbMolecules;
    elmdbUniprot: ElmdbUniprot;
    molprobity: MolprobityResponse;
    antigenic: AntigenicResponse;
    mutagenesis: MutagenesisResponse;
    genomicVariantsCNCB: GenomicVariantsCNCBResponse;
    ligands: PdbLigandsResponse;
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K] | undefined> };

interface IDROptions {
    ontologies: Ontology[];
    ontologyTerms: OntologyTerm[];
    organisms: Organism[];
}

export class ApiPdbRepository implements PdbRepository {
    get(options: PdbOptions, idrOptions: IDROptions): FutureData<Pdb> {
        return getData(options).map(data => this.getPdb(data, options, idrOptions));
    }

    getPdb(data: Partial<Data>, options: PdbOptions, idrOptions: IDROptions): Pdb {
        const { ontologies, ontologyTerms, organisms } = idrOptions;

        debugVariable({ apiData: data });
        const { proteinId, pdbId, chainId } = options;

        const variants = proteinId
            ? getVariants(data.ebiVariation, data.mutagenesis, data.genomicVariantsCNCB, proteinId)
            : undefined;

        const proteinFragments = proteinId
            ? {
                  featureFragments: on(data.features, features =>
                      getFeatureFragments(proteinId, features)
                  ),
                  pfamDomainFragments: on(data.pfamAnnotations, pfamAnnotations =>
                      getPfamDomainFragments(pfamAnnotations, proteinId)
                  ),
                  smartDomainFragments: on(data.smartAnnotations, smartAnnotations =>
                      getSmartDomainFragments(smartAnnotations, proteinId)
                  ),
                  interproFragments: on(data.interproAnnotations, interproAnnotations =>
                      getInterproDomainFragments(interproAnnotations, proteinId)
                  ),
                  elmdbFragments: on(data.elmdbUniprot, elmdbUniprot =>
                      getElmdbUniprotFragments(elmdbUniprot, proteinId)
                  ),
                  mobiFragments: on(data.mobiUniprot, mobiUniprot =>
                      getMobiUniprotFragments(mobiUniprot, proteinId)
                  ),
                  proteomicsFragments: on(data.proteomics, proteomics =>
                      getProteomicsFragments(proteomics, proteinId)
                  ),
                  phosphiteFragments: on(data.phosphositeUniprot, phosphositeUniprot =>
                      getPhosphiteFragments(phosphositeUniprot, proteinId)
                  ),
                  dbPtmFragments: on(data.dbPtm, dbPtm => getDbPtmFragments(dbPtm, proteinId)),
                  antigenFragments: on(data.antigenic, antigenic =>
                      getAntigenicFragments(antigenic, proteinId)
                  ),
              }
            : undefined;

        const fragments = {
            functionalMappingFragments: on(data.cv19Tracks, getFunctionalMappingFragments),
            structureCoverageFragments: on(data.coverage, coverage =>
                getStructureCoverageFragments(coverage, chainId)
            ),
            emValidationFragments: on(data.pdbAnnotations, pdbAnnotations =>
                getEmValidationFragments(pdbAnnotations, chainId)
            ),
            pdbRedoFragments: on(data.pdbRedo, pdbRedo => getPdbRedoFragments(pdbRedo, chainId)),
            epitomesFragments: on(data.iedb, getEpitomesFragments),
            molprobityFragments: on(data.molprobity, molprobity =>
                getMolprobityFragments(molprobity, chainId)
            ),
            nmrFragments: on(data.nmrTargets, nmr => getNMRSubtrack(nmr)),
        };

        const fragmentsList = { ...proteinFragments, ...fragments };

        const protein = proteinId ? getProtein(proteinId, data.uniprot) : undefined;
        const experiment = on(data.pdbExperiment, pdbExperiment =>
            getExperiment(pdbId, pdbExperiment)
        );

        const fallbackOrganism = on(data.pdbMolecules, pdbMolecules =>
            getFallbackOrganism(pdbId, pdbMolecules)
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

        const pdbTitle = data.pdbSummary && _.first(data.pdbSummary[pdbId])?.title;

        return {
            id: pdbId,
            title: pdbTitle,
            emdbs: emdbs || [],
            protein,
            sequence,
            organism: protein?.organism ?? fallbackOrganism,
            chainId: chainId,
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

function getData(options: PdbOptions): FutureData<Partial<Data>> {
    const { proteinId, pdbId, chainId } = options;
    const { bionotes: bioUrl, ebi: ebiBaseUrl } = routes;
    const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;
    const pdbAnnotUrl = `${bioUrl}/ws/lrs/pdbAnnotFromMap`;

    const pdbEmdbsEmValidations = getJSON<PdbEmdbMapping>(`${emdbsFromPdbUrl}/${pdbId}`).flatMap(
        pdbEmdbMapping => {
            const emdbs = pdbEmdbMapping ? getEmdbsFromMapping(pdbEmdbMapping, pdbId) : [];
            const pdbEmdbsEmValidations = emdbs?.map(id => ({
                id,
                emv: Future.joinObj({
                    localResolution: getValidatedJSON<ConsensusResponse>(
                        `${bioUrl}/bws/api/emv/${id}/localresolution/consensus/`,
                        consensusResponseC
                    ).flatMap(consensus =>
                        getValidatedJSON<RankResponse>(
                            `${bioUrl}/bws/api/emv/${id}/localresolution/rank/`,
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
        }
    );

    const pdbPublications = getValidatedJSON<EntryPublications>(
        `${ebiBaseUrl}/pdbe/api/pdb/entry/publications/${pdbId}`,
        getPublicationsCodec(pdbId)
    ).map(entryPublications => getPublications(entryPublications?.[pdbId] ?? []));

    const ligands = getValidatedJSON<PdbEntryResponse>(
        `${bioUrl}/bws/api/pdbentry/${pdbId}/ligands/`,
        pdbEntryResponseC
    ).map(pdbEntryResponse => pdbEntryResponse?.results);

    const nmrTargets = onF(proteinId, proteinId =>
        getValidatedJSON<Pagination<NMRTarget>>(
            `${bioUrl}/bws/api/nmr/targets/${proteinId}/`,
            paginationCodec(nmrTargetCodec)
        ).map(pagination => getResults(pagination))
    );

    // Move URLS to each track module?
    //prettier-ignore
    const data$: DataRequests = {
        uniprot: onF(proteinId, proteinId => getXML(`${routes.uniprot}/uniprotkb/${proteinId}.xml`)),
        nmrTargets,
        pdbEmdbsEmValidations,
        features: onF(proteinId, proteinId => getJSON(`${ebiProteinsApiUrl}/features/${proteinId}`)),
        cv19Tracks: onF(proteinId, proteinId => getJSON(`${bioUrl}/cv19_annotations/${proteinId}_annotations.json`)),
        pdbAnnotations: getJSON(`${pdbAnnotUrl}/all/${pdbId}/${chainId}/?format=json`),
        pdbPublications,
        coverage: getJSON(`${bioUrl}/api/alignments/Coverage/${pdbId}${chainId}`),
        pdbSummary: getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/summary/${pdbId}`),
        ebiVariation: onF(proteinId, proteinId => getJSON(`${ebiProteinsApiUrl}/variation/${proteinId}`)),
        mobiUniprot: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/mobi/Uniprot/${proteinId}`)),
        phosphositeUniprot: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/Phosphosite/Uniprot/${proteinId}`)),
        dbPtm: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/dbptm/Uniprot/${proteinId}`)),
        pfamAnnotations: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/Pfam/Uniprot/${proteinId}`)),
        smartAnnotations: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/SMART/Uniprot/${proteinId}`)),
        interproAnnotations: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/interpro/Uniprot/${proteinId}`)),
        proteomics: onF(proteinId, proteinId => getJSON(`${ebiProteinsApiUrl}/proteomics/${proteinId}`)),
        pdbRedo: getJSON(`${bioUrl}/api/annotations/PDB_REDO/${pdbId}`),
        iedb: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/IEDB/Uniprot/${proteinId}`)),
        pdbExperiment: getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/experiment/${pdbId}`),
        pdbMolecules: getJSON(`${ebiBaseUrl}/pdbe/api/pdb/entry/molecules/${pdbId}`),
        elmdbUniprot: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/elmdb/Uniprot/${proteinId}`)),
        molprobity: getJSON(`${bioUrl}/compute/molprobity/${pdbId}`),
        antigenic: onF(proteinId, proteinId => getJSON(`${ebiProteinsApiUrl}/antigen/${proteinId}`)),
        mutagenesis: onF(proteinId, proteinId => getJSON(`${bioUrl}/api/annotations/biomuta/Uniprot/${proteinId}`)),
        genomicVariantsCNCB: onF(proteinId, proteinId => getJSON(`${bioUrl}/ws/lrs/features/variants/Genomic_Variants_CNCB/${proteinId}/`)),
        ligands,
    };

    return Future.joinObj(data$);
}

interface PdbSummary {
    [key: string]: {
        title: string;
    }[];
}
