import React from "react";
import styled from "styled-components";
import { Button, Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@material-ui/icons";
import { StructuresTable } from "../structures-table/StructuresTable";
import { SVGProteoma } from "../SVGProteoma";
import { useBooleanState } from "../../hooks/useBoolean";
import i18n from "../../../utils/i18n";

export const Root: React.FC = React.memo(() => {
    const [search, setSearch] = React.useState("");
    const [isProteomaSelected, setProteomaSelected] = React.useState(false);
    const [title, setTitle] = React.useState<React.ReactNode>(<></>);
    const [isAccordionExpanded, { toggle: toggleAccordion }] = useBooleanState(false);
    const [visible, setVisible] = React.useState<{ orf1a?: boolean; orf1b?: boolean }>({
        orf1a: false,
        orf1b: false,
    });

    return (
        <Body>
            <HeaderBanner>
                <Wrapper>
                    <h1>{i18n.t("SARS-CoV-2 in structure databases")}</h1>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={isAccordionExpanded ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        onClick={() => {
                            toggleAccordion();
                            setVisible({});
                            setTitle(
                                <span>
                                    {i18n.t("SARS-CoV-2")}
                                    <br />
                                    {i18n.t("Proteome")}
                                </span>
                            );
                        }}
                    >
                        {isAccordionExpanded ? i18n.t("Hide proteome") : i18n.t("View proteome")}
                    </Button>
                </Wrapper>
            </HeaderBanner>
            <StyledAccordion expanded={isAccordionExpanded}>
                <AccordionSummary></AccordionSummary>
                <AccordionDetails>
                    <SVGProteoma
                        title={title}
                        setTitle={setTitle}
                        visible={visible}
                        setVisible={setVisible}
                        setSearch={setSearch}
                        setProteomaSelected={setProteomaSelected}
                    />
                </AccordionDetails>
            </StyledAccordion>
            <StructuresTable
                search={search}
                setSearch={setSearch}
                isProteomaSelected={isProteomaSelected}
                setProteomaSelected={setProteomaSelected}
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
        min-width: 700px;
        svg {
            width: 650px;
        }
    }
`;
