import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Pdb } from "../../../domain/entities/Pdb";
import { recordOfStyles } from "../../../utils/ts-utils";
import { Assay, Compound, Plate, Screen } from "../../../domain/entities/LigandImageData";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@material-ui/core";
import { ViewerTooltip } from "../viewer-tooltip/ViewerTooltip";
import { useBooleanState } from "../../hooks/use-boolean";
import { SVGPlate } from "./SVGPlate";
import i18n from "../../utils/i18n";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";

interface BasicInfoProps {
    pdb: Pdb;
}

export const IDRViewerBlock: React.FC<BasicInfoProps> = React.memo(({ pdb }) => {
    const [showTooltip, { set: setShowTooltip, toggle: toggleTooltip }] = useBooleanState(false);
    const idrs = React.useMemo(
        () => _.compact(pdb.ligands?.map(ligand => ligand.imageDataResource)),
        [pdb]
    );

    return (
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
            <p className="contents">{i18n.t("Text to be determined.")}</p>
            {
                //                     This is an assay based on high content screen of cells treated with a compound library and infection in which a well-defined collection of compounds is tested against SARS-CoV-2.
                //
                // The compound <ligand[name]> inhibited cytopathicity by <ligand['imageData']['assays'][‘screens’][‘dbId’ == ‘2602’][‘plates’][‘wells’][‘percentageInhibition’]> % at <ligand['imageData']['assays']['screens'][‘dbId’ == ‘2602’]['plates']['wells']['micromolarConcentration']> µM, which <if ligand['imageData']['assays']['screens']['plates']['well']['hitOver75Activity'] == ‘yes': is>/<else: is not> considered as a hit (efficiency in blocking viral cytopathicity) in the context of this assay.
                //
                // <if ligand['imageData']['assays'][‘screens’][‘type’ == 'multiple concentration]’: Concentration-response profiling of hit compound <ligand[name]> was performed in triplicate with eight concentrations ranging from 20 µM to 20 nM and on three different plates to minimise the influence of plate effects.>
                //
                // <if ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘ic50’]: The half maximal inhibitory concentration (IC50) for <ligand[name]> is <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘ic50’][value]> <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘ic50’][units]>. >.
                //
                // <if ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘cc50’]: The cytotoxic concentration (CC50) for <ligand[name]> is <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘cc50’][value]> <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘cc50’][units]>. >
                //
                // <if ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘selectivity index’]: The the ratio between the cytopathic effect and cytotoxicity, also known as the selectivity index (IC50/CC50), for <ligand[name]> is  <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘Selectivity index’][value]> <ligand['imageData']['assays']['additionalAnalyses'][‘name’ == ‘Selectivity index’][units]>. ></div>
            }
            {idrs?.map((idr, i) => (
                <Container key={i}>
                    {idr.assays.map((assay, idx) => {
                        return (
                            <React.Fragment key={idx}>
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
            {_.isEmpty(idrs) && <p>{i18n.t("No IDRs found.")}</p>}
        </div>
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
                            {plates.map((plate, idx) => (
                                <SVGPlate plate={plate} key={idx + 1} idx={idx + 1} />
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
        <ListItem name={"Type"} value={assay.type} />
        <ListItem name={"Type Term Accession"} value={assay.typeTermAccession} />
        <ListItem name={"Organisms"} value={assay.organisms.map(({ name }) => name).join(", ")} />
        <ListItem
            name={"Publication Title"}
            value={assay.publications.map(({ title }) => title).join(", ")}
        />
        <ListItem name={"Data DOI"} value={assay.dataDoi} />
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
        <ListItem name={"Type"} value={screen.type} />
        <ListItem name={"Type Term Accession"} value={screen.typeTermAccession} />
        <ListItem name={"Technology Type"} value={screen.technologyType} />
        <ListItem
            name={"Technology Type Term Accession"}
            value={screen.technologyTypeTermAccession}
        />
        <ListItem name={"Imaging Method"} value={screen.imagingMethod} />
        <ListItem
            name={"Imaging Method Term Accession"}
            value={screen.imagingMethodTermAccession}
        />
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

const CompoundFC: React.FC<CompoundFCProps> = React.memo(({ compound }) => (
    <>
        <ListItem name={"Name"} value={compound.name} />
        <ListItem name={"Inhibition of cytopathicity"} value={compound.percentageInhibition} />
        <ListItem name={"Cytotoxicity (CC50)"} value={compound.cytotoxicity} />
        <ListItem name={"Dose-response (IC50)"} value={compound.doseResponse} />
        <ListItem
            name={"Cytotoxic Index (Selectivity Index, IC50/CC50)"}
            value={compound.cytotoxicIndex}
        />
    </>
));

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

const styles = recordOfStyles({
    ul: { listStyleType: "none" },
    help: { marginLeft: 10 },
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
    margin-top: 2rem;

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
    span {
        color: ;
    }
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
