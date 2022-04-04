import React from "react";
import styled from "styled-components";
import { Button, Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@material-ui/icons";
import { StructuresTable } from "../structures-table/StructuresTable";
import { SVGProteome, VisibleGen } from "../proteome/SVGProteome";
import { useBooleanState } from "../../hooks/useBoolean";
import i18n from "../../../utils/i18n";
import { Proteome } from "../proteome/Proteome";

export const Root: React.FC = React.memo(() => {
    const [search, setSearch] = React.useState("");
    const [isProteomeSelected, setProteomeSelected] = React.useState(false);
    const [proteomeExpanded, { toggle: toggleProteome }] = useBooleanState(false);

    return (
        <Body>
            <HeaderBanner>
                <Wrapper>
                    <h1>{i18n.t("SARS-CoV-2 in structure databases")}</h1>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={proteomeExpanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        onClick={toggleProteome}
                    >
                        {proteomeExpanded ? i18n.t("Hide proteome") : i18n.t("View proteome")}
                    </Button>
                </Wrapper>
            </HeaderBanner>
            <Proteome
                expanded={proteomeExpanded}
                setSearch={setSearch}
                setProteomeSelected={setProteomeSelected}
                toggleProteome={toggleProteome}
            />
            <StructuresTable
                search={search}
                setSearch={setSearch}
                highlighted={isProteomeSelected}
                setHighlight={setProteomeSelected}
            />
        </Body>
    );
});

const HeaderBanner = styled.div`
    padding: 0;
    boxshadow: 0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%);
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    background-color: #607d8b;
    color: #fff;
    padding: 16px 20px;
    h1 {
        font-weight: bold;
        margin: 0;
    }
    button {
        margin-left: auto;
    }
`;

const Body = styled.div`
    background-color: #fff;
    font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
        Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
    button:focus {
        outline: none;
    }
`;
