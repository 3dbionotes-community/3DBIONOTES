import { NSPTarget } from "../entities/Covid19Info";
import { FutureData } from "../entities/FutureData";

export interface EntitiesRepository {
    getNMRTarget: (uniprotId: string, start: number, end: number) => FutureData<NSPTarget>;
}
