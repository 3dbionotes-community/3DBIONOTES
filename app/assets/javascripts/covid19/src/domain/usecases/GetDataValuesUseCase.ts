import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(): Promise<DataValue[]> {
        return this.dataValueRepository.get();
    }
}
