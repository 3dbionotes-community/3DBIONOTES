import { BasicNSPTarget, NSPTarget } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface EntitiesRepository {
    getPartialNMRTarget: (
        target: BasicNSPTarget,
        pagination: NMRPagination
    ) => FutureData<{ target: NSPTarget; pagination: NMRPagination }>;
    getNMRTarget: (target: BasicNSPTarget) => FutureData<NSPTarget>;
    saveNMRTarget: (target: NSPTarget) => void;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
