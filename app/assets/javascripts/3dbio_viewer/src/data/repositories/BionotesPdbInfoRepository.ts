import _ from "lodash";
import { FutureData, Error } from "../../domain/entities/FutureData";
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
        const proteinMappingUrl = `${routes.ebi}/pdbe/api/mappings/uniprot/${pdbId}`;
        const fallbackMappingUrl = `${routes.ebi}/pdbe/api/pdb/entry/polymer_coverage/${pdbId}/`;
        const emdbMapping = `${emdbsFromPdbUrl}/${pdbId}`;
        const data$ = {
            uniprotMapping: getFromUrl<Maybe<UniprotFromPdbMapping>>(
                proteinMappingUrl
            ).flatMapError(_err => Future.success<Maybe<UniprotFromPdbMapping>, Error>(undefined)),
            fallbackMapping: getFromUrl<ChainsFromPolymer>(fallbackMappingUrl).flatMapError(err =>
                buildError<ChainsFromPolymer>("noData", err)
            ),
            emdbMapping: getFromUrl<PdbEmdbMapping>(emdbMapping),
        };

        return Future.joinObj(data$).flatMap(data => {
            const { uniprotMapping, emdbMapping, fallbackMapping } = data;
            const proteinsMapping = uniprotMapping && uniprotMapping[pdbId.toLowerCase()]?.UniProt;
            const fallback = fallbackMapping[pdbId.toLowerCase()];

            if (!proteinsMapping && !fallback) {
                const err = `Uniprot mapping not found for ${pdbId}`;
                return buildError("noData", { message: err });
            }

            const emdbIds = getEmdbsFromMapping(emdbMapping, pdbId);

            if (!proteinsMapping && fallback)
                return Future.success<PdbInfo, Error>(
                    buildPdbInfo({
                        id: pdbId,
                        emdbs: emdbIds.map(emdbId => ({ id: emdbId })),
                        ligands: [],
                        proteins: [],
                        proteinsMapping: undefined,
                        chains: fallback.molecules
                            .flatMap(({ chains }) => chains)
                            .map(chain => ({
                                id: chain.struct_asym_id,
                                shortName: chain.struct_asym_id,
                                name: chain.struct_asym_id,
                                chainId: chain.struct_asym_id,
                                protein: undefined,
                            })),
                    })
                );

            const proteins = _(proteinsMapping).keys().join(",");
            const proteinsInfoUrl = `${routes.bionotes}/api/lengths/UniprotMulti/${proteins}`;
            const proteinsInfo$ = proteins
                ? getFromUrl<ProteinsInfo>(proteinsInfoUrl)
                : Future.success<ProteinsInfo, Error>({});

            const proteinsMappingChains = _.mapValues(proteinsMapping, v =>
                v.mappings.map(({ struct_asym_id, chain_id }) => ({
                    structAsymId: struct_asym_id,
                    chainId: chain_id,
                }))
            );

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
                    emdbs: emdbIds.map(emdbId => ({ id: emdbId })),
                    ligands: [],
                    chains: [],
                    proteins,
                    proteinsMapping: proteinsMappingChains,
                });
            });
        });
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

type UniprotFromPdbMapping = Record<PdbId, Uniprot>;

type PolymerMolecules = {
    chains: { struct_asym_id: string }[];
}[];

type ChainsFromPolymer = Record<PdbId, { molecules: PolymerMolecules }>;

type ProteinsInfo = Record<PdbId, ProteinInfo>;

// [length, name, uniprotCode, organism]
type ProteinInfo = [number, string, string, string];
