import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Covid19Info, Structure } from "../../../domain/entities/Covid19Info";
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
}

export const DetailsDialog: React.FC<DetailsDialogProps> = React.memo(props => {
    const { onClose, expandedAccordion, row, data, open } = props;

    return (
        <Dialog open={open} onClose={onClose} title={row.title}>
            <Container>
                <ImgContainer>
                    <PdbCell data={data} row={row} validationSources={data.validationSources} />
                    <EmdbCell data={data} row={row} />
                </ImgContainer>

                <div>
                    <ModifiedAccordion expandedAccordion={expandedAccordion} field="entities">
                        {row.entities.length > 0 ? (
                            <EntityCell data={data} row={row} moreDetails={false}></EntityCell>
                        ) : (
                            <NoCellsFound name="entities" />
                        )}
                    </ModifiedAccordion>

                    <ModifiedAccordion expandedAccordion={expandedAccordion} field="ligands">
                        {row.ligands.length > 0 ? (
                            <LigandsCell data={data} row={row} moreDetails={false}></LigandsCell>
                        ) : (
                            <NoCellsFound name="ligands" />
                        )}
                    </ModifiedAccordion>

                    <ModifiedAccordion expandedAccordion={expandedAccordion} field="organisms">
                        {row.organisms.length > 0 ? (
                            <OrganismCell row={row} data={data} moreDetails={false}></OrganismCell>
                        ) : (
                            <NoCellsFound name="organisms" />
                        )}
                    </ModifiedAccordion>

                    <ModifiedAccordion expandedAccordion={expandedAccordion} field="details">
                        {row.details ? (
                            <DetailsCell row={row} data={data} moreDetails={false}></DetailsCell>
                        ) : (
                            <NoCellsFound name="details" />
                        )}
                    </ModifiedAccordion>
                </div>
            </Container>
        </Dialog>
    );
});

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

const NoCellsFound: React.FC<NoCellsFoundProps> = React.memo(({ name }) => (
    <Typography variant="caption">{i18n.t("No {{name}} found", { name })}</Typography>
));

interface ModifiedAccordionProps {
    field: Field;
    expandedAccordion: Field | undefined;
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
    margin-right: 20px;
    img {
        max-height: 200px !important;
        max-width: 200px !important;
    }
`;
