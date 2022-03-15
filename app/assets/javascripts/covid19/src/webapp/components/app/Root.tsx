import React from "react";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import VisibilityIcon from "@material-ui/icons/Visibility";

import i18n from "../../../utils/i18n";
import { StructuresTable } from "../structures-table/StructuresTable";
import { Dialog } from "../Dialog";
import { SVGProteoma } from "../SVGProteoma";
import { useBooleanState } from "../../hooks/useBoolean";

export const Root: React.FC = React.memo(() => {
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    return (
        <Body>
            <HeaderBanner>
                <Wrapper>
                    <h1>{i18n.t("SARS-CoV-2 in structure databases")}</h1>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<VisibilityIcon />}
                        onClick={openDialog}
                    >
                        {i18n.t("View proteome")}
                    </Button>
                </Wrapper>
            </HeaderBanner>

            <StructuresTable />

            {isDialogOpen && (
                <Dialog title={i18n.t("SARS-CoV-2 virus proteome")} onClose={closeDialog}>
                    <DialogContent>
                        <SVGProteoma></SVGProteoma>
                    </DialogContent>
                </Dialog>
            )}
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

const DialogContent = styled.div`
    display: flex;
    padding: 36px;
    justify-content: center;
    align-items: center;
    min-width: 700px;
    svg {
        width: 500px;
    }
`;
