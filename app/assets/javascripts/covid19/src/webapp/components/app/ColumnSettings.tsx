import React from "react";
import { GridColDef, GridCellParams, GridCellValue } from "@material-ui/data-grid";
import { ProteinItemLink } from "../../../domain/entities/Covid19Data";
import i18n from "../../../utils/i18n";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core";
import { Badge } from "../protein/Protein";
import BSMArcImage from "./BSM-arc-generic-photo.png";

const determineButtonColor = (name: string) => {
    if (name === "turq") {
        return "#009688";
    } else if (name === "cyan") {
        return "#00bcd4";
    }
};

interface Details {
    description: string;
    authors: string;
    released: string;
}

const Title: React.FC<GridCellParams> = props => {
    return <div style={{ lineHeight: "20px" }}>{props.value}</div>;
};

const DetailsCell: React.FC<GridCellParams> = props => {
    const details = props.row.details as Details | undefined;
    if (!details) return null;

    return (
        <div style={{ lineHeight: "20px" }}>
            <b>{i18n.t("Authors")}:</b> {details.authors || "-"}
            <br />
            <b>{i18n.t("Released")}:</b> {details.released || "-"}
        </div>
    );
};

const Thumbnail: React.FC<GridCellParams> = props => {
    //console.log(props.row);
    const { type, name } = props.row;
    let { image_url: imageSrc } = props.row;

    if (
        !(
            type === props.field ||
            (props.field === "computationalModel" &&
                ["swiss-model", "BSM-Arc", "AlphaFold"].includes(type))
        )
    )
        return null;

    if (type === "BSM-Arc") {
        imageSrc = BSMArcImage;
    }

    return (
        <div style={{ width: "100%", lineHeight: 0, fontSize: 16, textAlign: "center" }}>
            <img
                alt={name}
                src={imageSrc}
                loading="lazy"
                style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginBottom: 10,
                    height: 110,
                }}
            />
            <p>{name}</p>
            <a
                href={props.row.external.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
            >
                <Badge
                    style={{
                        backgroundColor: "#607d8b",
                        borderColor: "#607d8b",
                        marginRight: 5,
                    }}
                >
                    <External text={props.row.external.text} icon="external" />
                </Badge>
            </a>
            <a
                href={props.row.query_url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
            >
                <Badge
                    style={{
                        backgroundColor: "#607d8b",
                        borderColor: "#607d8b",
                        marginRight: 5,
                    }}
                >
                    <External text={i18n.t("Go to Viewer")} icon="viewer" />
                </Badge>
            </a>
        </div>
    );
};

