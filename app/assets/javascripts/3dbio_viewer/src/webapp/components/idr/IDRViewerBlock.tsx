import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Pdb } from "../../../domain/entities/Pdb";
import { recordOfStyles } from "../../../utils/ts-utils";
import {
    AdditionalAnalysisCompound,
    Assay,
    Compound,
    OntologyTerm,
    Plate,
    Screen,
} from "../../../domain/entities/LigandImageData";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@material-ui/core";
import { ViewerTooltip } from "../viewer-tooltip/ViewerTooltip";
import { useBooleanState } from "../../hooks/use-boolean";
import { SVGPlate } from "./SVGPlate";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { HtmlTooltip } from "../HtmlTooltip";
import i18n from "../../utils/i18n";

interface BasicInfoProps {
    pdb: Pdb;
}

export const IDRViewerBlock: React.FC<BasicInfoProps> = React.memo(({ pdb }) => {
    const [showTooltip, { set: setShowTooltip, toggle: toggleTooltip }] = useBooleanState(false);

    const idrs = React.useMemo(
        () => _.compact(pdb.ligands?.map(ligand => ligand.imageDataResource)),
        [pdb]
    );

    const getAssayDescription = React.useCallback((assay: Assay) => {
        const screen = assay.screens.find(screen => screen.id == "2602");
        const namespace = {
            ligandName: assay.compound.name,
            percentageInhibition: assay.compound.percentageInhibition,
            micromolarConcentration: _.first(_.first(screen?.plates)?.wells)
                ?.micromolarConcentration,
            hitOver75Activity:
                _.first(_.first(screen?.plates)?.wells)?.hitCompound.toLowerCase() === "yes"
                    ? "is"
                    : "is not",
            doseResponseValue: assay.compound.doseResponse?.value,
            doseResponseUnit: assay.compound.doseResponse?.units?.name,
            cytotoxicityValue: assay.compound.cytotoxicity?.value,
            cytotoxicityUnits: assay.compound.cytotoxicity?.units?.name,
            cytotoxicIndexValue: assay.compound.cytotoxicIndex?.value,
            cytotoxicIndexUnits: assay.compound.cytotoxicIndex?.units?.name,
        };

        //prettier-ignore
        return [
            i18n.t("This is an assay based on high content screen of cells treated with a compound library and infection in which a well-defined collection of compounds is tested against SARS-CoV-2.", namespace),
            i18n.t("The compound {{ligandName}} inhibited cytopathicity by {{percentageInhibition}} at {{micromolarConcentration}} µM, which {{hitOver75Activity}} considered as a hit (efficiency in blocking viral cytopathicity) in the context of this assay.", namespace),
            screen?.type.some(term => term.name === "multiple concentration")
                ? i18n.t("Concentration-response profiling of hit compound {{ligandName}} was performed in triplicate with eight concentrations ranging from 20 µM to 20 nM and on three different plates to minimise the influence of plate effects.", namespace)
                : [],
            assay.compound.doseResponse
                ? i18n.t("The half maximal inhibitory concentration (IC50) for {{ligandName}} is {{doseResponseValue}} {{doseResponseUnit}}.", namespace)
                : [],
            assay.compound.cytotoxicity
                ? i18n.t("The cytotoxic concentration (CC50) for {{ligandName}} is {{cytotoxicityValue}} {{cytotoxicityUnits}}.", namespace)
                : [],
            assay.compound.cytotoxicIndex
                ? i18n.t("The the ratio between the cytopathic effect and cytotoxicity, also known as the selectivity index (IC50/CC50), for {{ligandName}} is {{cytotoxicIndexValue}} {{cytotoxicIndexUnits}}.", namespace)
                : [],
        ].flat();
    }, []);

    return (
        <>
            {!_.isEmpty(idrs) && (
                <div style={styles.section}>
                    <div style={styles.title}>
                        {i18n.t("High-Content Screening (HCS) Assays")}
                        <ViewerTooltip
                            title={i18n.t(
                                "This section contains key information about High-Content Screening assays in which some of the entities present in the atomic model have been tested, including information about assay, screens, plates, wells and compound effects. Note that for HCSs of cells treated with a compound library, due to the nature of the assay, there is no precise evidence that the compound-macromolecule binding in the atomic model is the direct cause of the final phenotype observed in the images."
                            )}
                            showTooltip={showTooltip}
                            setShowTooltip={setShowTooltip}
                        >
                            <button onClick={toggleTooltip}>?</button>
                        </ViewerTooltip>
                    </div>

                    {idrs?.map((idr, i) => (
                        <Container key={i}>
                            {idr.assays.map((assay, idx) => {
                                return (
                                    <React.Fragment key={idx}>
                                        {getAssayDescription(assay).map((description, idx) => (
                                            <p key={idx} style={styles.description}>
                                                {description}
                                            </p>
                                        ))}
                                        <Section
                                            title={i18n.t("Assay")}
                                            subtitle={assay.name}
                                            help={assay.description}
                                        >
                                            <AssayFC
                                                assay={assay}
                                                dataSource={{
                                                    label: idr.dataSource,
                                                    href: idr.externalLink,
                                                }}
                                            />
                                        </Section>
                                        <Section title={i18n.t("Compound")}>
                                            <CompoundFC compound={assay.compound} />
                                        </Section>
                                        {assay.screens.map((screen, idx) => (
                                            <Section
                                                key={idx}
                                                title={i18n.t("Screen")}
                                                subtitle={screen.name}
                                                help={screen.description}
                                            >
                                                <ScreenFC screen={screen} />
                                                <PlatesAccordion plates={screen.plates} />
                                            </Section>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </Container>
                    ))}
                </div>
            )}
            {_.isEmpty(idrs) && <p style={styles.notFound}>{i18n.t("No IDRs found.")}</p>}
        </>
    );
});

interface PlatesAccordionProps {
    plates: Plate[];
}

const PlatesAccordion: React.FC<PlatesAccordionProps> = React.memo(({ plates }) => {
    const firstPlate = React.useMemo(() => _.first(plates), [plates]);

    return (
        <div>
            {firstPlate && <SVGPlate plate={firstPlate} idx={0} />}
            {!_.isEmpty(plates.slice(1)) && (
                <StyledAccordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{i18n.t("Show more")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={styles.platesAccordion}>
                            {plates.slice(1).map((plate, idx) => (
                                <SVGPlate plate={plate} key={idx + 1} idx={idx + 1} /> // idx + 1 for the slice
                            ))}
                        </div>
                    </AccordionDetails>
                </StyledAccordion>
            )}
        </div>
    );
});

export interface ListItemProps {
    name: string;
    value?: string;
}

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

interface AssayFCProps {
    assay: Assay;
    dataSource: { label: string; href: string };
}

const AssayFC: React.FC<AssayFCProps> = React.memo(({ assay, dataSource }) => (
    <>
        <ListItem name={"ID"} value={assay.id} />
        <ListItem name={"Type"}>{assay.type.reduce(reduceOntologyType, [])}</ListItem>
        <ListItem name={"Organisms"} value={assay.organisms.map(({ name }) => name).join(", ")} />
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

interface ScreenFCProps {
    screen: Screen;
}

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

interface CompoundFCProps {
    compound: Compound;
}

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
            <ListItem name={"Name"} value={compound.name} />
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

interface SectionProps {
    title: string;
    subtitle?: string;
    help?: string;
}

const Section: React.FC<SectionProps> = React.memo(({ children, title, subtitle, help }) => {
    const [showTooltip, { set: setShowTooltip, toggle: toggleTooltip }] = useBooleanState(false);

    return (
        <div>
            <IDRSectionHeader>
                <Typography variant="h6">
                    {title}
                    {subtitle && ":"}
                </Typography>
                {subtitle && <p>{subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}</p>}
                {help && (
                    <ViewerTooltip
                        title={help}
                        showTooltip={showTooltip}
                        setShowTooltip={setShowTooltip}
                    >
                        <button onClick={toggleTooltip}>?</button>
                    </ViewerTooltip>
                )}
            </IDRSectionHeader>
            <List>{children}</List>
        </div>
    );
});

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
        acc.length != 0 ? [<span key={idx + "-span"}>, </span>] : [],
        <OntologyType key={idx} term={type} />,
    ].flat();
}

const styles = recordOfStyles({
    ul: { listStyleType: "none" },
    help: { marginLeft: 10 },
    bold: { fontWeight: "bold" },
    description: {
        marginTop: 0,
        marginBottom: "1em",
    },
    notFound: { margin: 0 },
    title: {
        fontWeight: "bold",
        marginBottom: 15,
        color: "#123546",
    },
    section: {
        padding: "20px 20px 0 20px",
    },
    platesAccordion: { width: "100%" },
});

const Container = styled.div`
    margin-top: 1.5rem;

    & > div {
        margin-bottom: 1em;
    }

    & .MuiTypography-h6 {
        color: rgb(0, 188, 212);
        line-height: 1 !important;
        margin-right: 0.5rem;
    }
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

const Li = styled.li`
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
`;

const IDRSectionHeader = styled.div`
    display: flex;
    align-items: center;
    p {
        margin: 0;
    }
    margin-bottom: 1em;
`;

const StyledAccordion = styled(Accordion)`
    margin: 16px;

    &.MuiPaper-elevation1 {
        box-shadow: none;
    }

    &.MuiAccordion-root:before {
        content: unset;
    }

    .MuiButtonBase-root.MuiAccordionSummary-root {
        margin: auto;
        padding: 6px 18px 6px 12px;
        color: #ffffff;
        background-color: #123546;
        border-radius: 8px;
        align-items: center;
        display: flex;
        justify-content: center;
        width: fit-content;

        .MuiAccordionSummary-content {
            margin: 0;
            flex-shrink: 0;
        }

        .MuiTypography-body1 {
            font-weight: 700;
            font-family: inherit;
            font-size: 0.9rem;
        }

        .MuiIconButton-root {
            color: #fff;
            padding: 0;
        }
    }

    .MuiAccordionSummary-root {
        min-height: inherit;
    }

    .MuiAccordionSummary-root.Mui-expanded {
        min-height: inherit;
    }

    .MuiAccordionSummary-content.Mui-expanded {
        margin: 0;
    }

    .MuiAccordionDetails-root {
        padding: 0;
    }
`;
