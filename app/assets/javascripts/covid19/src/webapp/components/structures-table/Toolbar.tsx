import _ from "lodash";
import React from "react";
import { Stop as StopIcon, HelpOutline as HelpOutlineIcon } from "@material-ui/icons";
import styled from "styled-components";
import { GridApi, GridToolbarColumnsButton, GridToolbarContainer } from "@material-ui/data-grid";
import { CircularProgress, Typography } from "@material-ui/core";
import { DataGrid } from "../../../domain/entities/DataGrid";
import { Covid19Filter, ValidationSource } from "../../../domain/entities/Covid19Info";
import { VirtualScroll, VirtualScrollbarProps } from "../VirtualScrollbar";
import { CustomGridToolbarExport } from "./CustomGridToolbarExport";
import { CustomGridPagination } from "./CustomGridPagination";
import { SearchBar } from "./SearchBar";
import { CustomCheckboxFilter } from "./CustomCheckboxFilter";
import { SearchExampleButton } from "./SearchExampleButton";
import { HtmlTooltip } from "./HtmlTooltip";
import { SelfCancellable } from "./useStructuresTable";
import i18n from "../../../utils/i18n";
import "./Toolbar.css";

export const searchExamples = [
    "EMD-21375",
    "glycoprotein",
    "Remdesivir",
    "3CL-Pro",
    "Llama",
    "PanDDA Helicase",
    "Martinez",
];

export interface ToolbarProps {
    search: string;
    setSearch(search: string): void;
    highlighted: boolean;
    setHighlight: (value: boolean) => void;
    filterState: Covid19Filter;
    setFilterState: (value: React.SetStateAction<Covid19Filter>) => void;
    gridApi: GridApi;
    dataGrid: DataGrid;
    virtualScrollbarProps: VirtualScrollbarProps;
    page: number;
    pageSize: number;
    pageSizes: number[];
    setPage: (param: number) => void;
    setPageSize: (param: number) => void;
    validationSources: ValidationSource[];
    isLoading: boolean;
    slowLoading: boolean;
    cancelRequest: SelfCancellable;
    count: number;
}

// Toolbar is called with empty object on initialization

