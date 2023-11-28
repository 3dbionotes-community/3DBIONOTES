import { FutureData } from "../entities/FutureData";
import { NSPTarget } from "../entities/Protein";

export interface NMRRepository {
    getPartialNMRTarget: (
        uniprotId: string,
        start: number,
        end: number,
        pagination: NMRPagination
    ) => FutureData<{ target: NSPTarget; pagination: NMRPagination }>;
    getNMRTarget: (uniprotId: string, start: number, end: number) => FutureData<NSPTarget>;
    saveNMRTarget: (target: NSPTarget) => void;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
