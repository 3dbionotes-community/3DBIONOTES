import { FutureData } from "../entities/FutureData";
import { NMRTarget } from "../entities/Protein";

export interface NMRRepository {
    getPartialNMRTarget: (
        uniprotId: string,
        start: number,
        end: number,
        pagination: NMRPagination
    ) => FutureData<{ target: NMRTarget; pagination: NMRPagination }>;
    getNMRTarget: (uniprotId: string, start: number, end: number) => FutureData<NMRTarget>;
    saveNMRTarget: (target: NMRTarget) => void;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
