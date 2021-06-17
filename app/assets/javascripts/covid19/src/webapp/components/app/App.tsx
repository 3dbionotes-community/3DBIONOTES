import { Backdrop, Button, CircularProgress } from "@material-ui/core";
import React, { useEffect, useCallback } from "react";
import testCovid19Data from "../../../data/covid19.json";
import { createStyles, makeStyles, withStyles } from "@material-ui/core/styles";
import {
    DataGrid,
    GridColDef,
    GridCellParams,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
} from "@material-ui/data-grid";
import { t } from "@dhis2/d2-i18n";
import axios, { AxiosResponse } from "axios";
import { renderCellExpand } from "./renderCellExpand";

interface Covid19Data {
    proteins: Protein[];
}

interface Protein {
    description: string;
    name: string;
    names: string[];
    polyproteins: string[];
    sections: ProteinSection[];
}

interface ProteinSection {
    experiments?: string[] | {};
    name: string;
    pockets?: Record<string, number> | never[] | {};
    subsections: ProteinSection[];
    items: ProteinItems[];
}

interface ProteinItems {
    api?: string;
    description?: string | null;
    experiment?: string;
    external: ProteinItemExternal;
    image_url?: string;
    links: ProteinItemLink[];
    name: string;
    pockets?: Record<string, number> | never[] | {};
    query_url: string;
    related?: string[];
    type?: string;
    interaction?: string;
    relatedType?: string;
    computationalModel?: string;
}

interface ProteinItemExternal {
    text: string;
    url: string;
}

interface ProteinItemLink {
    check?: string;
    external_url?: string;
    name: string;
    query_url: string;
    style: string;
    title: string;
}

interface AppProps {
    data?: Covid19Data;
}

interface RowUpload {
    id?: number;
    details?: ItemDetails;
    links?: ProteinItemLink[];
    name?: string;
    type?: string;
    experiment?: string;
    pockets?: Record<string, number> | never[] | {};
    image_url?: string;
    external?: ProteinItemExternal;
}

interface ItemDetails {
    description?: string;
    author?: string[] | unknown[];
    released?: string;
}

interface ApiResponse {
    assemblies?: Assemblies[]; //new object
    deposition_date?: string;
    deposition_site?: string;
    entry_authors?: unknown[];
    experimental_method?: unknown[];
    experimental_method_class?: unknown[];
    number_of_entities?: Record<string, number>; //new object
    processing_site?: string;
    related_structure?: RelatedStructures[];
    release_date?: string;
    revision_date?: string;
    split_entry?: never[];
    title?: string;
}

interface Assemblies {
    assembly_id: string;
    form: string;
    name: string;
    preferred: boolean;
}

interface RelatedStructures {
    accession: string;
    relationship: string;
    resource: string;
}

const useStyles = makeStyles(() =>
    createStyles({
        backdrop: {
            zIndex: 1,
            color: "#fff",
        },
    })
);
const BootstrapButton = withStyles({
    root: {
      boxShadow: 'none',
      textTransform: 'none',
      fontSize: 14,
      padding: '6px 12px',
      border: '1px solid',
      lineHeight: 1.5,
      backgroundColor: '#0063cc',
      borderColor: '#0063cc',
      margin: "2px 0",
      textShadow: "1px 1px 2px rgb(0 0 0 / 30%)",
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:hover': {
        backgroundColor: '#0069d9',
        borderColor: '#0062cc',
        boxShadow: 'none',
      },
      '&:active': {
        boxShadow: 'none',
        backgroundColor: '#0062cc',
        borderColor: '#005cbf',
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
      },
    },
  })(Button);
