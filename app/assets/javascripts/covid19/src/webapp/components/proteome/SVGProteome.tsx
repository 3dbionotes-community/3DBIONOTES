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
    toggleProteome: () => void;
}

export const SVGProteome: React.FC<SVGProteomeProps> = React.memo(props => {
    const {
        search,
        setSearch,
        visible,
        setVisible,
        title,
        setTitle,
        setProteomeSelected,
        toggleProteome,
    } = props;
    const [loading, setLoading] = React.useState(false);

    const stateSetters = React.useMemo(
        () => ({
            setSearch,
            setTitle,
            setProteomeSelected,
            setLoading,
            toggleProteome,
        }),
        [setSearch, setTitle, setProteomeSelected, toggleProteome]
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
    const setOrf1aVisible = React.useCallback(() => {
        setVisible({ orf1a: true, orf1b: false });
    }, [setVisible]);
    const setOrf1bVisible = React.useCallback(() => {
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
                        <g onMouseEnter={setOrf1aVisible}>
                            <ProteomePath
                                stateSetters={stateSetters}
                                name="ORF1a"
                                classStyle="orf1a"
                                def="M408.31,151.89l24.58,88.52-.18.05a276.34,276.34,0,0,0-86.93,41.71A278.93,278.93,0,0,0,275.68,355,276.14,276.14,0,0,0,230.4,491.15q-.5,8.22-.49,16.56a279.07,279.07,0,0,0,1.8,31.7A276.12,276.12,0,0,0,259,631.6a277.46,277.46,0,0,0,25.27,41.12.7.7,0,0,0,.13.17L210.05,728a2.09,2.09,0,0,0-.14-.17,372.72,372.72,0,0,1-33.68-54.86,369.2,369.2,0,0,1,62.6-419.16A370.36,370.36,0,0,1,287.2,211c1.7-1.26,3.41-2.5,5.11-3.71a361.87,361.87,0,0,1,55.41-32.89,369.15,369.15,0,0,1,60.41-22.47Z"
                            />
                            {visible.orf1a &&
                                Orf1aProts.map((prot, idx) => (
                                    <ProteomePath
                                        key={idx}
                                        stateSetters={stateSetters}
                                        classStyle="orf1a"
                                        name={prot.name ?? ""}
                                        def={prot.def}
                                    />
                                ))}
                        </g>
                        <g onMouseEnter={setOrf1bVisible}>
                            <ProteomePath
                                stateSetters={stateSetters}
                                name="ORF1b"
                                classStyle="orf1b"
                                def="M819.07,706.39c-1.13,1.8-2.3,3.6-3.49,5.38A369.58,369.58,0,0,1,313.86,823c-3.58-2.2-7.12-4.45-10.64-6.78-38.84-25.66-65.47-50.89-93.17-88.29l74.39-55.07a279,279,0,0,0,77.73,71.27,277,277,0,0,0,145.14,41,279.17,279.17,0,0,0,59.74-6.45,275.75,275.75,0,0,0,97.19-42.19,279,279,0,0,0,74.36-75.58q1.33-2,2.63-4Z"
                            />
                            {visible.orf1b &&
                                Orf1bProts.map((prot, idx) => (
                                    <ProteomePath
                                        key={idx}
                                        stateSetters={stateSetters}
                                        classStyle="orf1b"
                                        name={prot.name ?? ""}
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
                                    name={prot.name ?? ""}
                                    def={prot.def}
                                />
                            ))}
                        </g>
                    </g>
                    <text x="442" y="200">
                        5&rsquo;
                    </text>
                    <text x="542" y="200">
                        3&rsquo;
                    </text>
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
    margin: 16px 0;
    padding: 32px 64px;
    box-sizing: border-box;
    align-items: end;
    width: 100vw;
    height: 500px;
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
    left: calc(50% - 250px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 500px;
    height: 500px;
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
    text {
        font-size: 42px;
    }
    .none {
        fill: none;
        pointer-events: all;
    }
    .orf1a {
        fill: #2c79a8;
        &:hover {
            fill: #3c89b8;
        }
        &:active {
            fill: #4c99c8;
        }
    }
    .orf1b {
        fill: #3692cc;
        &:hover {
            fill: #46a2dc;
        }
        &:active {
            fill: #56b2ec;
        }
    }
    .blue {
        fill: #3fa9f5;
        &:hover {
            fill: #4fb9ff;
        }
        &:active {
            fill: #5fc9ff;
        }
    }
    .pink {
        fill: #d93387;
        &:hover {
            fill: #e94397;
        }
        &:active {
            fill: #f953a7;
        }
    }
    .red {
        fill: #ff4322;
        &:hover {
            fill: #ff6342;
        }
        &:active {
            fill: #ff7352;
        }
    }
    .orange {
        fill: #f9c321;
        &:hover {
            fill: #f9d331;
        }
        &:active {
            fill: #f9e341;
        }
    }
    .gray {
        fill: #929292;
        &:hover {
            fill: #a2a2a2;
        }
        &:active {
            fill: #b2b2b2;
        }
    }
    .green {
        fill: #60d836;
        &:hover {
            fill: #70e846;
        }
        &:active {
            fill: #80f856;
        }
    }
`;
