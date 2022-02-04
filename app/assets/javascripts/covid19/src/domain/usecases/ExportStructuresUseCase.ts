import moment from "moment";
import { DataGrid } from "../entities/DataGrid";
import { DataGridRepository } from "../repositories/DataGridRepository";

export interface Options {}

export class ExportStructuresUseCase {
    constructor(private dataGridRepository: DataGridRepository) {}

    execute(options: { dataGrid: DataGrid; format: "csv" | "json" }) {
        const { dataGrid, format } = options;
        const datetime = moment().format("YYYY-MM-DD_HH-mm-ss");
        const name = `covid19-structures-${datetime}`;

        switch (format) {
            case "csv":
                return this.dataGridRepository.saveAsCsv({ dataGrid, name });
            case "json":
                return this.dataGridRepository.saveAsJson({ dataGrid, name });
        }
    }
}
