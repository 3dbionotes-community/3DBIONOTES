import _ from "lodash";
import { getFragment } from "../../../domain/entities/Fragment";
import { Track } from "../../../domain/entities/Track";
import { config, getColorFromString } from "./config";
import { getId, getName } from "./utils";

export interface Feature {
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

export interface Features {
    accession: string;
    entryName: string;
    sequence: string;
    sequenceChecksum: string;
    taxid: number;
    features: Feature[];
}

export interface GroupedFeature {
    name: string;
    items: {
        name: string;
        items: Feature[];
    }[];
}

export function getTrackFromFeatures(features: Features): Track[] {
    const groupedFeatures = features ? getGroupedFeatures(features) : [];
    return groupedFeatures.map(groupedFeature => getTrackFromGroupedFeature(groupedFeature));
}

function getTrackFromGroupedFeature(feature: GroupedFeature): Track {
    return {
        id: getId(feature.name),
        label: feature.name,
        subtracks: feature.items.map((item, idx) => {
            const itemKey = item.name.toLowerCase();
            const track = config.tracks[itemKey];

            return {
                accession: item.name + "-" + idx,
                type: getName(item.name),
                label: track?.label || getName(item.name),
                labelTooltip: track?.tooltip || getName(item.name),
                shape: config.shapeByTrackName[itemKey] || "circle",
                locations: [
                    {
                        fragments: _.flatMap(item.items, item =>
                            getFragment({
                                start: parseInt(item.begin),
                                end: parseInt(item.end),
                                description: item.description,
                                color: getColorFromString(itemKey),
                            })
                        ),
                    },
                ],
            };
        }),
    };
}

function getGroupedFeatures(featuresData: Features): GroupedFeature[] {
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

    const features = _(config.categories)
        .map(category => {
            const items = featuresByCategory[category.name];
            return items ? { name: category.label, items } : null;
        })
        .compact()
        .value();

    return features;
}
