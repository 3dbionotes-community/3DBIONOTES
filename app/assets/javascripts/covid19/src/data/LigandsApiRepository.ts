import _ from "lodash";
import { LigandImageData } from "../domain/entities/LigandImageData";
import { LigandsRepository } from "../domain/repositories/LigandsRepository";
import { routes } from "../routes";
import { Future, FutureData } from "./utils/future";
import { getJSON } from "./utils/request-utils";

export class LigandsApiRepository implements LigandsRepository {
    ligandsData: any[] = [];

    constructor() {
        getJSON<any[]>(`${routes.bionotesApi}/ligands/`).run(
            data => {
                this.ligandsData = data ?? [];
            },
            err => {
                throw err.message;
            }
        );
    }

    getImageDataResource(id: string): FutureData<LigandImageData | undefined> {
        const l = this.ligandsData.find(ligand => ligand.dbId === id);
        if (l)
            return getJSON(`${routes.bionotesApi}/ligandToImageData/${l.id}`).map((data: any) => {
                const { imageData } = data;
                if (!imageData) return undefined;
                if (imageData.length > 1) {
                    console.log("There is more than one IDR");
                    return undefined;
                }
                const idr: any = _.first(imageData);
                return {
                    ...idr,
                    assays: idr.assays.map((assay: any) => ({
                        ...assay,
                        id: assay.dbId,
                        type: assay.assayType,
                        typeTermAccession: assay.assayTypeTermAccession,
                        screens: assay.screens.map((screen: any) => ({
                            ...screen,
                            id: screen.dbId,
                            doi: screen.dataDoi,
                        })),
                        compound: {},
                    })),
                } as LigandImageData;
            });
        else return Future.success(undefined);
    }
}
