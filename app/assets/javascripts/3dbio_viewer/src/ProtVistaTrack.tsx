import React from "react";
import _ from "lodash";

import protvistaConfig, { VariantFilterType } from "./protvista-config";

export const ProtVistaTrack: React.FC = () => {
    const inputEl = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const el = inputEl.current;
        if (el) {
            //getPdbData("Q9BYF1").then(data => {
            getPdbData({ protein: "P0DTC2", pdb: "6zow", chain: "A" }).then(data => {
                //(el as any).variantFilter = protvistaConfig.variantsFilters;
                (el as any).viewerdata = data;
            });
        }
    });

    return (
        <React.Fragment>
            <div>
                <protvista-pdb custom-data="true" ref={inputEl}></protvista-pdb>
            </div>
        </React.Fragment>
    );
    //return <ProtvistaTrackWrapper />;
};

function getJson<T>(url: string): Promise<T | undefined> {
    return fetch(url)
        .then(res => res.text())
        .then(text => (text ? JSON.parse(text) : undefined))
        .catch(err => {
            console.error(err);
            return undefined;
        });
}

interface EbiVariation {
    accession: string; // "P0DTC2";
    entryName: string; // "SPIKE_SARS2";
    proteinName: string; //"Spike glycoprotein";
    geneName: string; // "S";
    organismName: string; // "Severe acute respiratory syndrome coronavirus 2";
    proteinExistence: string; //"Evidence at protein level";
    sequence: string; //"MFVFL";
    sequenceChecksum: string; //"12789069390587161140";
    sequenceVersion: number; // 1
    taxid: number; // 2697049;
    features: EbiVariationFeature[];
}

interface EbiVariationFeature {
    type: "VARIANT";
    alternativeSequence: string; //"L",
    begin: string; //"2",
    end: string; // "2",
    xrefs?: Array<{
        name: string; // "ENA",
        id: string; // "MN908947.3:21568:T:A"
    }>;
    genomicLocation: string; //"NC_045512.2:g.21568T>A";
    locations: Array<{
        loc: string; // "p.Phe2Leu";
        seqId: string; // "ENSSAST00005000004";
        source: string; // "EnsemblViruses";
    }>;
    codon: string; // "TTT/TTA";
    consequenceType: "missense" | "stop gained";
    wildType: string; //"F";
    mutatedType: string; // "L";
    somaticStatus: number; // 0;
    sourceType: string; // "large_scale_study";
}

interface Variants {
    sequence: string;
    variants: Variant[];
    filters: Array<VariantFilter>;
}

interface VariantFilter {
    name: string;
    type: { name: "consequence" | "provenance"; text: string };
    options: { labels: string[]; colors: string[] };
}

const textByVariantFilterType: Record<VariantFilterType, string> = {
    consequence: "Filter consequence",
    source: "Filter data source",
};

interface Variant {
    accession: string; // "NC_000021.9:g.26170608A>C";
    association?: [];
    clinicalSignificances?: null;
    color: Color;
    start: string;
    end: string;
    polyphenScore?: number;
    siftScore?: number;
    sourceType: string; //"large_scale_study";
    tooltipContent: string; // "\n        <table>\n            <tr>\n                <td>Variant</td>\n                <td>L > V</td>\n            </tr>\n            \n            \n        <tr>\n            <td>SIFT</td>\n            <td>0.215</td>\n        </tr>\n        \n            \n        <tr>\n            <td>Polyphen</td>\n            <td>0.003</td>\n        </tr>\n        \n            \n            \n        <tr>\n            <td>Consequence</td>\n            <td>missense</td>\n        </tr>\n        \n            \n            \n            \n            <tr>\n                <td>Location</td>\n                <td>NC_000021.9:g.26170608A>C</td>\n            </tr>\n            \n            \n            \n        </table>\n    ";
    variant: string; // "V";
    xrefNames: string[]; // ["gnomAD", "TOPMed"];
    keywords?: string[]; // ["large_scale_studies", "predicted"];
}

interface Features {
    accession: string;
    entryName: string;
    sequence: string;
    sequenceChecksum: string;
    taxid: number;
    features: Feature[];
}