export const Toolbar: React.FC<ToolbarProps | {}> = props => {
    const helpText = React.useMemo(() => {
        return {
            p: [
                i18n.t(
                    `Write in the searching box one word (example: spike) or several
        words in a row (example: spike SARS-CoV-2) to perform the
        search. If you write several words the searching result will
        be the intersection of independent searching results with
        each one of the words. If you press any protein product of
        the SARS-CoV-2 PROTEOME on the top of the page, this term
        will be included automatically in the searching box. You can
        also include one or several terms detailed in the FILTER on
        the right by selecting them. This(These) term(s) will appear
        in the searching box, where you can write additional words
        to look for them as well. Disable it(them) by pressing the
        “x”.`,
                    { nsSeparator: false }
                ),
                i18n.t(
                    `To see an example of the results obtained, press the
        example buttons below the searching box (6YOR, Homo sapiens,
        and SARS-CoV-2). For any of them you should see a table with
        seven columns (Title, PDB, EMDB, Entities, Ligands,
        Organisms and Details) that you can HIDE or SHOW
        independently with the COLUMNS button located on the right
        edge. The content of the table can be also exported with
        EXPORT as a file of CSV or JSON format. The scope of the
        search will cover the terms included in the seven columns.`,
                    { nsSeparator: false }
                ),
            ],
            ol: [
                i18n.t(
                    `Title: From PDBe or EMDB. The eye below the title opens
        the 3DBionotes viewer.`,
                    { nsSeparator: false }
                ),
                i18n.t(
                    `PDB: With an image of the atomic structure and the link
        to EBI. In case there exists a structure improved by
        PDB-Redo, Coronavirus Task Force or CERES, a link to the
        respective web pages should be included. The eye opens
        that improved structure in 3DBionotes viewer.`,
                    { nsSeparator: false }
                ),
                i18n.t(`EMDB: With an image of the 3D map and the respective link to EBI/EMDB.`, {
                    nsSeparator: false,
                }),
                i18n.t(
                    `Entities: List detailing protein products and nucleic
        acids present in the macromolecule. Long lists contain a
        VIEW MORE button to check a pop up window containing the
        whole list.`,
                    { nsSeparator: false }
                ),
                i18n.t(
                    `Ligands: List detailing small molecules bound to the
        macromolecule including drugs, ions, glycans, etc. Longs lists contain also a VIEW MORE button to check the whole.`,
                    { nsSeparator: false }
                ),
                i18n.t(
                    `Organisms: To which at least one of the structural
        entities belongs to.`,
                    { nsSeparator: false }
                ),
                i18n.t(
                    `Details: Additional relevant info, including details of
        the publication paper that describes the macromolecule
        structure/map, and links to other databases or web
        servers in which the structure/map or the bound ligands
        are included. Long lists contain also a VIEW MORE button
        to check the whole list.`,
                    { nsSeparator: false }
                ),
            ],
        };
    }, []);

    if (!isNonEmptyObject<ToolbarProps>(props)) return null;

    const {
        search,
        setSearch,
        highlighted,
        setHighlight,
        filterState,
        setFilterState,
        gridApi,
        dataGrid,
        virtualScrollbarProps,
        page,
        pageSize,
        pageSizes,
        setPage,
        setPageSize,
        validationSources,
        count,
        isLoading,
        slowLoading,
        cancelRequest,
    } = props;

    return (
        <React.Fragment>
            <GridToolbarContainer style={styles.container}>
                <div style={styles.toolbarRow}>
                    <div style={styles.searchBar}>
                        <SearchBar
                            value={search}
                            setValue={setSearch}
                            highlighted={highlighted}
                            setHighlight={setHighlight}
                            filterState={filterState}
                            setFilterState={setFilterState}
                        />
                        <CustomCheckboxFilter
                            filterState={filterState}
                            setFilterState={setFilterState}
                            validationSources={validationSources}
                        />
                        <HtmlTooltip
                            title={
                                <>
                                    <StyledTypography variant="body2">
                                        {helpText.p[0]}
                                    </StyledTypography>
                                    <StyledTypography variant="body2">
                                        {helpText.p[1]}
                                    </StyledTypography>
                                    <OrderedList>
                                        {helpText.ol.map((t, idx) => (
                                            <li key={idx}>{t}</li>
                                        ))}
                                    </OrderedList>
                                </>
                            }
                        >
                            <span style={styles.tooltip}>
                                <HelpOutlineIcon />
                            </span>
                        </HtmlTooltip>
                        {isLoading && (
                            <LoadingContainer
                                cancellable={slowLoading}
                                title={
                                    slowLoading
                                        ? i18n.t("Cancel request")
                                        : i18n.t("Loading request...")
                                }
                            >
                                <StyledCircularProgress size="36px" />
                                {slowLoading && (
                                    <StopIcon
                                        color="inherit"
                                        style={styles.stop}
                                        fontSize="small"
                                        onClick={() => cancelRequest()}
                                    />
                                )}
                            </LoadingContainer>
                        )}
                    </div>
                    <GridToolbarActions>
                        <CustomGridToolbarExport dataGrid={dataGrid} gridApi={gridApi} />
                        <GridToolbarColumnsButton />
                    </GridToolbarActions>
                </div>

                <div style={styles.toolbarRow}>
                    <div style={styles.exampleRow}>
                        <p style={styles.examplesText}>{i18n.t("Examples")}:</p>
                        {searchExamples.map((example, idx) => (
                            <SearchExampleButton
                                key={idx}
                                setValue={setSearch}
                                exampleValue={example}
                            />
                        ))}
                    </div>
                    <CustomGridPagination
                        count={count}
                        isLoading={isLoading}
                        page={page}
                        pageSize={pageSize}
                        pageSizes={pageSizes}
                        setPage={setPage}
                        setPageSize={setPageSize}
                    />
                </div>
            </GridToolbarContainer>

            <VirtualScroll {...virtualScrollbarProps} />
        </React.Fragment>
    );
};

export const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "14px 14px 0px 14px",
        alignItems: "flex-start",
    },
    toolbarRow: {
        display: "flex",
        flexDirection: "row" as const,
        width: "100%",
        alignItems: "center",
    },
    tooltip: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        height: "45px",
        width: "45px",
        margin: "auto 5px",
        color: "#ffffff",
        backgroundColor: "#607d8b",
        borderRadius: "0.75rem",
        outline: "none",
        cursor: "pointer",
    },
    exampleRow: { display: "flex" as const, alignItems: "center", marginRight: "auto" },
    examplesText: { margin: 0 },
    searchBar: { display: "flex", flexGrow: 1 },
    stop: { position: "absolute" as const },
    slowLoading: { display: "flex", alignItems: "center" },
};

function isNonEmptyObject<T extends object>(obj: T | {}): obj is T {
    return !_.isEmpty(Object.keys(obj));
}

const GridToolbarActions = styled.div`
    display: flex;
    align-items: center;
    height: 45px;
    margin-left: auto;
    .MuiButton-textSizeSmall {
        padding: 6px 8px;
        font-size: 1rem;
        color: #607d8b;
        .MuiButton-iconSizeSmall > *:first-child {
            font-size: 1.5rem;
        }
    }
`;

const OrderedList = styled.ol`
    margin: 1em 0;
    padding: 0 2em;
    li {
        line-height: 1.4;
        margin-bottom: 0.5em;
    }
`;

export const StyledTypography = styled(Typography)`
    &.MuiTypography-body2 {
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.87);
        padding: 1em 1em 0 1em;
        word-wrap: break-word;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 500;
    }
`;

const LoadingContainer = styled.div<{ cancellable: boolean }>`
    display: flex;
    width: 36px;
    margin: 0 10px;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #009688;
    cursor: ${props => (props.cancellable ? "pointer" : "default")};
`;

const StyledCircularProgress = styled(CircularProgress)`
    position: absolute;
    &.MuiCircularProgress-colorPrimary {
        color: #009688;
    }
`;
