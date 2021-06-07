import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository } from "../domain/repositories/DataValueRepository";
import { D2Api } from "../types/d2-api";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<DataValue[]> {
        const response = await this.api.dataValues
            .getSet({
                period: ["201905"],
                dataSet: ["eZDhcZi6FLP"],
                orgUnit: ["xO9WbCvFq5k"],
            })
            .getData();

        const dataValues: Array<DataValue> = response.dataValues.map(
            (dv): DataValue => ({ dataElement: { id: dv.dataElement }, value: dv.value })
        );

        return dataValues;
    }
}
