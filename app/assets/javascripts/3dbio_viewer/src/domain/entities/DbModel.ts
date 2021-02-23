export type DbModelType = "pdb" | "emdb";

export interface DbModel {
    type: DbModelType;
    id: string;
    description: string;
    imageUrl: string;
    score: number;
}

export type DbModelCollection = DbModel[];
