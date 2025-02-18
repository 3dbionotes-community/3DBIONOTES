import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { PdbId } from "../../domain/entities/Pdb";
import { buildPdbInfo, PdbInfo } from "../../domain/entities/PdbInfo";
import { ChainId, Protein, ProteinId } from "../../domain/entities/Protein";
import { GetPdbInfoArgs, PdbInfoRepository } from "../../domain/repositories/PdbInfoRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { RequestError, getFromUrl } from "../request-utils";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "./mapping";
import { Maybe } from "../../utils/ts-utils";
import { getStorageCache, setStorageCache } from "../storage-cache";
import i18n from "../../domain/utils/i18n";

export class BionotesPdbInfoRepository implements PdbInfoRepository {
    get(args: GetPdbInfoArgs): FutureData<PdbInfo> {
        const { pdbId } = args;

        const data$ = {
            uniprotMapping: this.getBionotesProteinMapping(pdbId),
            fallbackProteinMapping: this.getEbiProteinMapping(pdbId),
            molecules: this.getPolymerCoverage(pdbId),
            emdbMapping: getFromUrl<PdbEmdbMapping>(`${emdbsFromPdbUrl}/${pdbId}`),
        };

        return Future.joinObj(data$).flatMap(data => this.getPdbInfo(data, args));
    }

    private getPdbInfo(data: Data, args: GetPdbInfoArgs): FutureData<PdbInfo> {
        const { pdbId, onProcessDelay } = args;
        const { uniprotMapping, fallbackProteinMapping, emdbMapping, molecules } = data;

        const hasProteinRes = uniprotMapping || fallbackProteinMapping;
        if (!hasProteinRes) console.debug(`Uniprot mapping not found for ${pdbId}`);

        const chains = molecules
            .flatMap(({ chains }) => chains)
            .map(
                (chain): ChainIdMapping => ({
                    structAsymId: chain.struct_asym_id,
                    chainId: chain.chain_id,
                })
            );

        const proteinsMappingChains = this.getProteinChainsMappings({
            uniprotMapping,
            pdbId,
            chains,
            fallbackProteinMapping,
        });

        console.debug("Chains with proteins: ", proteinsMappingChains);

        const proteinNames = this.getProteinNames({
            pdbId,
            uniprotMapping,
            fallbackProteinMapping,
        });

        const proteinsInfo$: FutureData<ProteinsInfo> = this.getProteinsInfo({
            proteinNames,
            pdbId,
            onProcessDelay,
        });

        const emdbs = getEmdbsFromMapping(emdbMapping, pdbId).map(id => ({ id }));

        return this.mapProteinsToPdbInfo({ proteinsInfo$, pdbId, emdbs, proteinsMappingChains });
    }

    private getProteinsInfo(args: {
        proteinNames: string[];
        pdbId: string;
        onProcessDelay: (reason: string) => void;
    }): FutureData<ProteinsInfo> {
        const { proteinNames, pdbId, onProcessDelay } = args;

        const proteinChunks = _.chunk(proteinNames, 4);
        const isFirstFetch = !getStorageCache<{ proteinsInfo: boolean }>(pdbId)?.proteinsInfo;

        if (proteinChunks.length > 1 && isFirstFetch)
            setTimeout(onProcessDelay("Fetching information for multiple UniProt IDs"), 2000);

        const proteinInfoRequests = proteinChunks.map(chunk => {
            const proteinsChunk = chunk.join(",");
            const proteinsInfoUrlChunk = `${routes.bionotes}/api/lengths/UniprotMulti/${proteinsChunk}`;

            return getFromUrl<ProteinsInfo>(proteinsInfoUrlChunk);
        });

        const proteinsInfo$: FutureData<ProteinsInfo> = this.collectProteinsInfo(
            proteinInfoRequests,
            pdbId
        );

        return proteinsInfo$;
    }

