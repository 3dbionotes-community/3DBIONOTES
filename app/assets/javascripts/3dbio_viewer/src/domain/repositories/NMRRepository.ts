import { FutureData } from "../entities/FutureData";
import { BasicNMRTarget, NMRTarget } from "../entities/Protein";

export interface NMRRepository {
    getPartialNMRTarget: (
        target: BasicNMRTarget,
        pagination: NMRPagination
    ) => FutureData<{ target: NMRTarget; pagination: NMRPagination }>;
    getNMRTarget: (target: BasicNMRTarget) => FutureData<NMRTarget>;
    saveNMRTarget: (target: NMRTarget) => void;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
