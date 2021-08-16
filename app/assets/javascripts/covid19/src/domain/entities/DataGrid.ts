import { Structure } from "./Covid19Info";

export interface DataGrid {
    columns: Columns;
    structures: Structure[];
}

type Columns = Column[];

export type Field = keyof Structure | "validations";

interface Column {
    headerName: string;
    field: Field;
    renderString(structure: Structure): string | undefined;
}