    private mapProteinsToPdbInfo(args: {
        proteinsInfo$: FutureData<ProteinsInfo>;
        pdbId: string;
        emdbs: { id: string }[];
        proteinsMappingChains: ChainIdMapping[];
    }): FutureData<PdbInfo> {
        const { proteinsInfo$, pdbId, emdbs, proteinsMappingChains } = args;

        return proteinsInfo$.map(proteinsInfo => {
            const proteins = _(proteinsInfo)
                .toPairs()
                .map(
                    ([proteinId, proteinInfo]): Protein => {
                        const [_length, name, gen, organism] = proteinInfo;
                        return { id: proteinId, name, gen, organism };
                    }
                )
                .value();

            return buildPdbInfo({
                id: pdbId,
                emdbs: emdbs,
                ligands: [],
                proteins,
                chainsMappings: proteinsMappingChains,
            });
        });
    }

    private collectProteinsInfo(
        proteinInfoRequests: FutureData<ProteinsInfo>[],
        pdbId: string
    ): FutureData<ProteinsInfo> {
        return Future.parallel(proteinInfoRequests, {
            maxConcurrency: 2,
        })
            .map(responses => Object.assign({}, ...responses))
            .tap(() => {
                setStorageCache(pdbId, { proteinsInfo: true });
            });
    }

    private getProteinNames(args: {
        uniprotMapping: Maybe<BioUniprotFromPdbMapping>;
        pdbId: string;
        fallbackProteinMapping: Maybe<EbiUniprotFromPdbMapping>;
    }): string[] {
        const { uniprotMapping, pdbId, fallbackProteinMapping } = args;

        const lowerPdbId = pdbId.toLowerCase();
        const uniprotData = uniprotMapping && uniprotMapping[lowerPdbId];
        const fallbackData = fallbackProteinMapping && fallbackProteinMapping[lowerPdbId]?.UniProt;

        const data = uniprotData ?? fallbackData;

        return _(data).keys().sort().value();
    }

    private getProteinChainsMappings(args: {
        uniprotMapping: Maybe<BioUniprotFromPdbMapping>;
        pdbId: string;
        chains: ChainIdMapping[];
        fallbackProteinMapping: Maybe<EbiUniprotFromPdbMapping>;
    }): MappingChain[] {
        const { uniprotMapping, pdbId, chains, fallbackProteinMapping } = args;

        if (uniprotMapping) return this.bionotesProteinMapping(pdbId, uniprotMapping, chains);
        else if (fallbackProteinMapping)
            return this.ebiProteinMapping(pdbId, fallbackProteinMapping, chains);
        else return chains;
    }

    private getPolymerCoverage(pdbId: string): FutureData<PolymerMolecules> {
        const polymerCoverage = `${routes.ebi}/pdbe/api/pdb/entry/polymer_coverage/${pdbId}/`;

        return getFromUrl<ChainsFromPolymer>(polymerCoverage)
            .flatMap(
                (polymerCoverage): FutureData<PolymerMolecules> => {
                    const molecules = polymerCoverage[pdbId.toLowerCase()]?.molecules;

                    if (!molecules)
                        return buildError("noData", {
                            message: "Polymer coverage not found for this PDB.",
                        });
                    else return Future.success(molecules);
                }
            )
            .flatMapError(err => buildError("noData", err));
    }

    private getEbiProteinMapping(pdbId: string): FutureData<Maybe<EbiUniprotFromPdbMapping>> {
        const fallbackProteinMappingUrl = `${routes.ebi}/pdbe/api/mappings/uniprot/${pdbId}`;

        return getFromUrl<Maybe<EbiUniprotFromPdbMapping>>(fallbackProteinMappingUrl).flatMapError(
            (_err): FutureData<Maybe<EbiUniprotFromPdbMapping>> => Future.success(undefined)
        );
    }

    private getBionotesProteinMapping(pdbId: string): FutureData<Maybe<BioUniprotFromPdbMapping>> {
        const proteinMappingUrl = `${routes.bionotes}/api/mappings/PDB/Uniprot/${pdbId}`;

        return getFromUrl<Maybe<BioUniprotFromPdbMapping>>(proteinMappingUrl).flatMapError(
            (_err): FutureData<Maybe<BioUniprotFromPdbMapping>> => Future.success(undefined)
        );
    }

