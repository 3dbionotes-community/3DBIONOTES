import { Fragment2 } from "../../domain/entities/Fragment2";
import _ from "lodash";
import { FutureData } from "../../domain/entities/FutureData";
import { Subtrack, Track } from "../../domain/entities/Track";
import { UploadData } from "../../domain/entities/UploadData";
import { UploadDataRepository } from "../../domain/repositories/UploadDataRepository";
import { routes } from "../../routes";
import { Future } from "../../utils/future";
import { getJSON, getJSONData as getJSONOrError } from "../request-utils";
import { getName } from "./protvista/utils";
import { subtracks } from "./protvista/definitions";

interface RecoverData {
    title: string;
    optionsArray: Array<[name: string, jsonInfo: string]>;
}

export interface OptionArrayInfo {
    pdb: string;
    chain: string;
    uniprot: string; // protein
    uniprotLength: number;
    uniprotTitle: string;
    organism: string;
    gene_symbol: string;
    path: string;
}

type ExternalAnnotations = ExternalAnnotationTrack[];

interface ExternalAnnotationTrack {
    track_name: string;
    chain?: string;
    data: ExternalAnnotationData[];
}

interface ExternalAnnotationData {
    begin: number;
    end: number;
    type: string;
    color: string;
    description: string;
}

export class UploadDataBionotesRepository implements UploadDataRepository {
    get(token: string): FutureData<UploadData> {
        const basePath = `${routes.bionotesDev}/upload/${token}`;
        const data$ = {
            recoverData: getJSONOrError<RecoverData>(`${basePath}/recover_data.json`),
            annotations: getJSON<ExternalAnnotations>(`${basePath}/external_annotations.json`),
        };

        return Future.joinObj(data$).map(
            ({ recoverData, annotations }): UploadData => {
                return {
                    title: recoverData.title,
                    chains: recoverData.optionsArray.map(([name, obj]) => {
                        const uploadChain = JSON.parse(obj) as OptionArrayInfo;
                        return { name, ...uploadChain };
                    }),
                    tracks: (annotations || []).map(
                        (extTrack): Track => ({
                            id: extTrack.track_name,
                            label: getName(extTrack.track_name),
                            subtracks: _(extTrack.data)
                                .groupBy(o => o.type)
                                .map(
                                    (objs, type): Subtrack => {
                                        return {
                                            type: type,
                                            accession: type,
                                            label: getName(type),
                                            shape: "rectangle",
                                            locations: [
                                                {
                                                    fragments: objs.map(
                                                        (obj): Fragment2 => {
                                                            return {
                                                                subtrack: subtracks.uploadData,
                                                                start: obj.begin,
                                                                end: obj.end,
                                                                description: obj.description,
                                                                color: obj.color,
                                                                chainId: extTrack.chain,
                                                            };
                                                        }
                                                    ),
                                                },
                                            ],
                                        };
                                    }
                                )
                                .value(),
                        })
                    ),
                };
            }
        );
    }
}
