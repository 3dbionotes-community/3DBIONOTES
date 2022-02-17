import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
} from "@material-ui/core";
import _ from "lodash";
import { Close, ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Covid19Info, Structure } from "../../../domain/entities/Covid19Info";
import { Field } from "./Columns";
import i18n from "../../../utils/i18n";
import styled from "styled-components";
import { PdbCell } from "./cells/PdbCell";
import { EmdbCell } from "./cells/EmdbCell";
import { EntityCell } from "./cells/EntityCell";
import { LigandsCell } from "./cells/LigandsCell";
import { OrganismCell } from "./cells/OrganismCell";

export const ViewMoreDialog: React.FC<ViewMoreDialogProps> = React.memo(props => {
    const { onClose, expandedAccordion, row, data } = props;

    return (
        <StyledDialog open={true} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Title title={row.title}>{row.title}</Title>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Container>
                    <div style={{ marginRight: "10px" }}>
                        <PdbCell data={data} row={row} />
                        <EmdbCell data={data} row={row} />
                    </div>
                    <div>
                        <Accordion defaultExpanded={expandedAccordion === "entities"}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="entities-content"
                                id="entities-header"
                            >
                                <Typography>{i18n.t("Entities")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <EntityCell data={data} row={row}></EntityCell>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion defaultExpanded={expandedAccordion === "ligands"}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="ligands-content"
                                id="ligands-header"
                            >
                                <Typography>{i18n.t("Ligands")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <LigandsCell
                                    data={data}
                                    row={row}
                                    moreDetails={false}
                                ></LigandsCell>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion defaultExpanded={expandedAccordion === "organisms"}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="organisms-content"
                                id="organisms-header"
                            >
                                <Typography>{i18n.t("Organisms")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <OrganismCell row={row} data={data}></OrganismCell>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion defaultExpanded={expandedAccordion === "details"}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="details-content"
                                id="details-header"
                            >
                                <Typography>{i18n.t("Details")}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{row.details}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </Container>
            </DialogContent>
        </StyledDialog>
    );
});

const StyledDialog = styled(Dialog)`
    .MuiDialogTitle-root {
        background: #607d8b;
        color: #fff;
        padding: 8px 24px;
        font-weight: 700;
    }

    .MuiDialogTitle-root .MuiIconButton-root {
        color: #fff;
    }

    .MuiTypography-h6 {
        line-height: 2.3 !important;
        display: flex;
    }

    .MuiDialogContent-root {
        padding: 24px 24px !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
    }

    img {
        max-height: unset !important;
        max-width: unset !important;
    }
`;

const Container = styled.div`
    display: flex;
    & > div:nth-child(2) {
        flex-grow: 1;
    }
`;

const Title = styled.span`
    display: inline-block;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export interface ViewMoreDialogProps {
    onClose(): void;
    expandedAccordion: Field | undefined;
    row: Structure;
    data: Covid19Info;
}