    private bionotesProteinMapping(
        pdbId: string,
        mapping: BioUniprotFromPdbMapping,
        chains: ChainIdMapping[]
    ): MappingChain[] {
        const proteins = mapping && mapping[pdbId.toLowerCase()];
        if (!proteins || Array.isArray(proteins)) return chains;
        else {
            const proteinsMappingChains = _.flatMap(proteins, getBioChainsByProtein(chains));

            return mergeAndSortChains(proteinsMappingChains, chains);
        }
    }

    private ebiProteinMapping(
        pdbId: string,
        mapping: EbiUniprotFromPdbMapping,
        chains: ChainIdMapping[]
    ): MappingChain[] {
        const proteins = mapping && mapping[pdbId.toLowerCase()]?.UniProt;
        const proteinsMappingChains = _.flatMap(proteins, getEbiChainsByProtein);

        return mergeAndSortChains(proteinsMappingChains, chains);
    }
}

function mergeAndSortChains(
    proteinsMappingChains: MappingChain[],
    chains: ChainIdMapping[]
): MappingChain[] {
    return _(proteinsMappingChains)
        .concat(chains)
        .uniqBy(({ structAsymId }) => structAsymId)
        .sortBy(({ structAsymId }) => structAsymId)
        .value();
}

function getBioChainsByProtein(chains: ChainIdMapping[]) {
    return (proteinChains: string[], protein: string): MappingChain[] =>
        proteinChains.map(chainId => {
            const structAsymId = chains.find(c => c.chainId === chainId)?.structAsymId;
            if (!structAsymId) throw new Error("Mismatch between chains and proteins");

            return {
                structAsymId: structAsymId,
                chainId: chainId,
                protein: protein,
            };
        });
}

function getEbiChainsByProtein(uniprotRes: EbiProteinMapping, protein: string): MappingChain[] {
    return uniprotRes.mappings.map(({ struct_asym_id, chain_id }) => ({
        structAsymId: struct_asym_id,
        chainId: chain_id,
        protein: protein,
    }));
}

type ErrorType = "serviceUnavailable" | "noData";

function buildError<T>(type: ErrorType, err: RequestError): FutureData<T> {
    console.error(err.message);
    switch (type) {
        case "serviceUnavailable":
            return Future.error({
                message: i18n.t(
                    "We apologize. Some of the services we rely on are temporarily unavailable. Our team is working to resolve the issue, and we appreciate your patience. Please try again later."
                ),
            });
        case "noData":
            return Future.error({
                message: i18n.t(
                    `No data found for this PDB. But you can try and visualize another PDB. If you believe this is incorrect, please contact us using the "Send Feedback" button below.`
                ),
            });
    }
}

type EbiProteinMapping = {
    mappings: Array<{
        chain_id: ChainId;
        struct_asym_id: ChainId;
    }>;
};

export type UniprotMapping = Record<ProteinId, EbiProteinMapping>;

type Uniprot = {
    UniProt: UniprotMapping;
};

type EbiUniprotFromPdbMapping = Record<PdbId, Uniprot>;

type BioUniprotFromPdbMapping = Record<PdbId, Record<ProteinId, ChainId[]> | never[]>;

type PolymerMolecules = {
    chains: { struct_asym_id: string; chain_id: string }[];
}[];

type ChainsFromPolymer = Record<PdbId, { molecules: PolymerMolecules }>;

type ProteinsInfo = Record<PdbId, ProteinInfo>;

// [length, name, uniprotCode, organism]
type ProteinInfo = [number, string, string, string];

type ChainIdMapping = {
    structAsymId: string;
    chainId: string;
};

export type MappingChain = ChainIdMapping & { protein?: string };

type Data = {
    uniprotMapping: Maybe<BioUniprotFromPdbMapping>;
    fallbackProteinMapping: Maybe<EbiUniprotFromPdbMapping>;
    molecules: PolymerMolecules;
    emdbMapping: PdbEmdbMapping;
};
