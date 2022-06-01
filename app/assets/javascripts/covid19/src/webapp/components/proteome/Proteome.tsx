import React from "react";
import styled from "styled-components";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import { SVGProteome } from "./SVGProteome";

interface ProteomeProps {
    expanded: boolean;
    setSearch: (value: string) => void;
    setProteomeSelected: (value: boolean) => void;
    toggleProteome: () => void;
}

export const Proteome: React.FC<ProteomeProps> = React.memo(props => {
    const { expanded, setSearch, setProteomeSelected, toggleProteome } = props;
    return (
        <StyledAccordion expanded={expanded}>
            <AccordionSummary></AccordionSummary>
            <AccordionDetails>
                <SVGProteome
                    setSearch={setSearch}
                    setProteomeSelected={setProteomeSelected}
                    toggleProteome={toggleProteome}
                />
            </AccordionDetails>
        </StyledAccordion>
    );
});

const StyledAccordion = styled(Accordion)`
    &.MuiAccordion-root.Mui-expanded {
        margin: 0;
    }

    .MuiAccordionSummary-root {
        display: none;
    }

    .MuiAccordionDetails-root {
        display: flex;
        padding: 0;
        justify-content: center;
        align-items: center;
        svg {
            width: 500px;
        }
    }
`;
