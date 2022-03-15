import React from "react";
import styled from "styled-components";
import _ from "lodash";
import i18n from "../../utils/i18n";

interface SVGProteomaProps {
    setSearch: (value: string) => void;
    visible: { orf1a?: boolean; orf1b?: boolean };
    setVisible: (visible: { orf1a?: boolean; orf1b?: boolean }) => void;
    title: React.ReactNode;
    setTitle: (value: React.ReactNode) => void;
}

export const SVGProteoma: React.FC<SVGProteomaProps> = React.memo(props => {
    const { setSearch, visible, setVisible, title, setTitle } = props;
    return (
        <Container>
            <Layer>{title}</Layer>
            <Layer>
                <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                    <g
                        onMouseLeave={() => {
                            setTitle(
                                <span>
                                    {i18n.t("SARS-CoV-2")}
                                    <br />
                                    {i18n.t("Proteome")}
                                </span>
                            );
                            setVisible({ orf1a: false, orf1b: false });
                        }}
                    >
                        <rect className="none" width="1000" height="1000" />

                        <g
                            onMouseEnter={() => {
                                setVisible({ orf1a: false, orf1b: true });
                            }}
                        >
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF1b"
                                classStyle="orf1b"
                                def="M738.33,587.77A254.31,254.31,0,0,1,500,754c-5.9,0-11.87-.21-17.76-.63a254,254,0,0,1-69.11-14.76c-2.89-1.05-5.68-2.12-8.31-3.18a248,248,0,0,1-70.7-43.14l31.45-36.17a205.07,205.07,0,0,0,120,49.38c4.78.33,9.62.5,14.39.5A206.18,206.18,0,0,0,693.3,571.37Z"
                            />

                            {visible.orf1b && (
                                <>
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP16"
                                        classStyle="orf1b"
                                        def="M399.38,746.3l-8.62,21.34a288,288,0,0,1-79.63-48.9l15.09-17.35A264.93,264.93,0,0,0,399.38,746.3Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP15"
                                        classStyle="orf1b"
                                        def="M480.43,765.29l-1.61,22.94a287,287,0,0,1-86.21-19.84l8.62-21.34A264.11,264.11,0,0,0,480.43,765.29Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP14"
                                        classStyle="orf1b"
                                        def="M573.83,779.47A289.49,289.49,0,0,1,500,789c-6.46,0-12.91-.21-19.18-.63l1.61-22.94c5.74.38,11.65.57,17.57.57a266.42,266.42,0,0,0,67.88-8.75Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="ExoN"
                                        classStyle="orf1b"
                                        def="M582.89,813.29A324.35,324.35,0,0,1,500,824c-7.28,0-14.55-.24-21.62-.72l1.6-22.93c6.59.43,13.32.65,20,.65a301.78,301.78,0,0,0,76.94-9.93Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NendoU"
                                        classStyle="orf1b"
                                        def="M592,847.11A359.7,359.7,0,0,1,500,859c-8.05,0-16.14-.27-24.06-.8l1.6-22.94c7.4.49,14.95.74,22.46.74a337.08,337.08,0,0,0,86-11.11Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="Endornase"
                                        classStyle="orf1b"
                                        def="M601,880.92A394.86,394.86,0,0,1,500,894c-8.82,0-17.73-.3-26.5-.88l1.6-22.94c8.24.54,16.61.82,24.9.82a371.89,371.89,0,0,0,95.06-12.3Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP13"
                                        classStyle="orf1b"
                                        def="M656.58,743a287,287,0,0,1-80.81,36l-6-22.21a264,264,0,0,0,74.24-33.09Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="Helicase"
                                        classStyle="orf1b"
                                        def="M675.65,772.31a322.2,322.2,0,0,1-90.82,40.46l-6-22.21A299,299,0,0,0,663.12,753Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP12"
                                        classStyle="orf1b"
                                        def="M724,682.65a289.57,289.57,0,0,1-65.72,59.2l-12.53-19.29a266.34,266.34,0,0,0,60.38-54.39Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP11"
                                        classStyle="orf1b"
                                        def="M771.3,599.79a287.59,287.59,0,0,1-46.07,81.3l-17.87-14.47a264.77,264.77,0,0,0,42.33-74.7Z"
                                    />
                                </>
                            )}
                        </g>
                        <g
                            onMouseEnter={() => {
                                setVisible({ orf1a: true, orf1b: false });
                            }}
                        >
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF1a"
                                classStyle="orf1a"
                                def="M754,500a256.17,256.17,0,0,1-2.84,39.79A243.33,243.33,0,0,1,739,585.89l-45-16.4a204.32,204.32,0,0,0,9.52-37.28A208.29,208.29,0,0,0,706,500c0-2.5,0-4.92-.13-7.21A205.82,205.82,0,0,0,501,294V246a255.53,255.53,0,0,1,47.43,4.61,252.48,252.48,0,0,1,89.88,36.32A253.31,253.31,0,0,1,753.84,491.11C754,493.94,754,496.92,754,500Z"
                            />
                            {visible.orf1a && (
                                <>
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP10"
                                        classStyle="orf1a"
                                        def="M785.33,546.18A286.87,286.87,0,0,1,772,597.91L750.37,590a264.86,264.86,0,0,0,12.24-47.46Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP9"
                                        classStyle="orf1a"
                                        def="M789,500a291.54,291.54,0,0,1-3.36,44.21l-22.72-3.6A269.58,269.58,0,0,0,766,500c0-2.84,0-5.63-.13-8.31l23-.81C789,493.9,789,497,789,500Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP8"
                                        classStyle="orf1a"
                                        def="M788.79,488.89l-23,.81a266,266,0,0,0-6.35-48.61l22.42-5.17A289.75,289.75,0,0,1,788.79,488.89Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP7"
                                        classStyle="orf1a"
                                        def="M781.42,434,759,439.14a264.23,264.23,0,0,0-15.55-46.47l21-9.36A286.84,286.84,0,0,1,781.42,434Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP6"
                                        classStyle="orf1a"
                                        def="M763.66,381.48l-21,9.36a264.45,264.45,0,0,0-24.18-42.62L737.3,335A289.42,289.42,0,0,1,763.66,381.48Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP5"
                                        classStyle="orf1a"
                                        def="M736.16,333.38l-18.85,13.2a264.59,264.59,0,0,0-31.85-37.24l16-16.55A290.08,290.08,0,0,1,736.16,333.38Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="MPro"
                                        classStyle="orf1a"
                                        def="M764.83,313.31,746,326.5a300.25,300.25,0,0,0-36.2-42.34l16-16.55A325.81,325.81,0,0,1,764.83,313.31Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="3CL-Pro"
                                        classStyle="orf1a"
                                        def="M793.51,293.23l-18.85,13.19A337.37,337.37,0,0,0,734.09,259l16-16.55A362.46,362.46,0,0,1,793.51,293.23Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP4"
                                        classStyle="orf1a"
                                        def="M700,291.4,684,308a264.87,264.87,0,0,0-38.32-30.52l12.53-19.3A290.67,290.67,0,0,1,700,291.4Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP3"
                                        classStyle="orf1a"
                                        def="M656.56,257,644,276.34a263.59,263.59,0,0,0-43.46-22.66l8.62-21.34A289.28,289.28,0,0,1,656.56,257Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="PL-Pro"
                                        classStyle="orf1a"
                                        def="M675.62,227.68,663.09,247a300,300,0,0,0-49.4-25.76l8.62-21.34A324.15,324.15,0,0,1,675.62,227.68Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="Ubi1"
                                        classStyle="orf1a"
                                        def="M694.68,198.33l-12.52,19.29a335.43,335.43,0,0,0-55.36-28.86l8.62-21.34A358.13,358.13,0,0,1,694.68,198.33Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="Macro domain"
                                        classStyle="orf1a"
                                        def="M713.75,169l-12.53,19.29a370.77,370.77,0,0,0-61.3-32L648.54,135A393.82,393.82,0,0,1,713.75,169Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="SUD-N"
                                        classStyle="orf1a"
                                        def="M732.82,139.61l-12.53,19.3A403.31,403.31,0,0,0,653,123.84l8.62-21.34A429.64,429.64,0,0,1,732.82,139.61Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="SUD-M"
                                        classStyle="orf1a"
                                        def="M751.88,110.26l-12.53,19.29a439.4,439.4,0,0,0-73.2-38.17l8.61-21.33A461.32,461.32,0,0,1,751.88,110.26Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="SUD-C"
                                        classStyle="orf1a"
                                        def="M770.91,81l-12.49,19.24a475,475,0,0,0-79.15-41.28l8.56-21.2A478.53,478.53,0,0,1,770.91,81Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP2"
                                        classStyle="orf1a"
                                        def="M607.34,231.59l-8.62,21.34a263.62,263.62,0,0,0-47-13.9l4.39-22.59A288.53,288.53,0,0,1,607.34,231.59Z"
                                    />
                                    <Path
                                        setSearch={setSearch}
                                        setTitle={setTitle}
                                        name="NSP1"
                                        classStyle="orf1a"
                                        def="M554.15,216.06l-4.39,22.59A268,268,0,0,0,501,234V211A291.41,291.41,0,0,1,554.15,216.06Z"
                                    />
                                </>
                            )}
                        </g>
                        <g
                            onMouseEnter={() => {
                                setVisible({ orf1a: false, orf1b: false });
                            }}
                        >
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF10"
                                classStyle="blue"
                                def="M408.8,315.23c-4.77,2.37-9.48,4.93-14,7.64l-24.7-41.11c6.12-3.65,11.24-6.43,17.72-9.62Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF9c"
                                classStyle="pink"
                                def="M393.05,323.9c-4.51,2.75-9,5.71-13.31,8.82l-28.2-38.81c5.89-4.24,10.74-7.45,16.81-11.12Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF9b"
                                classStyle="red"
                                def="M378.12,333.9c-5.26,3.87-10.36,8-15.2,12.32l-32.11-35.65c5.62-5,13.09-11.05,19.11-15.48Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="N"
                                classStyle="orange"
                                def="M361.44,347.56a206.94,206.94,0,0,0-33.66,39.37l-40.23-26.12a234,234,0,0,1,41.78-48.91Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF8"
                                classStyle="gray"
                                def="M326.69,388.6c-2.91,4.51-5.64,9.13-8.13,13.76l-42.33-22.5c3.4-6.34,6.35-11.35,10.24-17.38Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF7b"
                                classStyle="green"
                                def="M317.62,404.12c-2.47,4.69-4.78,9.53-6.89,14.42l-44.12-18.73c2.84-6.62,5.35-11.87,8.68-18.19Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF7a"
                                classStyle="blue"
                                def="M310,420.38c-2.05,4.87-3.93,9.9-5.6,15l-45.58-14.81c2.22-6.75,4.25-12.2,7.06-18.89Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF6"
                                classStyle="pink"
                                def="M303.73,437.25c-2,6.16-3.67,12.51-5.05,18.9l-46.88-10c1.61-7.36,4.09-16.64,6.35-23.75Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="M"
                                classStyle="red"
                                def="M298.27,458.11c-1.08,5.18-1.95,10.47-2.62,15.76L248.06,468c.88-7.06,1.84-12.8,3.32-19.87Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="E"
                                classStyle="orange"
                                def="M295.41,475.85c-.62,5.29-1,10.64-1.24,15.93l-47.94-1.67c.27-7.16.72-13,1.58-20.11Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="ORF3"
                                classStyle="gray"
                                def="M295.84,527.65l-47.47,6.67a232.73,232.73,0,0,1-2.21-42.22l47.94,1.67c-.07,2-.1,4.09-.1,6.23A208.57,208.57,0,0,0,295.84,527.65Z"
                            />
                            <Path
                                setSearch={setSearch}
                                setTitle={setTitle}
                                name="Spike"
                                classStyle="green"
                                def="M364.09,654.8,332.63,691c-24.05-21.05-42.54-43.79-56.48-69.48s-22.95-53.57-27.5-85.2l47.47-6.67A205.66,205.66,0,0,0,364.09,654.8Z"
                            />
                        </g>
                    </g>
                </SVG>
            </Layer>
        </Container>
    );
});

interface PathProps {
    name: string;
    classStyle: string;
    def: string;
    setSearch?: (value: string) => void;
    setTitle?: (value: React.ReactNode) => void;
}

const Path: React.FC<PathProps> = React.memo(props => {
    const { name, classStyle, def, setSearch, setTitle } = props;
    return (
        <path
            className={classStyle}
            d={def}
            onMouseEnter={() => setTitle && setTitle(<span>{name}</span>)}
            onClick={() => setSearch && setSearch(name)}
        />
    );
});

const Container = styled.div`
    position: relative;
    width: 650px;
    height: 650px;
    *::selection {
        background: none;
        color: inherit;
    }
`;

const Layer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 650px;
    height: 650px;
    font-size: 24px;
    font-family: Lato-Semibold, Lato;
    font-weight: 600;
    text-align: center;
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
