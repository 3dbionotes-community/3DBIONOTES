import { Structure } from "./Covid19Info";

export interface DataGrid {
    count: number;
    columns: Columns;
    structures: Structure[];
}

type Columns = Column[];

interface Column {
    headerName: string;
    field: keyof Structure;
    renderString(structure: Structure): string | undefined;
}
