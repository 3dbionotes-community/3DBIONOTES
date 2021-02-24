export type DbModelType = "pdb" | "emdb";

export interface DbModel {
    type: DbModelType;
    id: string;
    score: number;
    imageUrl: string;
    url: string | undefined;
    name: string | undefined;
    authors: string | undefined;
    method: string | undefined;
    resolution: string | undefined;
    specimenState: string | undefined;
}

export type DbModelCollection = DbModel[];
