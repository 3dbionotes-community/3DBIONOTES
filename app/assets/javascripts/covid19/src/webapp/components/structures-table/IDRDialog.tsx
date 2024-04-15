import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { IconButton, Typography } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import { Pagination } from "@material-ui/lab";
import {
    AdditionalAnalysisCompound,
    Assay,
    Compound,
    OntologyTerm,
    Screen,
} from "../../../domain/entities/LigandImageData";
import { ListItemProps } from "./cells/DetailsCell";
import { colors } from "./badge/Badge";
import { Dialog } from "./Dialog";
import { IDROptions } from "./Columns";
import { recordOfStyles } from "../../../data/utils/ts-utils";
import { HtmlTooltip } from "./HtmlTooltip";
import i18n from "../../../utils/i18n";

export interface IDRDialogProps {
    onClose(): void;
    idrOptions: IDROptions;
    open: boolean;
}

export const IDRDialog: React.FC<IDRDialogProps> = React.memo(props => {
    const { onClose, open } = props;
    const { ligand, idr, error } = props.idrOptions;
    const [page, setPage] = React.useState(1);
    const setPageFromEvent = React.useCallback(
        (_event: React.ChangeEvent<unknown>, page: number) => {
            setPage(page);
        },
        []
    );
    const externalLink = React.useMemo(() => idr && <ExternalLink href={idr.externalLink} />, [
        idr,
    ]);

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            title={ligand?.name ? `${ligand.name} (${ligand.id})` : i18n.t("Ligand IDR")}
            headerChildren={externalLink}
            maxWidth={"sm"}
        >
            <Wrapper>
                {error && <Typography>{error}</Typography>}
                {idr && (
                    <>
                        <Container>
                            {idr.assays.map((assay, idx) => {
                                return (
                                    <>
                                        <Section title={i18n.t("Assay")}>
                                            <AssayFC
                                                key={idx}
                                                assay={assay}
                                                dataSource={{
                                                    label: idr.dataSource,
                                                    href: idr.externalLink,
                                                }}
                                            />
                                        </Section>
                                        <Section title={i18n.t("Screens")}>
                                            {assay.screens.map((screen, idx) => (
                                                <ScreenFC key={idx} screen={screen} />
                                            ))}
                                        </Section>
                                        <Section title={i18n.t("Compound")}>
                                            <CompoundFC compound={assay.compound} />
                                        </Section>
                                    </>
                                );
                            })}
                        </Container>
                        <div>
                            {/*Need this div always for CSS layout*/}
                            {idr.assays.length > 1 && (
                                <StyledPagination
                                    count={idr.assays.length}
                                    page={page}
                                    shape="rounded"
                                    color="primary"
                                    onChange={setPageFromEvent}
                                />
                            )}
                        </div>
                    </>
                )}
            </Wrapper>
        </StyledDialog>
    );
});

const ExternalLink: React.FC<ExternalLinkProps> = React.memo(({ href }) => {
    return (
        <a href={href} target="_blank" rel="noreferrer noopener">
            <IconButton>
                <OpenInNew />
            </IconButton>
        </a>
    );
});

//different <Li/> from "DetailsCell.tsx"
const ListItem: React.FC<ListItemProps> = React.memo(props => {
    const { name, value, children } = props;
    return (
        <>
            {(value || children) && (
                <Li>
                    <strong>{`${name}: `}</strong>
                    {value && <span>{value}</span>}
                    {children}
                </Li>
            )}
        </>
    );
});

export const NoBulletListItem = ListItem;

export const AssayFC: React.FC<AssayFCProps> = React.memo(({ assay, dataSource }) => (
    <>
        <ListItem name={"ID"} value={assay.id} />
        <ListItem name={"Type"}>{assay.type.reduce(reduceOntologyType, [])}</ListItem>
        <ListItem
            name={"Publication Title"}
            value={assay.publications.map(({ title }) => title).join(", ")}
        />
        <ListItem name={"Data DOI"}>
            <span>
                <a href={assay.dataDoi} target="_blank" rel="noreferrer noopener">
                    {assay.dataDoi}
                </a>
            </span>
        </ListItem>
        <ListItem name={"BioStudies Accession ID"} value={assay.bioStudiesAccessionId} />
        <ListItem name={"Source"}>
            <span>
                <a href={dataSource.href} target="_blank" rel="noreferrer noopener">
                    {dataSource.label}
                </a>
            </span>
        </ListItem>
    </>
));

const ScreenFC: React.FC<ScreenFCProps> = React.memo(({ screen }) => (
    <div>
        <ListItem name={"ID"} value={screen.id} />
        <ListItem name={"Type"}>{screen.type.reduce(reduceOntologyType, [])}</ListItem>
        <ListItem name={"Technology Type"}>
            {screen.technologyType.reduce(reduceOntologyType, [])}
        </ListItem>
        <ListItem name={"Imaging Method"}>
            {screen.imagingMethod.reduce(reduceOntologyType, [])}
        </ListItem>
        <ListItem name={"Data DOI"}>
            <span>
                <a href={screen.doi} target="_blank" rel="noreferrer noopener">
                    {screen.doi}
                </a>
            </span>
        </ListItem>
    </div>
));

