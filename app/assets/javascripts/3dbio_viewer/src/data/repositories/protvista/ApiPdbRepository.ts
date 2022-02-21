import _ from "lodash";
import { FutureData } from "../../../domain/entities/FutureData";
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
import { getJSON, getXML, RequestError } from "../../request-utils";
import { DbPtmAnnotations, getDbPtmFragments } from "./tracks/db-ptm";
import { getMolprobityFragments, MolprobityResponse } from "./molprobity";
import { AntigenicResponse, getAntigenicFragments } from "./tracks/antigenic";
import { Variants } from "../../../domain/entities/Variant";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "../mapping";
import { MutagenesisResponse } from "./tracks/mutagenesis";
import { Maybe } from "../../../utils/ts-utils";

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
        };
    }
}

function getData(options: Options): FutureData<Partial<Data>> {
    const { proteinId, pdbId, chainId } = options;
    const { bionotes: bioUrl, ebi: ebiBaseUrl } = routes;
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
    };

    return Future.joinObj(data$);
}
