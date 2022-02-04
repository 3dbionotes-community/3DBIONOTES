import { DataGrid } from "../entities/DataGrid";

export interface DataGridRepository {
    saveAsCsv(options: { name: string; dataGrid: DataGrid }): void;
    saveAsJson(options: { name: string; dataGrid: DataGrid }): void;
}
