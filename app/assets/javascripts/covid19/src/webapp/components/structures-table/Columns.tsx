import React from "react";
import {
    GridColDef,
    GridCellValue,
    GridSortCellParams,
    GridStateApi,
} from "@material-ui/data-grid";
import i18n from "../../../utils/i18n";
import { Covid19Info, Structure } from "../../../domain/entities/Covid19Info";
import { TitleCell } from "./cells/TitleCell";
import { DetailsCell } from "./cells/DetailsCell";
import { PdbCell } from "./cells/PdbCell";
import { EmdbCell } from "./cells/EmdbCell";
import { EntityCell } from "./cells/EntityCell";
import { LigandsCell } from "./cells/LigandsCell";
import { OrganismCell } from "./cells/OrganismCell";
import { ComputationalModelCell } from "./cells/ComputationalModelCell";
import { ValidationsCell } from "./ValidationsCell";

type Row = Structure;
export type Field = keyof Row | "validations";

export interface CellProps {
    data: Covid19Info;
    row: Row;
}

export interface ColumnAttrs<F extends Field>
    extends Omit<GridColDef, "headerName" | "field" | "renderCell"> {
    headerName: string;
    field: F;
    renderCell: React.FC<{ row: Row; data: Covid19Info }>;
    renderString(row: Row): string | undefined;
}

function column<F extends Field>(field: F, options: Omit<ColumnAttrs<F>, "field">): ColumnAttrs<F> {
    return { ...options, field, hide: false, headerAlign: "center" };
}

export type Columns = ColumnAttrs<Field>[];

export const columnsBase: Columns = [
    column("title", {
        headerName: i18n.t("Title"),
        sortable: true,
        width: 220,
        renderCell: TitleCell,
        renderString: row => row.title,
    }),
    column("pdb", {
        headerName: i18n.t("PDB"),
        width: 120,
        renderCell: PdbCell,
        sortComparator: compareIds,
        renderString: row => row.pdb?.id,
    }),
    column("emdb", {
        headerName: i18n.t("EMDB"),
        width: 120,
        renderCell: EmdbCell,
        sortComparator: compareIds,
        renderString: row => row.emdb?.id,
    }),
    column("validations", {
        headerName: i18n.t("Validations"),
        width: 130,
        renderCell: ValidationsCell,
        renderString: row => {
            const pdbValidations = (row.pdb?.validations || []).map(v => v.type);
            const emdbValidations = row.emdb?.validations || [];
            const validations = [...pdbValidations, ...emdbValidations];
            return validations.join(", ");
        },
    }),
    column("entities", {
        headerName: i18n.t("Entities"),
        width: 120,
        sortable: false,
        renderCell: EntityCell,
        renderString: row => row.entities.map(entity => entity.id).join(", "),
    }),
    column("ligands", {
        headerName: i18n.t("Ligands"),
        width: 180,
        sortable: false,
        renderCell: LigandsCell,
        renderString: row =>
            row.ligands.map(ligand => `${ligand.instances} ${ligand.info.id}`).join(", "),
    }),
    column("organisms", {
        headerName: i18n.t("Organisms"),
        width: 150,
        sortable: false,
        renderCell: OrganismCell,
        renderString: row => row.organisms.map(organism => organism.id).join(", "),
    }),
    column("computationalModel", {
        headerName: i18n.t("Comp. Model"),
        width: 180,
        sortable: false,
        sortComparator: compareIds,
        renderCell: ComputationalModelCell,
        renderString: row => {
            const { computationalModel } = row;
            return computationalModel
                ? `${computationalModel?.source}: ${computationalModel?.name}`
                : undefined;
        },
    }),
    column("details", {
        headerName: i18n.t("Details"),
        hide: false,
        width: 200,
        sortable: false,
        renderCell: DetailsCell,
        renderString: row => row.details || "",
    }),
];

export function getColumns(data: Covid19Info): { definition: GridColDef[]; base: Columns } {
    const definition = columnsBase.map(
        (column): GridColDef => {
            return {
                ...column,

                renderCell: params => {
                    const CellComponent = column.renderCell;

                    return (
                        <div style={styles.column}>
                            <CellComponent row={params.row as Row} data={data} />
                        </div>
                    );
                },
            };
        }
    );

    return { definition, base: columnsBase };
}

type Ref = { id?: string };

/* Compare IDs keeping always empty values to the end (it only supports single column sorting) */
function compareIds(
    cell1: GridCellValue | undefined,
    cell2: GridCellValue | undefined,
    cellParams1: GridSortCellParams
): number {
    const id1 = (cell1 as Ref)?.id;
    const id2 = (cell2 as Ref)?.id;

    const isAsc = (cellParams1.api as GridStateApi).state.sorting.sortModel[0]?.sort === "asc";
    const emptyCmpValue = isAsc ? -1 : +1;

    if (id1 && id2) {
        return id1 === id2 ? 0 : id1 > id2 ? +1 : -1;
    } else if (id1 && !id2) {
        return emptyCmpValue;
    } else if (!id1 && id2) {
        return -emptyCmpValue;
    } else {
        return 0;
    }
}

export const styles = {
    link: { textDecoration: "none" },
    column: { lineHeight: 0 }, // Allows multi-line values in cells
    title: { lineHeight: "20px" },
    thumbnailWrapper: { width: "100%", lineHeight: 0, fontSize: 16, textAlign: "center" as const },
    image: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 10,
        height: 110,
    },
};
