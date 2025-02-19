import React from "react";
import { GridColDef } from "@material-ui/data-grid";
import _ from "lodash";
import i18n from "../../../utils/i18n";
import { Covid19Info, Ligand, NSPTarget, Structure } from "../../../domain/entities/Covid19Info";
import { TitleCell } from "./cells/TitleCell";
import { DetailsCell } from "./cells/DetailsCell";
import { PdbCell } from "./cells/PdbCell";
import { EmdbCell } from "./cells/EmdbCell";
import { EntitiyCellProps, EntityCell } from "./cells/EntityCell";
import { LigandsCell, LigandsCellProps } from "./cells/LigandsCell";
import { OrganismCell } from "./cells/OrganismCell";
import { LigandImageData } from "../../../domain/entities/LigandImageData";
import { OnClickDetails } from "./badge/BadgeDetails";
import { OnClickIDR } from "./badge/BadgeLigands";
import { OnClickNMR } from "./badge/BadgeEntities";
import { NMRPagination } from "../../../domain/repositories/EntitiesRepository";
import { SetNMROptions } from "./StructuresTable";

type Row = Structure;
export type Field = keyof Row;

export interface IDROptions {
    ligand: Ligand;
    pdbId: string;
    idr?: LigandImageData;
    error?: string;
}

export interface NMROptions {
    target?: NSPTarget;
    pagination?: NMRPagination;
    setPagination?: SetNMRPagination;
    error?: string;
    loading?: boolean;
}

export interface SetNMRPagination {
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
}

export interface DetailsDialogOptions {
    row: Structure;
    field: Field;
}

export interface CellProps {
    data: Covid19Info;
    row: Row;
    moreDetails?: boolean;
    onClickDetails?: OnClickDetails;
}

export interface ColumnAttrs<F extends Field>
    extends Omit<GridColDef, "headerName" | "field" | "renderCell"> {
    headerName: string;
    field: F;
    renderCell: React.FC<CellProps> | React.FC<LigandsCellProps> | React.FC<EntitiyCellProps>;
    renderString(row: Row): string | undefined;
}

function column<F extends Field>(field: F, options: Omit<ColumnAttrs<F>, "field">): ColumnAttrs<F> {
    return { ...options, field, hide: false, headerAlign: "center" };
}

export const columnsWidths = {
    title: 220,
    pdb: 150,
    emdb: 120,
    related: 180,
};

export type Columns = ColumnAttrs<Field>[];

export const columnsBase: Columns = [
    column("title", {
        headerName: i18n.t("Title"),
        sortable: true,
        width: columnsWidths.title,
        renderCell: TitleCell,
        renderString: row => row.title,
    }),
    column("pdb", {
        headerName: i18n.t("PDB"),
        width: columnsWidths.pdb,
        sortable: true,
        renderCell: PdbCell,
        renderString: row => row.pdb?.id,
    }),
    column("emdb", {
        headerName: i18n.t("EMDB"),
        width: columnsWidths.emdb,
        sortable: true,
        renderCell: EmdbCell,
        renderString: row => row.emdb?.id,
    }),
    column("entities", {
        headerName: i18n.t("Entities"),
        width: columnsWidths.related,
        sortable: false,
        renderCell: EntityCell,
        renderString: row => row.entities.map(entity => entity.name).join(", "),
    }),
    column("ligands", {
        headerName: i18n.t("Ligands"),
        width: columnsWidths.related,
        sortable: false,
        renderCell: LigandsCell,
        renderString: row => row.ligands.map(ligand => ligand.name).join(", "),
    }),
    column("organisms", {
        headerName: i18n.t("Organisms"),
        width: columnsWidths.related,
        sortable: false,
        renderCell: OrganismCell,
        renderString: row =>
            row.organisms
                .map(
                    organism =>
                        organism.name +
                        (!organism.commonName || organism.commonName === "?"
                            ? ""
                            : ` (${organism.commonName})`)
                )
                .join(", "),
    }),
    column("details", {
        headerName: i18n.t("Details"),
        hide: false,
        flex: 1,
        sortable: false,
        renderCell: DetailsCell,
        renderString: row => {
            const { details } = row;
            if (!details) return "";
            const { sample } = details;
            const array = (values: string[] | undefined) => values || [];
            const values: string[] = _.compact([
                sample?.name,
                ...array(sample?.macromolecules),
                sample?.assembly,
                sample?.exprSystem,
                ...array(sample?.uniProts),
                ...array(sample?.genes),
                ...array(sample?.bioFunction),
                ...array(sample?.bioProcess),
                ...array(sample?.cellComponent),
                ...array(sample?.domains),
                ..._.flatten(
                    details.refdoc?.map(ref => [
                        ref.id,
                        ref.idLink,
                        ref.title,
                        ...array(ref.authors),
                        ref.journal,
                        ref.pubDate,
                        ref.doi,
                    ])
                ),
            ]);
            return values.join(", ");
        },
    }),
];

export function getColumns(
    data: Covid19Info,
    options: {
        onClickDetails: OnClickDetails;
        onClickIDR: OnClickIDR;
        onClickNMR: OnClickNMR;
        setNMROptions: SetNMROptions;
    }
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
                                onClickIDR={options.onClickIDR}
                                onClickNMR={options.onClickNMR}
                                setNMROptions={options.setNMROptions}
                            />
                        </div>
                    );
                },
            };
        }
    );

    return { definition, base: columnsBase };
}

export const styles = {
    link: { textDecoration: "none" },
    column: { lineHeight: 1 }, // Allows multi-line values in cells
    title: { lineHeight: "20px" },
    thumbnailWrapper: {
        width: "100%",
        fontSize: 14,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column" as const,
        alignItems: "center",
    },
    image: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        maxHeight: 110,
        maxWidth: 110,
    },
};
