import { Button } from "@material-ui/core";
import React, { useEffect, useCallback } from "react";
import testCovid19Data from "../../../data/covid19.json";
import { withStyles } from "@material-ui/core/styles";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
} from "@material-ui/data-grid";
import axios, { AxiosResponse } from "axios";
import {
    Covid19Data,
    RowUpload,
    ItemDetails,
    PdbApiResponse,
    EmdbApiResponse,
    ProteinItems,
} from "../../../domain/entities/Covid19Data";
import { columnSettings } from "./ColumnSettings";
import styled from "styled-components";
import i18n from "../../../utils/i18n";

interface AppProps {
    data?: Covid19Data;
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

const HeaderBanner = styled.div`
    padding: 0;
    boxshadow: 0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%);
`;
const ProteinHeader = styled.div`
    margin: 20px 0 20px;
    padding: 0;
    box-shadow: 0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%);
    border-left: 100% solid #607d8b;
`;

const ProteinName = styled.p`
    margin: 5px 0 8px;
    color: #484848;
    font-weight: bold;
`;
const CustomToolbar = () => (
    <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
    </GridToolbarContainer>
);

export const App: React.FC<AppProps> = props => {
    const data: Covid19Data = props.data || testCovid19Data;
    const [page, setPage] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(50);
    const [rows, setRows] = React.useState<RowUpload[]>([]);
    const [details, setDetails] = React.useState<ItemDetails[]>([]);
    const begin = page === 0 ? 0 : page * pageSize;
    const end = (page + 1) * pageSize;

    const items = data.proteins[0].sections.flatMap(section => {
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

    const getDetailsData = useCallback(async (items: ProteinItems[]) => {
        try {
            const urlsToRetrieve = items.map(item => item.api);
            const res = await Promise.all(
                urlsToRetrieve.map(url => {
                    return url !== undefined
                        ? axios
                              .get(url)
                              .then((resp: AxiosResponse<any>) =>
                                  Object.values(resp.data).flatMap(data => data)
                              )
                        : [];
                })
            );
            const newRes = res.flatMap(res1 => res1[0] as PdbApiResponse | EmdbApiResponse);
            const newRows = newRes.map(res => {
                return {
                    description:
                        (res as PdbApiResponse)?.title ||
                        (res as EmdbApiResponse)?.deposition?.title,
                    authors:
                        (res as PdbApiResponse)?.entry_authors?.join(" , ") ||
                        (res as EmdbApiResponse)?.deposition?.authors,
                    released:
                        (res as PdbApiResponse)?.release_date ||
                        (res as EmdbApiResponse)?.deposition?.deposition_date,
                };
            });
            setDetails(newRows);
        } catch {
            throw Error("Promise failed");
        }
    }, []);
    useEffect(() => {
        const rowsToUpload = items.map((item, index) => {
            const itemWithSeparatedLinks = item.links.map(link => {
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
            return {
                id: index,
                ...item,
                details: {
                    description: "",
                    authors: [],
                    released: "",
                },
            };
        });
        setRows(rowsToUpload);
    }, []);

    useEffect(() => {
        getDetailsData(items.slice(begin, end));
    }, [rows, page]);

    return (
        <Body>
            <HeaderBanner>
                <div style={{ backgroundColor: "#607d8b", color: "#fff", padding: 10 }}>
                    <h1>
                        <b>{i18n.t("Known Proteins")}</b>
                    </h1>
                </div>
            </HeaderBanner>

            {data.proteins.slice(0, 2).map((protein, index) => (
                <ProteinHeader key={index}>
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
                        <div style={{ display: "flex", height: "100%" }}>
                            <div style={{ flexGrow: 1 }}>
                                <DataGrid
                                    rows={rows.map((row, index) =>
                                        index >= begin && index <= end
                                            ? { ...row, details: details[index - begin] }
                                            : row
                                    )}
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
                                    pagination
                                    rowsPerPageOptions={[25, 50, 75, 100]}
                                />
                            </div>
                        </div>
                    </div>
                </ProteinHeader>
            ))}
        </Body>
    );
};

const Body = styled.div`
    font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
        Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
`;
