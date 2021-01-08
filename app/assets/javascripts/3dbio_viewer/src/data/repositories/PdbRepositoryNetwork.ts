import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../domain/entities/FutureData";
import { Pdb } from "../../domain/entities/Pdb";
import { Variant, VariantFilter, Variants } from "../../domain/entities/Variant";
import { PdbRepository } from "../../domain/repositories/PdbRepository";
import { Future } from "../../utils/future";
import { AxiosBuilder, axiosRequest } from "../../utils/future-axios";
import { VariantFilterType, config as protvistaConfig } from "./protvista-config";
import { Track } from "../../domain/entities/Track";
import { Fragment } from "../../domain/entities/Fragment";
import { debugVariable } from "../../utils/debug";
import {
    GroupedFeature,
    Cv19Annotation,
    Features,
    EbiVariation,
    Cv19Annotations,
    PdbAnnotations,
} from "./PdbRepositoryNetwork.types";
import { getEmValidationTrack } from "./em-validation";
import { getName } from "./utils";

export class PdbRepositoryNetwork implements PdbRepository {
    get(options: { protein: string; pdb: string; chain: string }): FutureData<Pdb> {
        const { protein, pdb, chain } = options;
        const bionotesUrl = "http://3dbionotes.cnb.csic.es";

        const data$: AsyncData = {
            features: get(`https://www.ebi.ac.uk/proteins/api/features/${protein}`),
            covidAnnotations: get(`${bionotesUrl}/cv19_annotations/${protein}_annotations.json`),
            pdbAnnotations: get(
                `${bionotesUrl}/ws/lrs/pdbAnnotFromMap/all/${pdb}/${chain}/?format=json`
            ),
            ebiVariation: get(`https://www.ebi.ac.uk/proteins/api/variation/${protein}`),
            bioMuta: get(`${bionotesUrl}/api/annotations/biomuta/Uniprot/${protein}`),
        };

        const data1$ = Future.join(data$.features, data$.covidAnnotations);
        const data2$ = Future.join3(data$.ebiVariation, data$.pdbAnnotations, data$.bioMuta);

        return Future.join(data1$, data2$).map(
            ([[features, annotations], [ebiVariation, pdbAnnotations, bioMuta]]) => {
                return this.getPdb({
                    features,
                    covidAnnotations: annotations,
                    ebiVariation,
                    pdbAnnotations,
                    bioMuta,
                });
            }
        );
    }

    getPdb(data: Data): Pdb {
        const {
            features: featuresData,
            covidAnnotations: annotations,
            ebiVariation,
            pdbAnnotations /* bioMuta */,
        } = data;
        debugVariable(data);

        const filters: VariantFilter[] = this.getVariantFilters();
        const variants = ebiVariation ? this.getVariants(ebiVariation, filters) : undefined;
        const groupedFeatures = this.getGroupedFeatures(featuresData);
        const mapping = annotations ? annotations[0] : undefined;
        const functionalMappingTrack = this.getFunctionalMappingTrack(mapping);
        const emValidationTrack = getEmValidationTrack(pdbAnnotations);

        const tracks: Track[] = _.compact([
            functionalMappingTrack,
            ...groupedFeatures.map(groupedFeature =>
                this.getTrackFromGroupedFeature(groupedFeature)
            ),
            emValidationTrack,
        ]);

        return {
            sequence: featuresData.sequence,
            tracks,
            variants,
            length: this.getTotalFeaturesLength(groupedFeatures),
        };
    }

    private getTotalFeaturesLength(groupedFeatures: GroupedFeature[]): number {
        return (
            _(groupedFeatures)
                .flatMap(feature => feature.items)
                .flatMap(item => item.items)
                .map(item => parseInt(item.end))
                .max() || 0
        );
    }

