import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { PdbId } from "../../domain/entities/Pdb";
import { buildPdbInfo, PdbInfo } from "../../domain/entities/PdbInfo";
import { ChainId, Protein, ProteinId } from "../../domain/entities/Protein";
import { PdbInfoRepository } from "../../domain/repositories/PdbInfoRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { RequestError, getFromUrl } from "../request-utils";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "./mapping";
import { Maybe } from "../../utils/ts-utils";
import i18n from "../../domain/utils/i18n";

export class BionotesPdbInfoRepository implements PdbInfoRepository {
    get(pdbId: PdbId): FutureData<PdbInfo> {
        const proteinMappingUrl = `${routes.bionotes}/api/mappings/PDB/Uniprot/${pdbId}`;
        const fallbackProteinMappingUrl = `${routes.ebi}/pdbe/api/mappings/uniprot/${pdbId}`;
        const polymerCoverage = `${routes.ebi}/pdbe/api/pdb/entry/polymer_coverage/${pdbId}/`;
        const emdbMapping = `${emdbsFromPdbUrl}/${pdbId}`;

        const bionotesProteinMapping$ = getFromUrl<Maybe<BioUniprotFromPdbMapping>>(
            proteinMappingUrl
        ).flatMapError(
            (_err): FutureData<Maybe<BioUniprotFromPdbMapping>> => Future.success(undefined)
        );

        const ebiProteinMapping$ = getFromUrl<Maybe<EbiUniprotFromPdbMapping>>(
            fallbackProteinMappingUrl
        ).flatMapError(
            (_err): FutureData<Maybe<EbiUniprotFromPdbMapping>> => Future.success(undefined)
        );

        const polymerCoverage$ = getFromUrl<ChainsFromPolymer>(polymerCoverage)
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

        const emdbMapping$ = getFromUrl<PdbEmdbMapping>(emdbMapping);

        const data$ = {
            uniprotMapping: bionotesProteinMapping$,
            fallbackProteinMapping: ebiProteinMapping$,
            molecules: polymerCoverage$,
            emdbMapping: emdbMapping$,
        };

        return Future.joinObj(data$).flatMap(data => {
            const { uniprotMapping, fallbackProteinMapping, emdbMapping, molecules } = data;

            const hasProteinRes = uniprotMapping || fallbackProteinMapping;

            if (!hasProteinRes) console.debug(`Uniprot mapping not found for ${pdbId}`);

            const chains = molecules
                .flatMap(({ chains }) => chains)
                .map(chain => ({
                    structAsymId: chain.struct_asym_id,
                    chainId: chain.chain_id,
                }));

            const proteinsMappingChains =
                (hasProteinRes &&
                    ((uniprotMapping &&
                        this.bionotesProteinMapping(pdbId, uniprotMapping, chains)) ||
                        (fallbackProteinMapping &&
                            this.ebiProteinMapping(pdbId, fallbackProteinMapping, chains)))) ||
                chains;

            const emdbs = getEmdbsFromMapping(emdbMapping, pdbId).map(emdbId => ({ id: emdbId }));

            const proteinsObj =
                (uniprotMapping && uniprotMapping[pdbId.toLowerCase()]) ??
                (fallbackProteinMapping && fallbackProteinMapping[pdbId.toLowerCase()]?.UniProt);

            const proteins = proteinsObj && _(proteinsObj).keys().join(",");
            const proteinsInfoUrl = `${routes.bionotes}/api/lengths/UniprotMulti/${proteins ?? ""}`;
            const proteinsInfo$ = proteinsObj
                ? getFromUrl<ProteinsInfo>(proteinsInfoUrl)
                : Future.success<ProteinsInfo, Error>({});

            console.debug("Chains with proteins: ", proteinsMappingChains);

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
        });
    }

    private bionotesProteinMapping(
        pdbId: string,
        mapping: BioUniprotFromPdbMapping,
        chains: ChainIds[]
    ): MappingChain[] {
        const proteins = mapping && mapping[pdbId.toLowerCase()];
        if (!proteins || Array.isArray(proteins)) return chains;
        else {
            const proteinsMappingChains = _.map(proteins, (proteinChains, protein) =>
                proteinChains.map(chainId => {
                    const structAsymId = chains.find(c => c.chainId === chainId)?.structAsymId;
                    if (!structAsymId) throw new Error("Missmatch between chains and proteins");

                    return {
                        structAsymId: structAsymId,
                        chainId: chainId,
                        protein: protein,
                    };
                })
            ).flat();

            return _([...proteinsMappingChains, ...chains])
                .uniqBy("structAsymId")
                .sortBy("structAsymId")
                .value();
        }
    }

    private ebiProteinMapping(
        pdbId: string,
        mapping: EbiUniprotFromPdbMapping,
        chains: ChainIds[]
    ): MappingChain[] {
        const proteins = mapping && mapping[pdbId.toLowerCase()]?.UniProt;

        const proteinsMappingChains = _.map(proteins, (uniprotRes, protein) =>
            uniprotRes.mappings.map(({ struct_asym_id, chain_id }) => ({
                structAsymId: struct_asym_id,
                chainId: chain_id,
                protein: protein,
            }))
        ).flat();

        return _([...proteinsMappingChains, ...chains])
            .uniqBy("structAsymId")
            .sortBy("structAsymId")
            .value();
    }
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

export type UniprotMapping = Record<
    ProteinId,
    { mappings: { chain_id: ChainId; struct_asym_id: ChainId }[] }
>;

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

type ChainIds = {
    structAsymId: string;
    chainId: string;
};

export type MappingChain = ChainIds & { protein?: string };
