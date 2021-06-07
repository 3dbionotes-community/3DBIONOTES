import { DataValue } from "../entities/DataValue";

export interface DataValueRepository {
    get(): Promise<DataValue[]>;
}
