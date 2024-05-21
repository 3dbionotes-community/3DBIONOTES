import { FutureData } from "../entities/FutureData";
import { BasicNMRFragmentTarget, NMRFragmentTarget } from "../entities/Protein";

export interface NMRRepository {
    getPartialNMRTarget: (
        target: BasicNMRFragmentTarget,
        pagination: NMRPagination
    ) => FutureData<{ target: NMRFragmentTarget; pagination: NMRPagination }>;
    getNMRTarget: (target: BasicNMRFragmentTarget) => FutureData<NMRFragmentTarget>;
    saveNMRTarget: (target: NMRFragmentTarget) => void;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