interface Feature {
    type: string;
    category: string;
    description: string;
    begin: string;
    end: string;
    molecule: string;
    evidences: Array<{
        code: string;
        source: { name: string; id: string; url: string; alternativeUrl?: string };
    }>;
}

type Cv19Annotations = Cv19Annotation[];

interface Cv19Annotation {
    track_name: string;
    visualization_type?: "variants"; // This type uses a different Data, implement if necessary
    acc: string;
    data: Cv19AnnotationData[];
    reference: string;
    fav_icon: string;
}

interface Cv19AnnotationData {
    begin: number;
    end: number;
    partner_name: string;
    color: string;
    description: string;
    type: string;
}

// Examples: "#F00", "rgb(135,0,0)", "red"
type Color = string;

interface Track {
    label: string;
    labelType: "text" | "html";
    overlapping?: boolean;
    data: Array<{
        accession: string;
        type: string; // Displayed in tooltip title
        label: string; // Supports: text and html.
        labelTooltip: string; // Label tooltip content. Support text and HTML mark-up
        overlapping?: boolean;
        shape: Shape;
        locations: Array<{
            fragments: Array<Fragment>;
        }>;
    }>;
}

interface Fragment {
    start: number;
    end: number;
    tooltipContent: string;
    color: Color;
}

type Shape =
    | "rectangle"
    | "bridge"
    | "diamond"
    | "chevron"
    | "catFace"
    | "triangle"
    | "wave"
    | "hexagon"
    | "pentagon"
    | "circle"
    | "arrow"
    | "doubleBar";

interface PdbData {
    displayNavigation: boolean;
    displaySequence: boolean;
    displayConservation: boolean;
    displayVariants: boolean;
    sequence: string;
    length: number;
    offset?: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: Array<Track>;
    sequenceConservation?: unknown;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
    variants?: Variants;
}

type PdbAnnotations = PdbAnnotation[];

interface PdbAnnotation {
    chain: string;
    minVal: number;
    maxVal: number;
    algorithm: string;
    algoType: string;
    data: Array<{ begin: string; value: number }>;
}

