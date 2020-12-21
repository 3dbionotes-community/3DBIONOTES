import React from "react";
import _ from "lodash";

import protvistaConfig from "./protvista-config";

export const ProtVistaTrack: React.FC = () => {
    const inputEl = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const el = inputEl.current;
        if (el) {
            getPdbData().then(data => {
                (el as any).viewerdata = data;
            });
        }
    });

    return (
        <React.Fragment>
            <div>
                <protvista-pdb custom-data="true" ref={inputEl}></protvista-pdb>
                <xprotvista-pdb accession="P0DTC2" />
            </div>
        </React.Fragment>
    );
    //return <ProtvistaTrackWrapper />;
};

function getJson<T>(url: string): Promise<T> {
    return fetch(url).then(res => res.json());
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
        label: string; // Expected values 'text' and 'html'
        labelTooltip: string; // Label tooltip content. Support text and HTML mark-up
        overlapping?: boolean;
        locations: Array<{
            fragments: Array<{
                start: number;
                end: number;
                tooltipContent: string;
                color: Color;
            }>;
        }>;
    }>;
}

interface PdbData {
    displayNavigation: boolean;
    displaySequence: boolean;
    sequence: string;
    length: number;
    offset?: number;
    // https://github.com/ebi-webcomponents/nightingale/tree/master/packages/protvista-track#data-array
    tracks: Array<Track>;
    sequenceConservation?: unknown;
    variants?: unknown;
    legends?: {
        alignment: "left" | "right" | "center";
        data: Record<string, Array<{ color: Color[]; text: string }>>;
    };
}

async function getPdbData(): Promise<PdbData> {
    const featuresData = await getJson<Features>(
        "https://www.ebi.ac.uk/proteins/api/features/P0DTC2"
    );
    const annotations = await getJson<Cv19Annotations>(
        "http://localhost:3000/cv19_annotations/P0DTC2_annotations.json"
    );

    const mapping = annotations[0];

    const mappingTracks = _(mapping.data)
        .groupBy(data => data.partner_name)
        .map((values, key) => ({ name: key, items: values }))
        .value();

    const featuresByCategory = _(featuresData.features)
        .groupBy(data => data.category)
        .mapValues(values =>
            _(values)
                .groupBy(value => value.type)
                .map((values, key) => ({ name: key, items: values }))
                .value()
        )
        .value();

    const features = _(protvistaConfig.categories)
        .map(category => {
            const items = featuresByCategory[category.name];
            return items ? { name: category.label, items } : null;
        })
        .compact()
        .value();

    const functionalMappingTrack: Track = {
        label: getName(mapping.track_name),
        labelType: "text",
        overlapping: false,
        data: mappingTracks.map(track => ({
            accession: getName(track.name),
            type: track.items[0].type, // TODO
            label: getName(track.name),
            labelTooltip: track.items[0].description, // TODO
            overlapping: false,
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
    };
    const pdbData: PdbData = {
        displayNavigation: true,
        displaySequence: true,
        sequence: featuresData.sequence,
        length:
            _(mappingTracks)
                .flatMap(track => track.items)
                .map(item => item.end)
                .max() || 0,
        tracks: [
            functionalMappingTrack,
            ...features.map(feature => ({
                label: getName(feature.name),
                labelType: "text" as const,
                overlapping: false,
                data: feature.items.map((item, idx) => ({
                    accession: item.name + "-" + idx,
                    type: getName(item.name),
                    label: getName(item.name),
                    labelTooltip: getName(item.name),
                    overlapping: false,
                    locations: [
                        {
                            fragments: item.items.map(item => ({
                                start: parseInt(item.begin),
                                end: parseInt(item.end),
                                tooltipContent: item.description, // TODO: more
                                color:
                                    protvistaConfig.tracks[item.type.toLowerCase()]?.color ||
                                    "#777",
                            })),
                        },
                    ],
                })),
            })),
        ],
    };

    return pdbData;
}

function getName(s: string) {
    return _.capitalize(s.replace(/_/g, " "));
}
