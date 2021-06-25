import React from "react";
import _ from "lodash";
import styled from "styled-components";
import testCovid19Data from "../../../data/covid19.json";
import { Covid19Data } from "../../../domain/entities/Covid19Data";
import i18n from "../../../utils/i18n";
import { Protein } from "../protein/Protein";

interface AppProps {
    data?: Covid19Data;
}

export const App: React.FC<AppProps> = props => {
    const data: Covid19Data = props.data || testCovid19Data;
    const proteins = data.proteins;
    // const proteins = data.proteins.filter(p => p.name === "NSP15");
    // const proteins = data.proteins.slice(0, 2);

    return (
        <Body>
            <HeaderBanner>
                <div style={{ backgroundColor: "#607d8b", color: "#fff", padding: 10 }}>
                    <h1>
                        <b>{i18n.t("Known Proteins")}</b>
                    </h1>
                </div>
            </HeaderBanner>

            {proteins.map(protein => (
                <Protein key={protein.name} protein={protein} />
            ))}
        </Body>
    );
};

const HeaderBanner = styled.div`
    padding: 0;
    boxshadow: 0 0px 10px rgb(0 0 0 / 3%), 0 0px 23px rgb(0 0 0 / 4%);
`;

const Body = styled.div`
    background-color: #fff;
    font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
        Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
`;
