import { Typography } from "@material-ui/core";
import React from "react";
import i18n from "../../../utils/i18n";
import { Orf1a, Orf1b, Remaining, Nucleoprotein } from "./Proteins";
import { ProteomePath, ProtDetails } from "./ProteomePath";
import { Container, Layer, SVG } from "./styled";

const viewerPath = "/?queryId=";

export interface VisibleGen {
    orf1a?: boolean;
    orf1b?: boolean;
    nucleoprotein?: boolean;
}

interface SVGProteomeProps {
    setSearch: (value: string) => void;
    setProteomeSelected: (value: boolean) => void;
    toggleProteome: () => void;
}

interface DetailsProps {
    details: ProtDetails;
    title: string;
}

export const SVGProteome: React.FC<SVGProteomeProps> = React.memo(props => {
    const { setSearch, setProteomeSelected, toggleProteome } = props;
    const [title, setTitle] = React.useState("");
    const [visible, setVisible] = React.useState<VisibleGen>({});
    const [details, setDetails] = React.useState<ProtDetails>();
    const [detailsVisible, setDetailsVisible] = React.useState(false);

    const stateSetters = React.useMemo(
        () => ({
            setSearch,
            setTitle,
            setProteomeSelected,
            setDetails,
            toggleProteome,
        }),
        [setSearch, setTitle, setProteomeSelected, setDetails, toggleProteome]
    );

    const hideSubproteins = React.useCallback(() => {
        setVisible({});
    }, [setVisible]);

    const setVisibleGen = React.useCallback(
        (visible?: keyof VisibleGen) => {
            setDetailsVisible(true);
            const gens = { orf1a: false, orf1b: false, nucleoprotein: false };
            if (visible) gens[visible] = true;
            setVisible(gens);
        },
        [setVisible, setDetailsVisible]
    );

    const parentProts = React.useMemo(
        () => ({
            orf1a: Orf1a.find(prot => prot.name === "ORF1a"),
            orf1b: Orf1b.find(prot => prot.name === "ORF1b"),
            nucleoprotein: Nucleoprotein.find(prot => !prot.details.domain),
        }),
        []
    );

    const childrenProts = React.useMemo(
        () => ({
            orf1a: Orf1a.filter(prot => prot.name !== "ORF1a"),
            orf1b: Orf1b.filter(prot => prot.name !== "ORF1b"),
            nucleoprotein: Nucleoprotein.filter(prot => prot.details.domain),
        }),
        []
    );

    const childrenPDB = React.useMemo(
        () => ({
            nsp3: childrenProts.orf1a
                .filter(prot => prot.details.domain)
                .map(prot => prot.details.pdb?.id ?? "")
                .filter(id => id && id !== "N/A"),
            orf1a: childrenProts.orf1a
                .map(prot => prot.details.pdb?.id ?? "")
                .filter(id => id && id !== "N/A"),
            orf1b: childrenProts.orf1b
                .map(prot => prot.details.pdb?.id ?? "")
                .filter(id => id && id !== "N/A"),
            nucleoprotein: childrenProts.nucleoprotein
                .map(prot => prot.details.pdb?.id ?? "")
                .filter(id => id && id !== "N/A"),
        }),
        [childrenProts]
    );

    return (
        <Container>
            {/*Using relative -> absolute for having svg above title. So the title can be easily put in center*/}
            <div className="relative">
                <Layer className="center title">
                    <span>
                        {i18n.t("SARS-CoV-2")}
                        <br />
                        {i18n.t("Proteome")}
                    </span>
                </Layer>
                <Layer className="center">
                    <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
                        <rect className="none" width="1000" height="1000" />
                        {(["orf1a", "orf1b", "nucleoprotein"] as const).map(
                            (s: keyof VisibleGen) => (
                                <g key={s} onMouseEnter={() => setVisibleGen(s)}>
                                    {parentProts[s] && (
                                        <ProteomePath
                                            stateSetters={stateSetters}
                                            name={parentProts[s]?.name ?? ""}
                                            classStyle={
                                                parentProts[s]?.name
                                                    .toLowerCase()
                                                    .replace(/\s/, "_") ?? ""
                                            }
                                            def={parentProts[s]?.def ?? ""}
                                            details={{
                                                childrenPDB: childrenPDB[s],
                                            }}
                                        />
                                    )}
                                    {visible[s] &&
                                        childrenProts[s].map((prot, idx) => (
                                            <ProteomePath
                                                key={idx}
                                                stateSetters={stateSetters}
                                                classStyle={
                                                    prot.details.gen
                                                        ?.toLowerCase()
                                                        .replace(/\s/, "_") ?? ""
                                                }
                                                name={prot.name}
                                                def={prot.def ?? ""}
                                                details={
                                                    prot.name === "NSP3" && !prot.details.domain
                                                        ? {
                                                              gen: "ORF1a",
                                                              childrenPDB: childrenPDB.nsp3,
                                                          }
                                                        : prot.details
                                                }
                                            />
                                        ))}
                                </g>
                            )
                        )}
                        <g onMouseEnter={hideSubproteins}>
                            {Remaining.map((prot, idx) => (
                                <ProteomePath
                                    key={idx}
                                    stateSetters={stateSetters}
                                    classStyle={prot.name.toLowerCase().replace(/\s/, "_")}
                                    name={prot.name}
                                    def={prot.def ?? ""}
                                    details={prot.details}
                                />
                            ))}
                        </g>
                        <text x="442" y="200">
                            5&rsquo;
                        </text>
                        <text x="542" y="200">
                            3&rsquo;
                        </text>
                    </SVG>
                </Layer>
                {detailsVisible && details && <Details details={details} title={title} />}
            </div>
        </Container>
    );
});

