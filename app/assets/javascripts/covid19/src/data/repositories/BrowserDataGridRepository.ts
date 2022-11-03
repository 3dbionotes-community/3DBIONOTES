import _ from "lodash";
import FileSaver from "file-saver";
import Papa from "papaparse";
import { lookup } from "mime-types";
import { DataGrid } from "../../domain/entities/DataGrid";
import { DataGridRepository } from "../../domain/repositories/DataGridRepository";

export class BrowserDataGridRepository implements DataGridRepository {
    saveAsCsv(options: { dataGrid: DataGrid; name: string }) {
        const { dataGrid, name } = options;
        const { columns, structures } = dataGrid;
        const headers = columns.map(column => column.headerName);
        const rows = structures.map(structure =>
            columns.map(column => column.renderString(structure) || "")
        );
        const table = [headers, ...rows];
        const contents = Papa.unparse(table);
        this.save({ contents, name, extension: "csv" });
    }

    saveAsJson(options: { dataGrid: DataGrid; name: string }) {
        const { dataGrid, name } = options;
        const { columns, structures } = dataGrid;
        const columnFields = columns.map(column => column.field);
        const structures2 = structures.map(structure => _.pick(structure, columnFields));
        const contents = JSON.stringify(structures2, null, 4);
        this.save({ contents, name, extension: "json" });
    }

    private save(options: { name: string; contents: string; extension: string }) {
        const { name, extension, contents } = options;
        const filename = `${name}.${extension}`;
        const mimeType = lookup(filename);
        const blob = new Blob([contents], { type: mimeType || undefined });
        FileSaver.saveAs(blob, filename);
    }
}
