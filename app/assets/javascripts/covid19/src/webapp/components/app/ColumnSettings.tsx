import React from "react";
import {
    GridColDef,
    GridCellParams,
} from "@material-ui/data-grid";
import { t } from "@dhis2/d2-i18n";
import RenderCellExpand from "./RenderCellExpand";
import { BootstrapButton } from "./App";
import { ProteinItemLink } from "../../../domain/entities/Covid19Data";

const determineButtonColor = (name: string) => {
    if (name === "turq") {
        return "#009688";
    } else if (name === "cyan") {
        return "#00bcd4";
    }
};
export const columnSettings: GridColDef[] = [
    { field: "name", headerName: t("Title"), width: 100 },
    {
        field: "type",
        headerName: t("PDB/EMDB"),
        width: 135,
    },
    {
        field: "protein",
        headerName: t("Protein"),
        width: 120,
    },
    {
        field: "ligands",
        headerName: t("Ligands"),
        width: 120,
    },
    {
        field: "relatedType",
        headerName: t("Specimen"),
        width: 120,
    },
    {
        field: "computationalModel",
        headerName: t("Computational Model"),
        width: 150,
    },
    {
        field: "pdb_redo",
        headerName: t("PDB-Redo"),
        width: 250,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "pdb_redo") as ProteinItemLink;
            if(badgeInfo) {
                return (
                    <>
                                    <a
                                        href={badgeInfo.external_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <BootstrapButton
                                            color="primary"
                                            variant="contained"
                                            style={{
                                                backgroundColor: `${determineButtonColor(
                                                    badgeInfo.style
                                                )}`,
                                                borderColor: determineButtonColor(badgeInfo.style),
                                                marginRight: 5,
                                            }}
                                        >
                                            {badgeInfo.title} External
                                        </BootstrapButton>
                                    </a>
                                    <a
                                        href={badgeInfo.query_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <BootstrapButton
                                            color="primary"
                                            variant="contained"
                                            style={{
                                                backgroundColor: `${determineButtonColor(
                                                    badgeInfo.style
                                                )}`,
                                                borderColor: determineButtonColor(badgeInfo.style),
                                                marginRight: 5,
                                            }}
                                        >
                                            {badgeInfo.title}
                                        </BootstrapButton>
                                    </a>
                                </>
                )
            }
        },
    },
    {
        field: "isolde",
        headerName: t("Isolde"),
        width: 80,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "isolde") as ProteinItemLink;
            if(badgeInfo) {
                return (
                    <>
                    <a
                        href={badgeInfo.query_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <BootstrapButton
                            color="primary"
                            variant="contained"
                            style={{
                                backgroundColor: `${determineButtonColor(
                                    badgeInfo.style
                                )}`,
                                borderColor: determineButtonColor(badgeInfo.style),
                                marginRight: 5,
                            }}
                        >
                            {badgeInfo.title}
                        </BootstrapButton>
                    </a>
                </>
                )
            }
        },
    },
    {
        field: "refmac",
        headerName: t("Refmac"),
        width: 80,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "refmac") as ProteinItemLink;
            if(badgeInfo) {
                return (
                    <>
                    <a
                        href={badgeInfo.query_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <BootstrapButton
                            color="primary"
                            variant="contained"
                            style={{
                                backgroundColor: `${determineButtonColor(
                                    badgeInfo.style
                                )}`,
                                borderColor: determineButtonColor(badgeInfo.style),
                                marginRight: 5,
                            }}
                        >
                            {badgeInfo.title}
                        </BootstrapButton>
                    </a>
                </>
                )
            }
        },
    },
    {
        field: "image_url",
        headerName: t("Thumbnail"),
        width: 200,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            if (params && params.value) {
                return (
                    <div>
                        <img
                            src={params.value as string}
                            alt="image_url"
                            style={{
                                display: "block",
                                marginLeft: "auto",
                                marginRight: "auto",
                                width: "70%",
                            }}
                        />
                    </div>
                );
            }
        },
    },
    {
        field: "external",
        headerName: t("Actions"),
        width: 240,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            if (params && params.row) {
                return (
                    <div>
                        <a
                            href={params.row.external.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                        >
                            <BootstrapButton
                                color="primary"
                                variant="contained"
                                style={{
                                    backgroundColor: "#607d8b",
                                    borderColor: "#607d8b",
                                    marginRight: 5,
                                }}
                            >
                                {params.row.external.text}
                            </BootstrapButton>
                        </a>
                        <a
                            href={params.row.query_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                        >
                            <BootstrapButton
                                color="primary"
                                variant="contained"
                                style={{
                                    backgroundColor: "#607d8b",
                                    borderColor: "#607d8b",
                                    marginRight: 5,
                                }}
                            >
                                Go to Viewer
                            </BootstrapButton>
                        </a>
                    </div>
                );
            }
        },
    },
    { field: "experiment", headerName: t("Experiment (if any)"), width: 150 },
    { field: "pockets", headerName: t("Pocket"), width: 150 },
    {
        field: "details",
        headerName: t("Details"),
        width: 150,
        sortable: false,
        renderCell: RenderCellExpand
    }
];
