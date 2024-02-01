import _ from "lodash";
import { FutureData, Error } from "../../domain/entities/FutureData";
import { PdbId } from "../../domain/entities/Pdb";
import { buildPdbInfo, PdbInfo } from "../../domain/entities/PdbInfo";
import { ChainId, Protein, ProteinId } from "../../domain/entities/Protein";
import { PdbInfoRepository } from "../../domain/repositories/PdbInfoRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getFromUrl } from "../request-utils";
import { emdbsFromPdbUrl, getEmdbsFromMapping, PdbEmdbMapping } from "./mapping";
import i18n from "../../domain/utils/i18n";

export class BionotesPdbInfoRepository implements PdbInfoRepository {
    get(pdbId: PdbId): FutureData<PdbInfo> {
        const proteinMappingUrl = `${routes.bionotes}/api/mappings/PDB/Uniprot/${pdbId}`;
        const fallbackMappingUrl = `${routes.ebi}/pdbe/api/pdb/entry/polymer_coverage/${pdbId}/`;
        const emdbMapping = `${emdbsFromPdbUrl}/${pdbId}`;
        const data$ = {
            uniprotMapping: getFromUrl<UniprotFromPdbMapping>(proteinMappingUrl).flatMapError(() => throwError<UniprotFromPdbMapping>("serviceUnavailable")),
            fallbackMapping: getFromUrl<ChainsFromPolymer>(fallbackMappingUrl).flatMapError(() => throwError<ChainsFromPolymer>("noData")),
            emdbMapping: getFromUrl<PdbEmdbMapping>(emdbMapping),
        };

        return Future.joinObj(data$).flatMap(data => {
            const { uniprotMapping, emdbMapping, fallbackMapping } = data;
            const proteinsMapping = uniprotMapping[pdbId.toLowerCase()];
            const fallback = fallbackMapping[pdbId.toLowerCase()];

            if (!proteinsMapping) {
                console.error(`Uniprot mapping not found for ${pdbId}`);
                return throwError("noData");
            }

            if (!fallback) {
                console.error(`No fallback chains found for ${pdbId}`);
                return throwError("noData");
            }

            const emdbIds = getEmdbsFromMapping(emdbMapping, pdbId);

            if (proteinsMapping instanceof Array) {
                return Future.success<PdbInfo, Error>(buildPdbInfo({
                    id: pdbId,
                    emdbs: emdbIds.map(emdbId => ({ id: emdbId })),
                    ligands: [],
                    proteins: [],
                    proteinsMapping: undefined,
                    chains: fallback.molecules.flatMap(({ chains }) => chains).map(chain => ({
                        id: chain.struct_asym_id,
                        shortName: chain.struct_asym_id,
                        name: chain.struct_asym_id,
                        chainId: chain.struct_asym_id,
                        protein: undefined
                    }))
                }));
            }

            const proteins = _(proteinsMapping).keys().join(",");
            const proteinsInfoUrl = `${routes.bionotes}/api/lengths/UniprotMulti/${proteins}`;
            const proteinsInfo$ = proteins
                ? getFromUrl<ProteinsInfo>(proteinsInfoUrl)
                : Future.success<ProteinsInfo, Error>({});

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
                    proteinsMapping,
                });
            });
        });
    }
}

type ErrorType = "serviceUnavailable" | "noData";

function throwError<T>(type: ErrorType): FutureData<T> {
    switch (type) {
        case "serviceUnavailable": return Future.error({
            message: i18n.t(
                "We apologize. Some of the services we relay on, are temporarily unavailable. Our team is working to resolve the issue, and we appreciate your patience. Please try again later."
            ),
        });
        case "noData": return Future.error({
            message: i18n.t(`No data found for this PDB. But you can try and visualize another PDB. If you believe this is incorrect, please contact us using the "Send Feedback" button below.`),
        })
    }
}

type UniprotFromPdbMapping = Record<PdbId, Record<ProteinId, ChainId[]> | never[]>;

type PolymerMolecules = {
    chains: { struct_asym_id: string }[];
}[]

type ChainsFromPolymer = Record<PdbId, { molecules: PolymerMolecules }>;

type ProteinsInfo = Record<PdbId, ProteinInfo>;

// [length, name, uniprotCode, organism]
type ProteinInfo = [number, string, string, string];
