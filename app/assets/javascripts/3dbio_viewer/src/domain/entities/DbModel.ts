export type DbModelType = "pdb" | "emdb";

export interface DbModel {
    type: DbModelType;
    id: string;
    imageUrl: string;
}

export type DbModelCollection = DbModel[];
