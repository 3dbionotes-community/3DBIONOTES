import React from "react";
import styled from "styled-components";
import i18n from "../../../utils/i18n";
import { Orf1aProts, Orf1bProts, RemainingGens } from "./PathGroups";
import { ProteomePath } from "./ProteomePath";

export interface VisibleGen {
    orf1a?: boolean;
    orf1b?: boolean;
}

interface SVGProteomeProps {
    search: string;
    setSearch: (value: string) => void;
    visible: VisibleGen;
    setVisible: (visible: VisibleGen) => void;
    title: React.ReactNode;
    setTitle: (value: React.ReactNode) => void;
    setProteomeSelected: (value: boolean) => void;
}

export const SVGProteome: React.FC<SVGProteomeProps> = React.memo(props => {
    const { search, setSearch, visible, setVisible, title, setTitle, setProteomeSelected } = props;
    const [loading, setLoading] = React.useState(false);

    const stateSetters = React.useMemo(
        () => ({
            setSearch,
            setTitle,
            setProteomeSelected,
            setLoading,
        }),
        [setSearch, setTitle, setProteomeSelected]
    );

    const restoreVisible = React.useCallback(() => setVisible({}), [setVisible]);
    const onMouseLeave = React.useCallback(() => {
        setTitle(
            <span>
                {i18n.t("SARS-CoV-2")}
                <br />
                {i18n.t("Proteome")}
            </span>
        );
        restoreVisible();
    }, [setTitle, restoreVisible]);
    const onClickOrf1a = React.useCallback(() => {
        setVisible({ orf1a: true, orf1b: false });
    }, [setVisible]);
    const onClickOrf1b = React.useCallback(() => {
        setVisible({ orf1a: false, orf1b: true });
    }, [setVisible]);

    return (
        <Container>
            {/*Using relative -> absolute for having svg above title. So the title can be easily put in center*/}
            <Layer>{title}</Layer>
            <Layer>
                <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                    <g onMouseLeave={onMouseLeave}>
                        <rect className="none" width="1000" height="1000" />
                        <g onMouseEnter={onClickOrf1a}>
                            <ProteomePath
                                stateSetters={stateSetters}
                                name="ORF1a"
                                classStyle="orf1a"
                                def="M754,500a256.17,256.17,0,0,1-2.84,39.79A243.33,243.33,0,0,1,739,585.89l-45-16.4a204.32,204.32,0,0,0,9.52-37.28A208.29,208.29,0,0,0,706,500c0-2.5,0-4.92-.13-7.21A205.82,205.82,0,0,0,501,294V246a255.53,255.53,0,0,1,47.43,4.61,252.48,252.48,0,0,1,89.88,36.32A253.31,253.31,0,0,1,753.84,491.11C754,493.94,754,496.92,754,500Z"
                            />
                            {visible.orf1a &&
                                Orf1aProts.map((prot, idx) => (
                                    <ProteomePath
                                        key={idx}
                                        stateSetters={stateSetters}
                                        classStyle="orf1a"
                                        name={prot.name}
                                        def={prot.def}
                                    />
                                ))}
                        </g>
                        <g onMouseEnter={onClickOrf1b}>
                            <ProteomePath
                                stateSetters={stateSetters}
                                name="ORF1b"
                                classStyle="orf1b"
                                def="M738.33,587.77A254.31,254.31,0,0,1,500,754c-5.9,0-11.87-.21-17.76-.63a254,254,0,0,1-69.11-14.76c-2.89-1.05-5.68-2.12-8.31-3.18a248,248,0,0,1-70.7-43.14l31.45-36.17a205.07,205.07,0,0,0,120,49.38c4.78.33,9.62.5,14.39.5A206.18,206.18,0,0,0,693.3,571.37Z"
                            />
                            {visible.orf1b &&
                                Orf1bProts.map((prot, idx) => (
                                    <ProteomePath
                                        key={idx}
                                        stateSetters={stateSetters}
                                        classStyle="orf1b"
                                        name={prot.name}
                                        def={prot.def}
                                    />
                                ))}
                        </g>
                        <g onMouseEnter={restoreVisible}>
                            {RemainingGens.map((prot, idx) => (
                                <ProteomePath
                                    key={idx}
                                    stateSetters={stateSetters}
                                    classStyle={prot.classStyle}
                                    name={prot.name}
                                    def={prot.def}
                                />
                            ))}
                        </g>
                    </g>
                </SVG>
            </Layer>
            <span>
                {loading &&
                    i18n.t("Searching for {{search}} in databases...", {
                        nsSeparator: false,
                        search: search,
                    })}
            </span>
        </Container>
    );
});

const Container = styled.div`
    position: relative;
    display: flex;
    justify-content: right;
    padding: 32px 64px;
    box-sizing: border-box;
    align-items: end;
    width: 100vw;
    height: 650px;
    *::selection {
        background: none;
        color: inherit;
    }
    & > span {
        font-weight: bold;
        font-size: 1.125em;
    }
`;

const Layer = styled.div`
    position: absolute;
    top: 0;
    left: calc(50% - 325px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 650px;
    height: 650px;
    font-size: 24px;
    font-family: Lato-Semibold, Lato;
    font-weight: 600;
    text-align: center;
    span {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2em;
    }
`;

const SVG = styled.svg`
    z-index: 1;
    path {
        cursor: pointer;
    }
    .none {
        fill: none;
        pointer-events: all;
    }
    .orf1b {
        fill: #5f666a;
        &:hover {
            fill: #6f767a;
        }
        &:active {
            fill: #7f868a;
        }
    }
    .orf1a {
        fill: #2f3335;
        &:hover {
            fill: #4f5355;
        }
        &:active {
            fill: #5f6365;
        }
    }
    .blue {
        fill: #3fa9f5;
        &:hover {
            fill: #4fb9f5;
        }
        &:active {
            fill: #5fc9ff;
        }
    }
    .pink {
        fill: #ff7bac;
        &:hover {
            fill: #ff8bbc;
        }
        &:active {
            fill: #ff9bcc;
        }
    }
    .red {
        fill: #ff1d25;
        &:hover {
            fill: #ff3d55;
        }
        &:active {
            fill: #ff5d75;
        }
    }
    .orange {
        fill: #ff931e;
        &:hover {
            fill: #ffa33e;
        }
        &:active {
            fill: #ffb34e;
        }
    }
    .gray {
        fill: #8e999f;
        &:hover {
            fill: #aeb9bf;
        }
        &:active {
            fill: #bec9cf;
        }
    }
    .green {
        fill: #7ac943;
        &:hover {
            fill: #8ad953;
        }
        &:active {
            fill: #9ae963;
        }
    }
`;