async function getPdbData(options: {
    protein: string;
    pdb: string;
    chain: string;
}): Promise<PdbData> {
    const { protein, pdb, chain } = options;
    const featuresData = await getJson<Features>(
        `https://www.ebi.ac.uk/proteins/api/features/${protein}`
    );
    if (!featuresData) throw new Error("TODO: No features data");

    const annotations = await getJson<Cv19Annotations>(
        `http://3dbionotes.cnb.csic.es/cv19_annotations/${protein}_annotations.json`
    );

    const ebiVariation = await getJson<EbiVariation>(
        `https://www.ebi.ac.uk/proteins/api/variation/${protein}`
    );

    const pdbAnnotations = await getJson<PdbAnnotations>(
        `http://3dbionotes.cnb.csic.es/ws/lrs/pdbAnnotFromMap/all/${pdb}/${chain}/?format=json`
    );

    const bioMuta = await getJson<EbiVariation>(
        `http://3dbionotes.cnb.csic.es/api/annotations/biomuta/Uniprot/${protein}`
    );

    const filters: Variants["filters"] = protvistaConfig.variantsFilters.map(
        (f, idx): Variants["filters"][0] => ({
            name: "filter-" + idx,
            type: {
                name: f.type === "source" ? ("provenance" as const) : ("consequence" as const),
                text: textByVariantFilterType[f.type],
            },
            options: {
                labels: f.items.map(item => item.label),
                colors: f.items.map(item => item.color),
            },
        })
    );

    const variants: Variants | undefined = ebiVariation
        ? {
              sequence: ebiVariation.sequence,
              filters,
              variants: ebiVariation.features.map(
                  (v): Variant => ({
                      accession: v.genomicLocation, // "NC_000021.9:g.26170608A>C";
                      color: "#800",
                      start: v.begin,
                      end: v.end,
                      //polyphenScore: number,
                      //siftScore: number,
                      sourceType: v.sourceType, //"large_scale_study";
                      // TODO
                      tooltipContent:
                          "<table>\n            <tr>\n                <td>Variant</td>\n                <td>L > V</td>\n            </tr>\n            \n            \n        <tr>\n            <td>SIFT</td>\n            <td>0.215</td>\n        </tr>\n        \n            \n        <tr>\n            <td>Polyphen</td>\n            <td>0.003</td>\n        </tr>\n        \n            \n            \n        <tr>\n            <td>Consequence</td>\n            <td>missense</td>\n        </tr>\n        \n            \n            \n            \n            <tr>\n                <td>Location</td>\n                <td>NC_000021.9:g.26170608A>C</td>\n            </tr>\n            \n            \n            \n        </table>",
                      variant: v.alternativeSequence, // "V";
                      xrefNames: (v.xrefs || []).map(xref => xref.name), // ["gnomAD", "TOPMed"];
                      //keywords: string[], // ["large_scale_studies", "predicted"];
                  })
              ),
          }
        : undefined;

    const mapping = annotations ? annotations[0] : undefined;

    const mappingTracks = mapping
        ? _(mapping.data)
              .groupBy(data => data.partner_name)
              .map((values, key) => ({ name: key, items: values }))
              .value()
        : [];

    const featuresByCategory = featuresData
        ? _(featuresData.features)
              .groupBy(data => data.category)
              .mapValues(values =>
                  _(values)
                      .groupBy(value => value.type)
                      .map((values, key) => ({ name: key, items: values }))
                      .value()
              )
              .value()
        : {};

    const features = _(protvistaConfig.categories)
        .map(category => {
            const items = featuresByCategory[category.name];
            return items ? { name: category.label, items } : null;
        })
        .compact()
        .value();

    const functionalMappingTrack: Track | undefined = mapping
        ? {
              label: getName(mapping.track_name),
              labelType: "text",
              overlapping: false,
              data: mappingTracks.map(track => ({
                  accession: getName(track.name),
                  type: track.items[0].type, // TODO
                  label: getName(track.name),
                  labelTooltip: track.items[0].description, // TODO
                  overlapping: false,
                  shape: "rectangle",
                  locations: [
                      {
                          fragments: track.items.map(item => ({
                              start: item.begin,
                              end: item.end,
                              tooltipContent: item.description, // TODO: more
                              color: item.color,
                          })),
                      },
                  ],
              })),
          }
        : undefined;

    const emValidationTrack: Track | undefined = pdbAnnotations
        ? {
              label: "em validation",
              labelType: "text",
              overlapping: false,
              data: pdbAnnotations.map((pdbAnnotation: PdbAnnotation) => ({
                  accession: pdbAnnotation.algorithm,
                  type: "some-type", // TODO
                  label: getName(
                      `${pdbAnnotation.algorithm} (${pdbAnnotation.minVal} -> ${pdbAnnotation.maxVal})`
                  ),
                  labelTooltip: `${pdbAnnotation.algorithm} (${pdbAnnotation.minVal} -> ${pdbAnnotation.maxVal})`,
                  overlapping: false,
                  shape: "rectangle",
                  locations: [
                      {
                          fragments: pdbAnnotation.data.map(obj => ({
                              start: parseInt(obj.begin),
                              end: parseInt(obj.begin),
                              tooltipContent: "Contents: TODO",
                              color: "#BA4", // TODO: Color from obj.value, see legend in extendProtVista/add_em_res.js
                          })),
                      },
                  ],
              })),
          }
        : undefined;

    const pdbData: PdbData = {
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        displayVariants: true,
        sequence: featuresData.sequence,
        variants /*{
            sequence:
                "MLPGLALLLLAAWTARALEVPTDGNAGLLAEPQIAMFCGRLNMHMNVQNGKWDSDPSGTKTCIDTKEGILQYCQEVYPELQITNVVEANQPVTIQNWCKRGRKQCKTHPHFVIPYRCLVGEFVSDALLVPDKCKFLHQERMDVCETHLHWHTVAKETCSEKSTNLHDYGMLLPCGIDKFRGVEFVCCPLAEESDNVDSADAEEDDSDVWWGGADTDYADGSEDKVVEVAEEEEVAEVEEEEADDDEDDEDGDEVEEEAEEPYEEATERTTSIATTTTTTTESVEEVVREVCSEQAETGPCRAMISRWYFDVTEGKCAPFFYGGCGGNRNNFDTEEYCMAVCGSAMSQSLLKTTQEPLARDPVKLPTTAASTPDAVDKYLETPGDENEHAHFQKAKERLEAKHRERMSQVMREWEEAERQAKNLPKADKKAVIQHFQEKVESLEQEAANERQQLVETHMARVEAMLNDRRRLALENYITALQAVPPRPRHVFNMLKKYVRAEQKDRQHTLKHFEHVRMVDPKKAAQIRSQVMTHLRVIYERMNQSLSLLYNVPAVAEEIQDEVDELLQKEQNYSDDVLANMISEPRISYGNDALMPSLTETKTTVELLPVNGEFSLDDLQPWHSFGADSVPANTENEVEPVDARPAADRGLTTRPGSGLTNIKTEEISEVKMDAEFRHDSGYEVHHQKLVFFAEDVGSNKGAIIGLMVGGVVIATVIVITLVMLKKKQYTSIHHGVVEVDAAVTPEERHLSKMQQNGYENPTYKFFEQMQN",
            variants: [
                {
                    accession: "NC_000021.9:g.26170608A>C",
                    //"association": [],
                    //"clinicalSignificances": null,
                    color: "#0D369E",
                    end: "5",
                    polyphenScore: 0.003,
                    siftScore: 0.215,
                    sourceType: "large_scale_study",
                    start: "5",
                    tooltipContent:
                        "\n        <table>\n            <tr>\n                <td>Variant</td>\n                <td>L > V</td>\n            </tr>\n            \n            \n        <tr>\n            <td>SIFT</td>\n            <td>0.215</td>\n        </tr>\n        \n            \n        <tr>\n            <td>Polyphen</td>\n            <td>0.003</td>\n        </tr>\n        \n            \n            \n        <tr>\n            <td>Consequence</td>\n            <td>missense</td>\n        </tr>\n        \n            \n            \n            \n            <tr>\n                <td>Location</td>\n                <td>NC_000021.9:g.26170608A>C</td>\n            </tr>\n            \n            \n            \n        </table>\n    ",
                    variant: "V",
                    xrefNames: ["gnomAD", "TOPMed"],
                    keywords: ["large_scale_studies", "predicted"],
                    //"internalId": "var_undefined5undefined"
                },
            ],
        },
        */,
        length:
            _(features)
                .flatMap(feature => feature.items)
                .flatMap(item => item.items)
                .map(item => parseInt(item.end))
                .max() || 0,
        tracks: _.compact([
            functionalMappingTrack,
            ...features.map(feature => ({
                label: feature.name,
                labelType: "text" as const,
                overlapping: false,
                data: feature.items.map((item, idx) => ({
                    accession: item.name + "-" + idx,
                    type: getName(item.name),
                    label:
                        protvistaConfig.tracks[item.name.toLowerCase()]?.label ||
                        getName(item.name),
                    labelTooltip:
                        protvistaConfig.tracks[item.name.toLowerCase()]?.tooltip ||
                        getName(item.name),
                    overlapping: false,
                    shape: protvistaConfig.shapeByTrackName[item.name.toLowerCase()] || "circle",
                    locations: [
                        {
                            fragments: item.items.map(
                                (item): Fragment => ({
                                    start: parseInt(item.begin),
                                    end: parseInt(item.end),
                                    tooltipContent: item.description, // TODO: more
                                    color:
                                        protvistaConfig.tracks[item.type.toLowerCase()]?.color ||
                                        "#777",
                                })
                            ),
                        },
                    ],
                })),
            })),
            emValidationTrack,
        ]),
    };
    console.log(pdbData);

    return pdbData;
}

function getName(s: string) {
    //return _.capitalize(s.replace(/_/g, " "));
    return s.replace(/_/g, " ");
}
