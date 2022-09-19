import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Typography } from "@material-ui/core";
import { Dialog } from "./Dialog";
import { ListItemProps } from "./cells/DetailsCell";
import { Pagination } from "@material-ui/lab";
import { Ligand } from "../../../domain/entities/Covid19Info";
import i18n from "../../../utils/i18n";

export interface IDRDialogProps {
    onClose(): void;
    idrOptions?: { ligand: Ligand };
    open: boolean;
}

export const IDRDialog: React.FC<IDRDialogProps> = React.memo(props => {
    const { onClose, open } = props;

    return (
        <StyledDialog open={open} onClose={onClose} title={i18n.t("Ligand IDR")} maxWidth={"sm"}>
            <Wrapper>
                <Container>
                    <Section title={i18n.t("Assay")}>
                        <ListItem name={"ID"} value={"idr0094"} />
                        <ListItem
                            name={"Type"}
                            value={
                                "high content screen of cells treated with a compound library; infection"
                            }
                        />
                        <ListItem name={"Type Term Accession"} value={"EFO_0007553; EFO_0000544"} />
                        <ListItem name={"Source"} value={"the Image Data Resource (IDR)"} />
                        <ListItem
                            name={"Publication Title"}
                            value={
                                '"A SARS-CoV-2 cytopathicity dataset generated by high-content screening of a large drug repurposing collection"'
                            }
                        />
                        <ListItem name={"Data DOI"} value={"10.17867/10000148"} />
                    </Section>
                    <Section title={i18n.t("Screens")}>
                        <div>
                            <ListItem name={"ID"} value={"2602"} />
                            <ListItem name={"Type"} value={"primary assay"} />
                            <ListItem name={"Type Term Accession"} value={"BAO_0000031"} />
                            <ListItem
                                name={"Imaging Method"}
                                value={
                                    "spinning disk confocal microscopy; phase contrast microscopy"
                                }
                            />
                            <ListItem
                                name={"Imaging Method Term Accession"}
                                value={"FBbi_00000253; FBbi_00000247"}
                            />
                            <ListItem name={"Data DOI"}>
                                <span>
                                    <a href="https://doi.org/10.17867/10000148a">
                                        https://doi.org/10.17867/10000148a
                                    </a>
                                </span>
                            </ListItem>
                        </div>
                        <div>
                            <ListItem name={"ID"} value={"2603"} />
                            <ListItem name={"Type"} value={"multiple concentration"} />
                            <ListItem name={"Type Term Accession"} value={"BAO_0000535"} />
                            <ListItem name={"Imaging Method"} value={"phase contrast microscopy"} />
                            <ListItem
                                name={"Imaging Method Term Accession"}
                                value={"FBbi_00000247"}
                            />
                            <ListItem name={"Data DOI"}>
                                <span>
                                    <a href="https://doi.org/10.17867/10000148b">
                                        https://doi.org/10.17867/10000148b
                                    </a>
                                </span>
                            </ListItem>
                        </div>
                    </Section>
                    <Section title={i18n.t("Compound")}>
                        <ListItem name={"Inhibition of cytopathicity"} value={"91.35%"} />
                        <ListItem name={"Cytotoxicity (CC50)"} value={"28330 nM"} />
                        <ListItem name={"Dose-response (IC50)"} value={"15130 nM"} />
                        <ListItem
                            name={"Cytotoxic Index (Selectivity Index, IC50/CC50)"}
                            value={"2"}
                        />
                    </Section>
                </Container>
                <div>
                    <Pagination count={3} shape="rounded" />
                </div>
            </Wrapper>
        </StyledDialog>
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

interface SectionProps {
    title: string;
}

const Section: React.FC<SectionProps> = React.memo(({ children, title }) => (
    <div>
        <Typography variant="h6" gutterBottom>
            {title}
        </Typography>
        <List>{children}</List>
    </div>
));

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