    private getTrackFromGroupedFeature(feature: GroupedFeature): Track {
        return {
            label: feature.name,
            labelType: "text" as const,
            overlapping: false,
            data: feature.items.map((item, idx) => {
                const itemKey = item.name.toLowerCase();
                const track = protvistaConfig.tracks[itemKey];

                return {
                    accession: item.name + "-" + idx,
                    type: getName(item.name),
                    label: track?.label || getName(item.name),
                    labelTooltip: track?.tooltip || getName(item.name),
                    overlapping: false,
                    shape: protvistaConfig.shapeByTrackName[itemKey] || "circle",
                    locations: [
                        {
                            fragments: item.items.map(
                                (item): Fragment => ({
                                    start: parseInt(item.begin),
                                    end: parseInt(item.end),
                                    description: item.description,
                                    color: protvistaConfig.tracks[itemKey]?.color || "#777",
                                })
                            ),
                        },
                    ],
                };
            }),
        };
    }

    private getFunctionalMappingTrack(mapping: Cv19Annotation | undefined) {
        const mappingTracks = mapping
            ? _(mapping.data)
                  .groupBy(data => data.partner_name)
                  .map((values, key) => ({ name: key, items: values }))
                  .value()
            : [];

        const functionalMappingTrack: Track | undefined = mapping
            ? {
                  label: getName(mapping.track_name),
                  labelType: "text",
                  overlapping: false,
                  data: mappingTracks.map(track => ({
                      accession: getName(track.name),
                      type: track.items[0].type,
                      label: getName(track.name),
                      labelTooltip: track.items[0].description,
                      overlapping: false,
                      shape: "rectangle",
                      locations: [
                          {
                              fragments: track.items.map(item => ({
                                  start: item.begin,
                                  end: item.end,
                                  description: item.description,
                                  color: item.color,
                              })),
                          },
                      ],
                  })),
              }
            : undefined;
        return functionalMappingTrack;
    }

    private getGroupedFeatures(featuresData: Features): GroupedFeature[] {
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

        return features;
    }

    private getVariants(
        ebiVariation: EbiVariation,
        filters: VariantFilter[]
    ): Variants | undefined {
        return {
            sequence: ebiVariation.sequence,
            filters,
            variants: ebiVariation.features.map(
                (v): Variant => ({
                    accession: v.genomicLocation,
                    color: "#800",
                    start: v.begin,
                    end: v.end,
                    //polyphenScore: number,
                    //siftScore: number,
                    sourceType: v.sourceType,

                    // TODO
                    tooltipContent:
                        "<table>\n            <tr>\n                <td>Variant</td>\n                <td>L > V</td>\n            </tr>\n            \n            \n        <tr>\n            <td>SIFT</td>\n            <td>0.215</td>\n        </tr>\n        \n            \n        <tr>\n            <td>Polyphen</td>\n            <td>0.003</td>\n        </tr>\n        \n            \n            \n        <tr>\n            <td>Consequence</td>\n            <td>missense</td>\n        </tr>\n        \n            \n            \n            \n            <tr>\n                <td>Location</td>\n                <td>NC_000021.9:g.26170608A>C</td>\n            </tr>\n            \n            \n            \n        </table>",
                    variant: v.alternativeSequence,
                    xrefNames: (v.xrefs || []).map(xref => xref.name),
                })
            ),
        };
    }

    private getVariantFilters(): VariantFilter[] {
        return protvistaConfig.variantsFilters.map(
            (f, idx): VariantFilter => ({
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
    }
}

const textByVariantFilterType: Record<VariantFilterType, string> = {
    consequence: "Filter consequence",
    source: "Filter data source",
};

function get<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}

interface Data {
    features: Features;
    covidAnnotations: Cv19Annotations;
    pdbAnnotations: PdbAnnotations;
    ebiVariation: EbiVariation;
    bioMuta: EbiVariation;
}

type AsyncData = { [K in keyof Data]: Future<RequestError, Data[K]> };

type RequestError = { message: string };

const builder: AxiosBuilder<RequestError> = {
    mapResponse: res => {
        if (res.status >= 200 && res.status < 300) {
            return ["success", res.data];
        } else {
            return ["error", { message: JSON.stringify(res.data) }];
        }
    },
    mapNetworkError: (_req, message) => ({ status: 0, message }),
};

function request<Data>(request: AxiosRequestConfig): Future<RequestError, Data> {
    return axiosRequest<RequestError, Data>(builder, request);
}