const Details: React.FC<DetailsProps> = React.memo(props => {
    const { details, title } = props;
    return (
        <>
            {/*Images*/}
            <Layer className="left">
                {details.pdb && details.pdb.id && details.pdb.id !== "N/A" && details.pdb.img && (
                    <img
                        alt={details.pdb.id}
                        src={details.pdb.img}
                        loading="lazy"
                        style={!details.emdb ? styles.pdbOnly : styles.img}
                    />
                )}
                {details.emdb && details.emdb.img && (
                    <img
                        alt={details.emdb.id}
                        src={details.emdb.img}
                        loading="lazy"
                        style={styles.img}
                    />
                )}
            </Layer>
            <Layer className="right">
                <div>
                    {/*Title and domain*/}
                    <Typography style={styles.title} variant="h6">
                        {details.domain ? (
                            <>
                                {details.domain} ({title})
                            </>
                        ) : details.gen && details.gen !== "Remaining" && details.gen !== title ? (
                            <>
                                {title} ({details.gen})
                            </>
                        ) : (
                            <>{title}</>
                        )}
                    </Typography>
                    {/*Synonyms*/}
                    <Typography style={styles.synonyms}>{details.synonyms}</Typography>
                    {/*Structures*/}
                    <Typography style={styles.subtitle}>
                        {details.pdb && details.pdb.id && details.pdb.id !== "N/A" ? (
                            <>
                                PDB:&#160;
                                <a href={viewerPath + details.pdb.id.toLowerCase()}>
                                    {details.pdb.id}
                                </a>
                            </>
                        ) : details.childrenPDB ? (
                            <>
                                {i18n.t("Structures")}:&#160;
                                {details.childrenPDB.map((id, idx) => (
                                    <React.Fragment key={idx}>
                                        <a href={viewerPath + id.toLowerCase()}>{id}</a>
                                        {details.childrenPDB &&
                                            idx <= details.childrenPDB.length - 2 &&
                                            ", "}
                                    </React.Fragment>
                                ))}
                            </>
                        ) : (
                            <span>{i18n.t("No structures found.")}</span>
                        )}
                        {details.emdb && (
                            <>
                                , EMDB:&#160;
                                <a href={viewerPath + details.emdb.id.toLowerCase()}>
                                    {details.emdb.id}
                                </a>
                            </>
                        )}
                    </Typography>
                    {/*Description*/}
                    <Typography style={styles.description}>
                        {details.description &&
                            (details.description.length <= 1000
                                ? i18n.t(`Description: ${details.description}`)
                                : i18n.t(`Description: ${details.description.slice(0, 1000)}...`))}
                    </Typography>
                </div>
            </Layer>
        </>
    );
});

const styles = {
    title: { marginBottom: "0.125em" },
    subtitle: { fontSize: "0.875em", marginBottom: "1em" },
    synonyms: {
        color: "#6c757d",
        fontSize: "0.875em",
        marginTop: "0em",
        marginBottom: "1em",
        fontStyle: "italic",
    },
    description: {
        fontSize: "0.875em",
        marginTop: "1em",
        marginBottom: "1em",
        maxHeight: 380,
        overflow: "hidden" as const,
    },
    img: { height: 200, width: 200 },
    pdbOnly: { height: 250, width: 250 },
};
