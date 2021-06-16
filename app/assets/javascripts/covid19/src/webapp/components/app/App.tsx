import { Backdrop, Button, CircularProgress } from "@material-ui/core";
import React, { useEffect } from "react";
import testCovid19Data from "../../../data/covid19.json";
import { createStyles, makeStyles } from "@material-ui/core/styles";
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
export const App: React.FC<AppProps> = props => {
    const data: Covid19Data = props.data || testCovid19Data;
    const [pageSize, setPageSize] = React.useState<number>(50);
    const [rows, setRows] = React.useState<RowUpload[]>([]);
    const classes = useStyles();
    const isLoading = () => (rows === [] ? true : false);

    const Loader = () => (
        <div>
            <Backdrop className={classes.backdrop} open={isLoading()}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );

    useEffect(() => {
        const getDetailsData = async (items: ProteinItems[]) => {
            try {
                const urlsToRetrieve = items.map(item => item.api);
                const res = await Promise.all(
                    urlsToRetrieve.map(url => {
                        if (url !== undefined) {
                            return axios
                                .get(url)
                                .then((resp: AxiosResponse<any>) =>
                                    Object.values(resp.data).flatMap(data => data)
                                );
                        } else return [];
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
        };
        const items = data.proteins[0].sections.flatMap(section => {
            if (section.subsections.length !== 0) {
                const itemsToPush = section.items;
                const subsectionItems = section.subsections.flatMap(subsection => subsection.items);
                return itemsToPush.concat(subsectionItems);
            } else return section.items;
        });
        getDetailsData(items);
    }, [rows]);

    const handlePageSizeChange = (params: any) => {
        setPageSize(params.pageSize);
    };

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );

    const columns: GridColDef[] = [
        { field: "name", headerName: t("Title"), width: 100 },
        {
            field: "type",
            headerName: t("PDB/EMDB"),
            width: 135,
        },
        {
            field: "links",
            width: 400,
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
                                        >
                                            <Button color="primary" variant="contained">
                                                {badge.title} External
                                            </Button>
                                        </a>
                                        <a href={badge.query_url} target="_blank" rel="noreferrer">
                                            <Button color="primary" variant="contained">
                                                {badge.title}
                                            </Button>
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
                                >
                                    <Button color="primary" variant="contained">
                                        {badge.title}
                                    </Button>
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
            width: 220,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                if (params && params.row) {
                    return (
                        <div>
                            <a href={params.row.external.url} target="_blank" rel="noreferrer">
                                <Button color="primary" variant="contained">
                                    {params.row.external.text}
                                </Button>
                            </a>
                            <a href={params.row.query_url}>
                                <Button color="primary" variant="contained">
                                    Go to Viewer
                                </Button>
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
            <h1>Known Proteins</h1>
            {data.proteins[0].polyproteins.map((polyprotein, index) => (
                <Button key={index} color="primary" variant="contained">
                    {polyprotein}
                </Button>
            ))}
            <p>{data.proteins[0].names.map(name => `${name} | `)}</p>
            <p>{data.proteins[0].description}</p>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    autoHeight
                    columns={columns}
                    components={{
                        Toolbar: CustomToolbar,
                    }}
                    disableColumnMenu={true}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                    rowsPerPageOptions={[25, 50, 75, 100]}
                    pagination
                />
            </div>
        </div>
    );
};
