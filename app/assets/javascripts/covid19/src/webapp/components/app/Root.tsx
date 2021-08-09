import React from "react";
import styled from "styled-components";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { StructuresTable } from "../structures-table/StructuresTable";

interface RootProps {}

export const Root: React.FC<RootProps> = () => {
    const { compositionRoot } = useAppContext();
    const data = compositionRoot.getCovid19Info.execute();
    window.app = { data };

    return (
        <Body>
            <HeaderBanner>
                <Wrapper>
                    <h1>
                        <b>{i18n.t("Known Proteins")}</b>
                    </h1>
                </Wrapper>
            </HeaderBanner>

            <StructuresTable data={data} />
        </Body>
    );
};

const HeaderBanner = styled.div`
    padding: 0;
    boxshadow: 0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%);
`;

const Wrapper = styled.div`
    background-color: #607d8b;
    color: #fff;
    padding: 10px;
`;

const Body = styled.div`
    background-color: #fff;
    font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
        Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
`;
