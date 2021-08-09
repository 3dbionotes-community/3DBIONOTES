import React from "react";
import { GridColDef, GridCellValue } from "@material-ui/data-grid";
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

type Row = Structure;
type Field = keyof Row;

export interface CellProps {
    data: Covid19Info;
    row: Row;
}

export interface ColumnAttrs<F extends Field> extends Omit<GridColDef, "field" | "renderCell"> {
    field: F;
    renderCell: React.FC<{ row: Row; data: Covid19Info }>;
}

function column<F extends Field>(field: F, options: Omit<ColumnAttrs<F>, "field">): ColumnAttrs<F> {
    return { ...options, field, hide: false, headerAlign: "center" };
}

export const columnsBase: ColumnAttrs<Field>[] = [
    column("title", {
        headerName: i18n.t("Title"),
        sortable: true,
        width: 220,
        renderCell: TitleCell,
    }),
    column("pdb", {
        headerName: i18n.t("PDB"),
        width: 120,
        renderCell: PdbCell,
        sortComparator: compareIds,
    }),
    column("emdb", {
        headerName: i18n.t("EMDB"),
        width: 120,
        renderCell: EmdbCell,
        sortComparator: compareIds,
    }),
    column("entities", {
        headerName: i18n.t("Entities"),
        width: 120,
        renderCell: EntityCell,
    }),
    column("ligands", {
        headerName: i18n.t("Ligands"),
        width: 180,
        renderCell: LigandsCell,
    }),
    column("organisms", {
        headerName: i18n.t("Organisms"),
        width: 150,
        renderCell: OrganismCell,
    }),
    column("computationalModel", {
        headerName: i18n.t("Comp. Model"),
        width: 180,
        renderCell: ComputationalModelCell,
        // sortComparator: compareIds,
    }),
    column("details", {
        headerName: i18n.t("Details"),
        hide: false,
        width: 200,
        renderCell: DetailsCell,
    }),
];

// Add a wrapper with line-height: 0 to render multi-line values in cell correctly
export function getColumns(data: Covid19Info): GridColDef[] {
    return columnsBase.map(
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
}

/* Compare pdb/emdb Ids keeping empty values to the end so an ASC ordering shows values */
function compareIds(id1: GridCellValue, id2: GridCellValue): number {
    if (id1 && id2) {
        return id1 === id2 ? 0 : id1 > id2 ? +1 : -1;
    } else if (id1 && !id2) {
        return -1;
    } else if (!id1 && id2) {
        return +1;
    } else {
        return 0;
    }
}

/*
const determineButtonColor = (name: string) => {
    if (name === "turq") {
        return "#009688";
    } else if (name === "cyan") {
        return "#00bcd4";
    }
};
*/

export const styles = {
    link: { textDecoration: "none" },
    column: { lineHeight: 0 },
    title: { lineHeight: "20px" },
    thumbnailWrapper: { width: "100%", lineHeight: 0, fontSize: 16, textAlign: "center" as const },
    badgeExternalLink: {
        backgroundColor: "#607d8b",
        borderColor: "#607d8b",
        marginRight: 5,
    },
    image: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 10,
        height: 110,
    },
};