export const App: React.FC<AppProps> = props => {
    const data: Covid19Data = props.data || testCovid19Data;
    const [page, setPage] = React.useState(0);
    const [rows, setRows] = React.useState<RowUpload[]>([]);
    const classes = useStyles();
    const isLoading = () => (rows.length === 0 ? true : false);

    const Loader = () => (
        <div>
            <Backdrop className={classes.backdrop} open={isLoading()}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
    const getDetailsData = useCallback(async (items: ProteinItems[]) => {
        try {
            const urlsToRetrieve = items.map(item => item.api);
            const res = await Promise.all(
                urlsToRetrieve.map(url => {
                    return url !== undefined ? axios
                        .get(url)
                        .then((resp: AxiosResponse<any>) =>
                            Object.values(resp.data).flatMap(data => data)
                        ) : [];
                })
            );
            const newRes = res.flatMap(res1 => res1[0] as ApiResponse);

            const rowsToUpload = items.map((item, index) => ({
                id: index,
                details: newRes[index]
                    ? {
                          description: newRes[index].title,
                          author: newRes[index].entry_authors,
                          released: newRes[index].release_date,
                      }
                    : {},
                links: item.links,
                name: item.name,
                interaction: item.interaction || undefined,
                relatedType: item.relatedType || undefined,
                computationalModel: item.computationalModel || undefined,
                type: item.type,
                image_url: item.image_url,
                external: item.external,
                experiment: item.experiment,
                pockets: item.pockets,
            }));
            setRows(rowsToUpload);
        } catch {
            throw Error("Promise failed");
        }
    }, []);
    useEffect(() => {
        const items = data.proteins[0].sections.flatMap(section => {
            if (section.subsections.length !== 0) {
                const itemsToPush = section.items;
                const subsectionItems = section.subsections.flatMap(subsection => subsection.items.map(item => {
                    if(section.name === "Interactions") {
                        return ({interaction: subsection.name, ...item})
                    }
                    else if(section.name === "Related") {
                        return ({relatedType: subsection.name, ...item})
                    }
                    else return ({computationalModel: subsection.name, ...item})
                }));
                return itemsToPush.concat(subsectionItems);
            } else 
            {
                return section.items;
            }
        });
        getDetailsData(items);
    }, []);

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
    const determineButtonColor = (name: string) => {
        if(name === "turq"){
            return "#009688";
        }
        else if(name === "cyan") {
            return "#00bcd4";
        }
    }
    const columns: GridColDef[] = [
        { field: "name", headerName: t("Title"), width: 100 },
        {
            field: "type",
            headerName: t("PDB/EMDB"),
            width: 135,
        },
        {
            field: "interaction",
            headerName: t("Interaction"),
            width: 200,
        },
        {
            field: "relatedType",
            headerName: t("Related"),
            width: 110,
        },
        {
            field: "computationalModel",
            headerName: t("Computational Model"),
            width: 150,
        },
        
        {
            field: "links",
            width: 350,
            headerName: t("Badges"),
            sortable: false,
            renderCell: (params: GridCellParams) => {
                const badgeInfo = params.row.links as ProteinItemLink[];
                return (
                    <div>
                        {badgeInfo.map((badge, index) => {
                            if (badge.external_url && badge.query_url) {
                                return (
                                    <>
                                        <a
                                            key={index}
                                            href={badge.external_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{textDecoration: "none"}}
                                        >
                                            <BootstrapButton color="primary" variant="contained" style={{backgroundColor: `${determineButtonColor(badge.style)}`, borderColor: determineButtonColor(badge.style), marginRight: 5}}>
                                                {badge.title} External
                                            </BootstrapButton>
                                        </a>
                                        <a href={badge.query_url} target="_blank" rel="noreferrer" style={{textDecoration: "none"}}>
                                            <BootstrapButton color="primary" variant="contained" style={{backgroundColor: `${determineButtonColor(badge.style)}`, borderColor: determineButtonColor(badge.style), marginRight: 5}}>
                                                {badge.title}
                                            </BootstrapButton>
                                        </a>
                                    </>
                                );
                            }
                            return (
                                <a
                                    key={index}
                                    href={badge.query_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{textDecoration: "none"}}
                                >
                                    <BootstrapButton color="primary" variant="contained" style={{backgroundColor: `${determineButtonColor(badge.style)}`, borderColor: determineButtonColor(badge.style), marginRight: 5}}>
                                        {badge.title}
                                    </BootstrapButton>
                                </a>
                            );
                        })}
                    </div>
                );
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
            width: 200,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                if (params && params.row) {
                    return (
                        <div>
                            <a href={params.row.external.url} target="_blank" rel="noreferrer" style={{textDecoration: "none"}}>
                                <BootstrapButton color="primary" variant="contained" style={{backgroundColor: "#607d8b", borderColor: "#607d8b", marginRight: 5}}>
                                    {params.row.external.text}
                                </BootstrapButton>
                            </a>
                            <a href={params.row.query_url} target="_blank" rel="noreferrer" style={{textDecoration: "none"}}>
                                <BootstrapButton color="primary" variant="contained" style={{backgroundColor: "#607d8b", borderColor: "#607d8b", marginRight: 5}}>
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
            renderCell: renderCellExpand,
        },
    ];

    return (
        <div>
            <Loader />
            <div style={{backgroundColor: "#fff", padding: 0, boxShadow: "0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%)"}}>
                <div style={{backgroundColor: "#607d8b", color: "#fff", padding: 10 }}>
                    <h1><b>Known Proteins</b></h1>
                </div>
            </div>
            <div style={{margin: "20px 0 20px", backgroundColor: "#fff", padding: 0, boxShadow: "0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%)", borderLeft: "20px solid #607d8b"}}>
            <div style={{padding: 16}}>
            <BootstrapButton color="primary" variant="contained" style={{backgroundColor: "#00bcd4", borderColor: "#00bcd4"}}>
                    <strong>{data.proteins[0].name}</strong>
                </BootstrapButton>
            {data.proteins[0].polyproteins.map((polyprotein, index) => (
                <BootstrapButton key={index} color="primary" variant="contained" style={{backgroundColor: "#607d8b", borderColor: "#607d8b", marginLeft: 5}}>
                    {polyprotein}
                </BootstrapButton>
            ))}
            <p style={{margin: "5px 0 8px", color: "#484848", fontWeight: "bold"}}>{data.proteins[0].names.join(" | ")}</p>
            <p><i>{data.proteins[0].description}</i></p>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    autoHeight
                    columns={columns}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    onPageChange={(params) => {
                        setPage(params.page);
                      }}
                    disableColumnMenu={true}
                    pageSize={50}
                    pagination
                />
            </div>
        </div>
        </div>
        </div>
    );
};
