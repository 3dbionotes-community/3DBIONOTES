import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Covid19Info, Structure } from "../../../domain/entities/Covid19Info";
import { OnClickIDR } from "./badge/BadgeLigands";
import { Field } from "./Columns";
import { PdbCell } from "./cells/PdbCell";
import { EmdbCell } from "./cells/EmdbCell";
import { EntityCell } from "./cells/EntityCell";
import { LigandsCell } from "./cells/LigandsCell";
import { OrganismCell } from "./cells/OrganismCell";
import { DetailsCell } from "./cells/DetailsCell";
import { Dialog } from "./Dialog";
import i18n from "../../../utils/i18n";

export interface DetailsDialogProps {
    onClose(): void;
    open: boolean;
    expandedAccordion: Field | undefined;
    row: Structure;
    data: Covid19Info;
    onClickIDR: OnClickIDR;
}

export const DetailsDialog: React.FC<DetailsDialogProps> = React.memo(props => {
    const { onClose, expandedAccordion, row, data, open, onClickIDR } = props;

    return (
        <Dialog open={open} onClose={onClose} title={row.title}>
            <Container>
                <ImgContainer>
                    <PdbCell data={data} row={row} validationSources={data.validationSources} />
                    <EmdbCell data={data} row={row} />
                </ImgContainer>

                <div>
                    <ModifiedAccordion expanded={expandedAccordion} field="entities" row={row}>
                        <EntityCell data={data} row={row} moreDetails={false} />
                    </ModifiedAccordion>
                    <ModifiedAccordion expanded={expandedAccordion} field="ligands" row={row}>
                        <LigandsCell
                            data={data}
                            row={row}
                            moreDetails={false}
                            onClickIDR={onClickIDR}
                        />
                    </ModifiedAccordion>
                    <ModifiedAccordion expanded={expandedAccordion} field="organisms" row={row}>
                        <OrganismCell row={row} data={data} moreDetails={false} />
                    </ModifiedAccordion>
                    <ModifiedAccordion expanded={expandedAccordion} field="details" row={row}>
                        <DetailsCell row={row} data={data} moreDetails={false} />
                    </ModifiedAccordion>
                </div>
            </Container>
        </Dialog>
    );
});

const ModifiedAccordion: React.FC<ModifiedAccordionProps> = React.memo(props => {
    const { field, expanded, row } = props;
    const content = _(row).at(field).value();

    return (
        <Accordion defaultExpanded={expanded === field}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${field}-content`}
                id={`${field}-header`}
            >
                <Typography>{i18n.t(field.charAt(0).toUpperCase() + field.slice(1))}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {(field === "details" && content) ||
                (field !== "details" && !_.isEmpty(content)) ? (
                    props.children
                ) : (
                    <NoCellsFound name={field} />
                )}
            </AccordionDetails>
        </Accordion>
    );
});

const NoCellsFound: React.FC<NoCellsFoundProps> = React.memo(({ name }) => (
    <Typography variant="caption">{i18n.t("No {{name}} found", { name })}</Typography>
));

interface ModifiedAccordionProps {
    field: Field;
    row: Structure;
    expanded: Field | undefined;
}

interface NoCellsFoundProps {
    name: string;
}

const Container = styled.div`
    display: flex;
    & > div: {
        flex-grow: 1;
    }
`;

const ImgContainer = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    margin-right: 20px;
    img {
        max-height: 200px !important;
        max-width: 200px !important;
    }
`;
