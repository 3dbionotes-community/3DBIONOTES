import React, { useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    DataGridProps,
    GridMenu,
    GridColDef,
} from "@material-ui/data-grid";
import FileSaver from "file-saver";
import moment from "moment";

import axios, { AxiosResponse } from "axios";
import {
    Covid19Data,
    RowUpload,
    ItemDetails,
    PdbApiResponse,
    EmdbApiResponse,
} from "../../../domain/entities/Covid19Data";
import styled from "styled-components";
import { columnSettings } from "../app/ColumnSettings";
import _ from "lodash";
import { Button, MenuList, MenuItem } from "@material-ui/core";
import Papa from "papaparse";

interface ProteinProps {
    protein: Covid19Data["proteins"][number];
}

export const Badge = styled.span`
    padding: 6px 12px;
    font-size: 10.5px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    margin: 2px 0px;
    white-space: normal;
    color: #fff;
    color: #fff;
    background-color: #007bff;
    display: inline-block;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
`;

const ProteinHeader = styled.div`
    margin: 20px 0px 20px;
    background-color: #fff;
    padding: 0px;
    box-shadow: 0 0px 10px rgba(0, 0, 0, 0.025), 0 0px 23px rgba(0, 0, 0, 0.04);
    border-left: 20px solid #607d8b;
`;

const ProteinName = styled.p`
    margin: 5px 0 8px;
    color: #484848;
    font-weight: bold;
`;
const ExportIcon = () => (
    <svg className="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
    </svg>
);

