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
import { DetailsCell } from "./cells/DetailsCell";

export interface ViewMoreDialogProps {
    onClose(): void;
    expandedAccordion: Field | undefined;
    row: Structure;
    data: Covid19Info;
}

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
                        <ModifiedAccordion expandedAccordion={expandedAccordion} field="entities">
                            <EntityCell data={data} row={row} moreDetails={false}></EntityCell>
                        </ModifiedAccordion>

                        <ModifiedAccordion expandedAccordion={expandedAccordion} field="ligands">
                            <LigandsCell data={data} row={row} moreDetails={false}></LigandsCell>
                        </ModifiedAccordion>

                        <ModifiedAccordion expandedAccordion={expandedAccordion} field="organisms">
                            <OrganismCell row={row} data={data} moreDetails={false}></OrganismCell>
                        </ModifiedAccordion>

                        <ModifiedAccordion expandedAccordion={expandedAccordion} field="details">
                            <DetailsCell row={row} data={data} moreDetails={false}></DetailsCell>
                        </ModifiedAccordion>
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

interface ModifiedAccordionProps {
    field: Field;
    expandedAccordion: Field | undefined;
}

const ModifiedAccordion: React.FC<ModifiedAccordionProps> = React.memo(props => {
    const { field, expandedAccordion } = props;

    return (
        <Accordion defaultExpanded={expandedAccordion === field}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${field}-content`}
                id={`${field}-header`}
            >
                <Typography>{i18n.t(field.charAt(0).toUpperCase() + field.slice(1))}</Typography>
            </AccordionSummary>
            <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
    );
});
