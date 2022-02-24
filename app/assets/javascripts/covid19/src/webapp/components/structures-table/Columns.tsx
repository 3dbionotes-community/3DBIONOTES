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

type Row = Structure;
export type Field = keyof Row;

export interface CellProps {
    data: Covid19Info;
    row: Row;
    moreDetails?: boolean;
    onClickDetails?: (options: { row: Structure; field: Field }) => void;
}

export interface ColumnAttrs<F extends Field>
    extends Omit<GridColDef, "headerName" | "field" | "renderCell"> {
    headerName: string;
    field: F;
    renderCell: React.FC<CellProps>;
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
        width: 140,
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
    column("entities", {
        headerName: i18n.t("Entities"),
        width: 180,
        sortable: false,
        renderCell: EntityCell,
        renderString: row => row.entities.map(entity => entity.name).join(", "),
    }),
    column("ligands", {
        headerName: i18n.t("Ligands"),
        width: 180,
        sortable: false,
        renderCell: LigandsCell,
        renderString: row => row.ligands.map(ligand => ligand.name).join(", "),
    }),
    column("organisms", {
        headerName: i18n.t("Organisms"),
        width: 180,
        sortable: false,
        renderCell: OrganismCell,
        renderString: row => row.organisms.map(organism => organism.name).join(", "),
    }),
    column("details", {
        headerName: i18n.t("Details"),
        hide: false,
        width: 200,
        sortable: false,
        renderCell: DetailsCell,
        renderString: row => {
            const { details } = row;
            let string = "";
            if (details == null) return "";
            string += details?.sample?.name ?? "";
            string += details?.sample?.macromolecules?.join(", ") ?? "";
            string += details?.sample?.assembly ?? "";
            string += details?.sample?.exprSystem ?? "";
            string += details?.sample?.uniProts?.join(", ") ?? "";
            string += details?.sample?.genes?.join(", ") ?? "";
            string += details?.sample?.bioFunction?.join(", ") ?? "";
            string += details?.sample?.bioProcess?.join(", ") ?? "";
            string += details?.sample?.cellComponent?.join(", ") ?? "";
            string += details?.sample?.domains?.join(", ") ?? "";
            string +=
                details?.refdoc
                    ?.map(
                        ref =>
                            ref.id +
                            ", " +
                            ref.title +
                            ", " +
                            ref.authors +
                            ", " +
                            ref.journal +
                            ", " +
                            ref.abstract +
                            ", " +
                            ref.pubDate +
                            ", " +
                            ref.doi
                    )
                    .join(", ") ?? "";
            return string;
        },
    }),
];

export function getColumns(
    data: Covid19Info,
    options: { onClickDetails: (options: { row: Structure; field: Field }) => void }
): { definition: GridColDef[]; base: Columns } {
    const definition = columnsBase.map(
        (column): GridColDef => {
            return {
                ...column,

                renderCell: params => {
                    const CellComponent = column.renderCell;

                    return (
                        <div style={styles.column}>
                            <CellComponent
                                row={params.row as Row}
                                data={data}
                                onClickDetails={options.onClickDetails}
                            />
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
    column: { lineHeight: 1 }, // Allows multi-line values in cells
    title: { lineHeight: "20px" },
    thumbnailWrapper: { width: "100%", fontSize: 14, textAlign: "center" as const },
    image: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 10,
        maxHeight: 110,
        maxWidth: 110,
    },
};
