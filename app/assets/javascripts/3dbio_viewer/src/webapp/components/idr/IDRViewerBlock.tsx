import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Pdb } from "../../../domain/entities/Pdb";
import { recordOfStyles } from "../../../utils/ts-utils";
import { Assay, Compound, Screen } from "../../../domain/entities/LigandImageData";
import { Typography } from "@material-ui/core";
import { ViewerTooltip } from "../viewer-tooltip/ViewerTooltip";
import { useBooleanState } from "../../hooks/use-boolean";
import { SVGPlate } from "./SVGPlate";
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

    return (
        <div style={styles.section}>
            <div style={styles.title}>
                {i18n.t("High-Content Screening (HCS) Assays")}
                <ViewerTooltip
                    title={i18n.t("Text to be determined.")}
                    showTooltip={showTooltip}
                    setShowTooltip={setShowTooltip}
                >
                    <button onClick={toggleTooltip}>?</button>
                </ViewerTooltip>
            </div>
            <p className="contents">{i18n.t("Text to be determined.")}</p>
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
                                    <AssayFC assay={assay} dataSource={idr.dataSource} />
                                </Section>

                                {assay.screens.map((screen, idx) => (
                                    <Section
                                        key={idx}
                                        title={i18n.t("Screen")}
                                        subtitle={screen.name}
                                        help={screen.description}
                                    >
                                        <ScreenFC screen={screen} />
                                        {screen.plates.map((plate, idx) => (
                                            <SVGPlate plate={plate} key={idx} idx={idx} />
                                        ))}
                                    </Section>
                                ))}

                                <Section title={i18n.t("Compound")}>
                                    <CompoundFC compound={assay.compound} />
                                </Section>
                            </React.Fragment>
                        );
                    })}
                </Container>
            ))}
            {_.isEmpty(idrs) && <p>{i18n.t("No IDRs found.")}</p>}
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
    dataSource: string;
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
        <ListItem name={"Source"} value={dataSource} />
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
            <SectionHeader>
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
            </SectionHeader>
            <List>{children}</List>
        </div>
    );
});

const Container = styled.div`
    margin-top: 2rem;

    & div {
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

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    p {
        margin: 0;
    }
`;
