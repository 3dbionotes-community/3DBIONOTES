import { NSPTarget } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface EntitiesRepository {
    getNMRTarget: (
        uniprotId: string,
        start: number,
        end: number,
        pagination: NMRPagination
    ) => FutureData<{ target: NSPTarget; pagination: NMRPagination }>;
}

export interface NMRPagination {
    page: number;
    pageSize: number;
    count: number;
}