const CompoundFC: React.FC<CompoundFCProps> = React.memo(({ compound }) => {
    const values = React.useMemo(
        () => ({
            cytotoxicity: aacToString(compound.cytotoxicity),
            doseResponse: aacToString(compound.doseResponse),
            cytotoxicIndex: aacToString(compound.cytotoxicIndex),
        }),
        [compound]
    );

    return (
        <>
            <ListItem name={"Inhibition of cytopathicity"} value={compound.percentageInhibition} />
            {compound.cytotoxicity && (
                <ListItem name={"Cytotoxicity (CC50)"} value={values.cytotoxicity} />
            )}
            {compound.doseResponse && (
                <ListItem name={"Dose-response (IC50)"} value={values.doseResponse} />
            )}
            {compound.cytotoxicIndex && (
                <ListItem
                    name={"Cytotoxic Index (Selectivity Index, IC50/CC50)"}
                    value={values.cytotoxicIndex}
                />
            )}
        </>
    );
});

const Section: React.FC<SectionProps> = React.memo(({ children, title }) => (
    <div>
        <Typography variant="h6" gutterBottom>
            {title}
        </Typography>
        <List>{children}</List>
    </div>
));

interface OntologyTypeProps {
    term: OntologyTerm;
}

export const OntologyType: React.FC<OntologyTypeProps> = React.memo(({ term: type }) => {
    const tooltip = React.useMemo(
        () => (
            <div>
                <div>
                    <span style={styles.bold}>{i18n.t("ID") + ": "}</span>
                    <span>{type.id}</span>
                </div>
                <div>
                    <span style={styles.bold}>{i18n.t("Term") + ": "}</span>
                    <span>{type.name}</span>
                </div>
                <div>
                    <span style={styles.bold}>{i18n.t("Description") + ": "}</span>
                    <span>{type.description}</span>
                </div>
                {type.source && (
                    <div>
                        <span style={styles.bold}>{i18n.t("Ontology") + ": "}</span>
                        <span>
                            {type.source.name} ({type.source.id})
                        </span>
                    </div>
                )}
            </div>
        ),
        [type]
    );

    return (
        <span>
            {type.name}
            {" ("}
            <HtmlTooltip title={tooltip}>
                <a href={type.externalLink} target="_blank" rel="noreferrer noopener">
                    {type.id}
                </a>
            </HtmlTooltip>
            {")"}
        </span>
    );
});

function aacToString(aac?: AdditionalAnalysisCompound) {
    if (!aac) return undefined;
    const relation = aac.relation !== "=";
    const units = aac.units?.name ?? undefined;

    return `${relation ? aac.relation + " " : ""}${JSON.stringify(aac.value)}${
        units ? " " + units : ""
    }`;
}

export function reduceOntologyType(acc: JSX.Element[], type: OntologyTerm, idx: number) {
    return [
        ...acc,
        acc.length !== 0 ? [<span key={idx + "-span"}>, </span>] : [],
        <OntologyType key={idx} term={type} />,
    ].flat();
}

const styles = recordOfStyles({
    bold: { fontWeight: "bold" },
});

interface SectionProps {
    title: string;
}

interface ExternalLinkProps {
    href: string;
}

interface AssayFCProps {
    assay: Assay;
    dataSource: { label: string; href: string };
}

interface ScreenFCProps {
    screen: Screen;
}

interface CompoundFCProps {
    compound: Compound;
}

const StyledDialog = styled(Dialog)`
    .MuiDialogContent-root {
        padding: 0 !important;
    }
`;

const Wrapper = styled.div`
    & {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 176px);
        padding: 24px 0 24px 24px;
        nav {
            margin-top: 16px;
        }
    }
    & > div:last-child {
        display: flex;
        justify-content: center;
    }
`;

const Container = styled.div`
    & {
        flex-grow: 1;
        overflow-y: auto;
        box-sizing: border-box;
    }
    &&& h6 {
        line-height: 1 !important;
        color: #00bcd4;
    }
    & div {
        margin-bottom: 1em;
    }
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const Li = styled.li`
    font-size: 0.875rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    span {
        color: ;
    }
`;

const StyledPagination = styled(Pagination)`
    .MuiPaginationItem-textPrimary.Mui-selected {
        background-color: ${colors["w3-blue-grey"]};
    }
    .MuiPaginationItem-textPrimary.Mui-selected:hover,
    .MuiPaginationItem-textPrimary.Mui-selected.Mui-focusVisible {
        background-color: #82a4b5;
    }
`;