export const columnSettingsBase: GridColDef[] = [
    {
        field: "title",
        headerName: i18n.t("Title"),
        sortable: false,
        hide: false,
        headerAlign: "center",
        width: 220,
        renderCell: Title,
    },
    {
        field: "pdb",
        headerName: i18n.t("PDB"),
        headerAlign: "center",
        hide: false,
        width: 120,
        renderCell: Thumbnail,
        sortComparator: compareIds,
    },
    {
        field: "emdb",
        headerName: i18n.t("EMDB"),
        headerAlign: "center",
        hide: false,
        width: 120,
        renderCell: Thumbnail,
        sortComparator: compareIds,
    },
    {
        field: "protein",
        hide: true,
        headerName: i18n.t("Entity"),
        headerAlign: "center",
        width: 120,
    },
    {
        field: "ligands",
        hide: true,
        headerName: i18n.t("Ligands"),
        width: 120,
    },
    {
        field: "relatedType",
        hide: true,
        headerName: i18n.t("Specimen"),
        headerAlign: "center",
        width: 120,
    },
    {
        field: "computationalModel",
        headerName: i18n.t("Comp. Model"),
        headerAlign: "center",
        hide: false,
        width: 180,
        renderCell: Thumbnail,
        sortComparator: compareIds,
    },
    {
        field: "pdb_redo",
        headerName: i18n.t("PDB-Redo"),
        headerAlign: "center",
        hide: false,
        width: 250,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "pdb_redo") as ProteinItemLink;

            if (badgeInfo) {
                return (
                    <>
                        <ExternalLink url={badgeInfo.external_url}>
                            <Badge
                                style={{
                                    backgroundColor: `${determineButtonColor(badgeInfo.style)}`,
                                    borderColor: determineButtonColor(badgeInfo.style),
                                    marginRight: 5,
                                }}
                            >
                                <External text={badgeInfo.title} icon="external" />
                            </Badge>
                        </ExternalLink>

                        <ExternalLink url={badgeInfo.query_url}>
                            <Badge
                                style={{
                                    backgroundColor: `${determineButtonColor(badgeInfo.style)}`,
                                    borderColor: determineButtonColor(badgeInfo.style),
                                    marginRight: 5,
                                }}
                            >
                                <External text={badgeInfo.title} icon="viewer" />
                            </Badge>
                        </ExternalLink>
                    </>
                );
            }
        },
    },
    {
        field: "isolde",
        headerName: i18n.t("Isolde"),
        headerAlign: "center",
        hide: false,
        width: 80,
        sortable: false,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "isolde") as ProteinItemLink;
            if (badgeInfo) {
                return (
                    <>
                        <a
                            href={badgeInfo.query_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                        >
                            <Badge
                                style={{
                                    backgroundColor: `${determineButtonColor(badgeInfo.style)}`,
                                    borderColor: determineButtonColor(badgeInfo.style),
                                    marginRight: 5,
                                }}
                            >
                                <External text={badgeInfo.title} icon="viewer" />
                            </Badge>
                        </a>
                    </>
                );
            }
        },
    },
    {
        field: "refmac",
        headerName: i18n.t("Refmac"),
        headerAlign: "center",
        width: 120,
        hide: true,
        sortable: true,
        renderCell: (params: GridCellParams) => {
            const badgeInfo = params.getValue(params.id, "refmac") as ProteinItemLink;
            if (badgeInfo) {
                return (
                    <>
                        <a
                            href={badgeInfo.query_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                        >
                            <Badge
                                style={{
                                    backgroundColor: `${determineButtonColor(badgeInfo.style)}`,
                                    borderColor: determineButtonColor(badgeInfo.style),
                                    marginRight: 5,
                                }}
                            >
                                <External text={badgeInfo.title} icon="viewer" />
                            </Badge>
                        </a>
                    </>
                );
            }
        },
    },
    /*
    {
        field: "experiment",
        headerName: i18n.t("Experiment"),
        headerAlign: "center",
        width: 150,
    },
    {
        field: "pockets",
        headerName: i18n.t("Pocket"),
        headerAlign: "center",
        width: 150,
    },
    */
    {
        field: "details",
        headerName: i18n.t("Details"),
        headerAlign: "center",
        hide: false,
        width: 200,
        renderCell: DetailsCell,
    },
];

// Add a wrapper <div style="line-height: 0"> to render multi-line values in cell correctly
export const columnSettings = columnSettingsBase.map(columnSetting => {
    return {
        ...columnSetting,
        renderCell: (params: GridCellParams) => {
            return (
                <div style={styles.column}>
                    {columnSetting.renderCell ? columnSetting.renderCell(params) : null}
                </div>
            );
        },
    };
});

const styles = {
    column: { lineHeight: 0 },
};

const useStyles = makeStyles({
    externalLink: { textDecoration: "none", color: "#484848" },
    externalLinkIcon: { marginLeft: 2 },
});

const ExternalLink: React.FC<{ url: string | undefined }> = props => {
    const classes = useStyles();
    if (!props.url) return null;

    return (
        <a href={props.url} target="_blank" rel="noreferrer" className={classes.externalLink}>
            {props.children}
        </a>
    );
};

export const External: React.FC<{ text: string; icon: "external" | "viewer" }> = props => {
    const iconClassName = props.icon === "external" ? "fa-external-link-square" : "fa-eye";
    return (
        <React.Fragment>
            <span style={{ marginRight: 5 }}>{props.text}</span>
            <i className={classNames("fa", iconClassName)} />
        </React.Fragment>
    );
};

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