export const Protein: React.FC<ProteinProps> = props => {
    const { protein } = props;
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(25); // 50 20
    const [details, setDetails] = React.useState<Record<number, ItemDetails>>({});
    const [columns, setColumns] = React.useState<GridColDef[]>(columnSettings);

    const setFirstPage = React.useCallback(() => setPage(0), [setPage]);

    const items = React.useMemo(() => {
        return protein.sections.flatMap(section => {
            if (section.subsections.length !== 0) {
                const itemsToPush = section.items;
                const subsectionItems = section.subsections.flatMap(subsection =>
                    subsection.items.map(item =>
                        section.name === "Related"
                            ? { relatedType: subsection.name, ...item }
                            : section.name === "Computational Models"
                            ? { computationalModel: subsection.name, ...item }
                            : item
                    )
                );

                return itemsToPush.concat(subsectionItems);
            } else {
                return section.items;
            }
        });
    }, [protein.sections]);

    const getDetailsData = useCallback(async (items: RowUpload[]) => {
        const promises = items.map(item => {
            const { api: url, id } = item;
            return url !== undefined && id !== undefined
                ? axios
                      .get(url)
                      .then((resp: AxiosResponse<any>) => ({
                          id,
                          value: Object.values(resp.data).flatMap(data => data)[0] as
                              | PdbApiResponse
                              | EmdbApiResponse,
                      }))
                      .catch(_err => null)
                : null;
        });
        const res0 = _.compact(await Promise.all(_.compact(promises)));
        const newRows = res0.map(({ id, value }) => {
            const det = {
                description:
                    (value as PdbApiResponse)?.title ||
                    (value as EmdbApiResponse)?.deposition?.title,
                authors:
                    (value as PdbApiResponse)?.entry_authors?.join(" , ") ||
                    (value as EmdbApiResponse)?.deposition?.authors,
                released:
                    (value as PdbApiResponse)?.release_date ||
                    (value as EmdbApiResponse)?.deposition?.deposition_date,
            };
            return [id, det] as [number, ItemDetails];
        });
        setDetails(_.fromPairs(newRows));
    }, []);

    const rows = React.useMemo(() => {
        const rows = items.map((item, index): RowUpload | null => {
            item.links.map(link => {
                if (link.title === "PDB-Redo") {
                    item["pdb_redo"] = link;
                }
                if (link.title === "Isolde") {
                    item["isolde"] = link;
                }
                if (link.title === "Refmac") {
                    item["refmac"] = link;
                }
                return item;
            });
            const type =
                item.type ||
                (item.external.text === "SWISS-MODEL"
                    ? "swiss-model"
                    : item.external.text === "AlphaFold"
                    ? "AlphaFold"
                    : item.external.text === "BSM-Arc"
                    ? "BSM-Arc"
                    : null);
            if (!type || !["pdb", "emdb", "swiss-model", "AlphaFold", "BSM-Arc"].includes(type))
                return null;

            return {
                id: index,
                ...item,
                type,
                title: "",
                ...(["swiss-model", "AlphaFold", "BSM-Arc"].includes(type)
                    ? { title: item.description || "" }
                    : {}),
                pdb: item.type === "pdb" ? item.name : undefined,
                emdb: item.type === "emdb" ? item.name : undefined,
                computationalModel: ["swiss-model", "AlphaFold", "BSM-Arc"].includes(type)
                    ? item.name
                    : undefined,
                details: undefined,
            };
        });

        return _.compact(rows);
    }, [items]);

    const [renderedRows, setRenderedRows] = React.useState<RowUpload[]>([]);
    const setRenderedRowsFromState = React.useCallback<NonNullable<DataGridProps["onStateChange"]>>(
        gridParams => {
            const { api } = gridParams;
            const { page, pageSize } = gridParams.state.pagination;
            const sortedIds = api.getSortedRowIds() as number[];
            const visibleIds = Array.from(api.getVisibleRowModels().keys()) as number[];
            const ids = _(sortedIds)
                .intersection(visibleIds)
                .drop(page * pageSize)
                .take(pageSize)
                .value();
            //console.debug("loadDetails", { page }, "->", { ids });

            setRenderedRows(prevRenderedRows => {
                const prevIds = prevRenderedRows.map(x => x.id);
                const newRenderedRows = () =>
                    _(gridParams.state.rows.idRowsLookup).at(ids).compact().value();
                return _.isEqual(prevIds, ids) ? prevRenderedRows : newRenderedRows();
            });
        },
        []
    );
    useEffect(() => {
        getDetailsData(renderedRows);
    }, [getDetailsData, renderedRows]);

    const classes = useStyles();

    const rowsWithDetails = React.useMemo(
        () =>
            rows.map(row => {
                const det = details && row.id !== undefined ? details[row.id] : null;
                return det ? { ...row, title: det.description, details: det } : row;
            }),
        [rows, details]
    );

    const getRenderedRowsWithVisibleColumns =  React.useCallback(() => {
        const visibleColumns = columns.filter(column => column.hide === false).map(x => x.field);
        const columnsDataToRemove = _.difference(columns.map(x => x.field), visibleColumns);
        const rowsWithVisibleColumns = renderedRows.map(row => {
            let newRow = row;
            //these are not shown in the first place
            newRow = _.omit(newRow, ["links", "related", "pockets"]);
           
        if (
            !columnsDataToRemove.includes("pdb") &&
            !columnsDataToRemove.includes("emdb") &&
            !columnsDataToRemove.includes("computationalModel")
        )
            newRow = _.omit(newRow, [
                "pdb",
                "emdb",
                "computationalModel",
                "image_url",
                "external",
                "query_url",
            ]);
            columnsDataToRemove.forEach(column => {
                const key = column as keyof RowUpload;
                newRow = _.omit(newRow, [key]);
            });
        if (visibleColumns.includes("title")) {
            newRow.title = rowsWithDetails[row.id as number].title;
        }
        if (visibleColumns.includes("details")) {
            newRow.details = rowsWithDetails[row.id as number].details;
        }
            return newRow;
        });
        return rowsWithVisibleColumns;
    },[columns, rowsWithDetails, renderedRows]);

    const getRenderedRowsWithVisibleColumnsCsv = React.useCallback(() => {
        const visibleColumns = columns.filter(column => column.hide === false).map(x => x.field);
        const rowsWithVisibleColumns = renderedRows.map((row: RowUpload) => {
            const rowId = row.id as number;
            const newArr = visibleColumns.map(column => {
                const key = column as keyof RowUpload;
                return ["pdb", "emdb", "computationalModel"].includes(key) && row[key] !== undefined
                    ? `
            name: ${row[key]}, query_url: ${row.query_url}, external-text: ${row?.external?.text}, external-url: ${row?.external?.url}`
                    : ["pdb_redo", "isolde", "refmac"].includes(key) && row[key] !== undefined
                    ? JSON.stringify(row[key])
                    : column === "title"
                    ? rowsWithDetails[rowId].title
                    : column === "details"
                    ? JSON.stringify(rowsWithDetails[rowId].details)
                    : row[key] || "";
            });
            return newArr;
        });
        return rowsWithVisibleColumns;
    }, [columns, rowsWithDetails, renderedRows]);
    const exportToCsv = () => {
        const visibleColumns = columns.filter(column => column.hide === false).map(x => x.field);
        const userRows = getRenderedRowsWithVisibleColumnsCsv();
        const table = [visibleColumns, ...userRows];
        const parsedTable = Papa.unparse(table);
        const blob = new Blob([parsedTable], { type: "text/plain;charset=utf-8" });
        const datetime = moment().format("YYYY-MM-DD_HH-mm-ss");
        const filename = `${protein.name}-${datetime}.csv`;
        FileSaver.saveAs(blob, filename);
    };
    const DownloadJsonLink = () => {
        const rowsWithVisibleColumns = getRenderedRowsWithVisibleColumns();
        return (
            <a
                style={{ textDecoration: "none", color: "black" }}
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(rowsWithVisibleColumns)
                )}`}
                download={`${protein.name}-export.json`}
            >
                Export as JSON
            </a>
        );
    };

    const CustomGridToolbarExport = () => {
        const [anchorEl, setAnchorEl] = React.useState(null);
        const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);
        const handleMenuClose = () => setAnchorEl(null);
        return (
            <React.Fragment>
                <Button
                    color="primary"
                    size="small"
                    onClick={handleMenuOpen}
                    aria-expanded={anchorEl ? "true" : undefined}
                    aria-label="toolbarExportLabel"
                    aria-haspopup="menu"
                    startIcon={<ExportIcon />}
                >
                    toolbarExport
                </Button>
                <GridMenu
                    open={Boolean(anchorEl)}
                    target={anchorEl}
                    onClickAway={handleMenuClose}
                    position="bottom-start"
                >
                    <MenuList
                        className="MuiDataGrid-gridMenuList"
                        autoFocusItem={Boolean(anchorEl)}
                    >
                        <MenuItem onClick={exportToCsv}>Export to CSV</MenuItem>
                        <MenuItem>
                            <DownloadJsonLink />
                        </MenuItem>
                    </MenuList>
                </GridMenu>
            </React.Fragment>
        );
    };
    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <CustomGridToolbarExport />
        </GridToolbarContainer>
    );

    const updateVisibilityColumns = React.useCallback<
        NonNullable<DataGridProps["onColumnVisibilityChange"]>
    >(
        params =>
            setColumns(prevColumns => {
                const copyOfprevColumns = prevColumns;
                const columnNames = copyOfprevColumns.map(x => x.field);
                const indexOfColumnToChange = columnNames.indexOf(params.field);
                const changedColumn = {
                    ...copyOfprevColumns[indexOfColumnToChange],
                    hide: !params.isVisible,
                };
                copyOfprevColumns[indexOfColumnToChange] = changedColumn;
                return copyOfprevColumns;
            }),
        []
    );

    return (
        <ProteinHeader>
            <div style={{ padding: 16 }}>
                <Badge
                    style={{
                        fontSize: 14,
                        backgroundColor: "#00bcd4",
                        borderColor: "#00bcd4",
                    }}
                >
                    <strong>{protein.name}</strong>
                </Badge>

                {protein.polyproteins.map((polyprotein, index) => (
                    <Badge
                        key={index}
                        style={{
                            fontSize: 14,
                            backgroundColor: "#607d8b",
                            borderColor: "#607d8b",
                            marginLeft: 5,
                        }}
                    >
                        {polyprotein}
                    </Badge>
                ))}
                <ProteinName>{protein.names.join(" | ")}</ProteinName>

                <p>
                    <i>{protein.description}</i>
                </p>
                {!_.isEmpty(rows) && (
                    <div style={{ display: "flex" }}>
                        <div style={{ flexGrow: 1 }}>
                            <DataGrid
                                page={page}
                                onStateChange={setRenderedRowsFromState}
                                className={classes.root}
                                rowHeight={195}
                                onSortModelChange={setFirstPage}
                                sortingOrder={["asc", "desc"]}
                                rows={rowsWithDetails}
                                autoHeight
                                columns={columnSettings}
                                components={{
                                    Toolbar: CustomToolbar,
                                }}
                                disableColumnMenu={true}
                                pageSize={pageSize}
                                onPageChange={params => {
                                    setPage(params.page);
                                }}
                                onPageSizeChange={params => {
                                    setPageSize(params.pageSize);
                                }}
                                onColumnVisibilityChange={updateVisibilityColumns}
                                pagination
                                rowsPerPageOptions={[25, 50, 75, 100]}
                            />
                        </div>
                    </div>
                )}
            </div>
        </ProteinHeader>
    );
};

const useStyles = makeStyles({
    root: {
        "&.MuiDataGrid-root .MuiDataGrid-cell": {
            whiteSpace: "normal",
            display: "flex", // "block" for non-vertically-centered text
        },
        "&.MuiDataGrid-root .MuiDataGrid-cellWithRenderer": {},
    },
});
