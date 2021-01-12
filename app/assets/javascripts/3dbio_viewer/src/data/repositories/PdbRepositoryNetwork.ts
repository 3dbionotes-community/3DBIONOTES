import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../domain/entities/FutureData";
import { Pdb } from "../../domain/entities/Pdb";
import { PdbRepository } from "../../domain/repositories/PdbRepository";
import { Future } from "../../utils/future";
import { AxiosBuilder, axiosRequest } from "../../utils/future-axios";
import { config as protvistaConfig } from "./protvista-config";
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
    Coverage,
} from "./PdbRepositoryNetwork.types";
import { getEmValidationTrack } from "./em-validation";
import { getName } from "./utils";
import { getVariants } from "./variants";

export class PdbRepositoryNetwork implements PdbRepository {
    // TODO: Get protein from pdb
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
            coverage: get(`${bionotesUrl}/api/alignments/Coverage/${pdb}${chain}`),
            // bioMuta: get(`${bionotesUrl}/api/annotations/biomuta/Uniprot/${protein}`),
        };

        const data1$ = Future.join3(data$.features, data$.covidAnnotations, data$.coverage);
        const data2$ = Future.join(data$.ebiVariation, data$.pdbAnnotations);

        return Future.join(data1$, data2$).map(
            ([[features, annotations, coverage], [ebiVariation, pdbAnnotations]]) => {
                return this.getPdb({
                    features,
                    covidAnnotations: annotations,
                    ebiVariation,
                    pdbAnnotations,
                    coverage,
                });
            }
        );
    }

    getPdb(data: Data): Pdb {
        const { features, covidAnnotations, ebiVariation, pdbAnnotations, coverage } = data;
        debugVariable(data);

        const variants = ebiVariation ? getVariants(ebiVariation) : undefined;
        const groupedFeatures = this.getGroupedFeatures(features);
        const mapping = covidAnnotations ? covidAnnotations[0] : undefined;
        const functionalMappingTrack = this.getFunctionalMappingTrack(mapping);
        const emValidationTrack = getEmValidationTrack(pdbAnnotations);
        const structureCoverageTrack = this.getStructureCoverageTrack(coverage);

        const tracks: Track[] = _.compact([
            functionalMappingTrack,
            ...groupedFeatures.map(groupedFeature =>
                this.getTrackFromGroupedFeature(groupedFeature)
            ),
            emValidationTrack,
            structureCoverageTrack,
        ]);

        return {
            sequence: features.sequence,
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

    private getStructureCoverageTrack(coverage: Coverage): Track {
        const itemKey = "region";
        const trackConfig = protvistaConfig.tracks[itemKey];
        const name = "Region";

        return {
            id: "structure-coverage",
            label: "Structure coverage",
            labelType: "text" as const,
            data: [
                {
                    accession: name,
                    type: name,
                    label: name,
                    labelTooltip: trackConfig.tooltip,
                    shape: protvistaConfig.shapeByTrackName[itemKey] || "circle",
                    locations: [
                        {
                            fragments: coverage["Structure coverage"].map(
                                (item): Fragment => ({
                                    start: item.start,
                                    end: item.end,
                                    description: "Sequence segment covered by the structure",
                                    color: trackConfig.color || defaultColor,
                                })
                            ),
                        },
                    ],
                },
            ],
        };
    }

    private getTrackFromGroupedFeature(feature: GroupedFeature): Track {
        return {
            id: getId(feature.name),
            label: feature.name,
            labelType: "text" as const,
            data: feature.items.map((item, idx) => {
                const itemKey = item.name.toLowerCase();
                const track = protvistaConfig.tracks[itemKey];

                return {
                    accession: item.name + "-" + idx,
                    type: getName(item.name),
                    label: track?.label || getName(item.name),
                    labelTooltip: track?.tooltip || getName(item.name),
                    shape: protvistaConfig.shapeByTrackName[itemKey] || "circle",
                    locations: [
                        {
                            fragments: item.items.map(
                                (item): Fragment => ({
                                    start: parseInt(item.begin),
                                    end: parseInt(item.end),
                                    description: item.description,
                                    color: protvistaConfig.tracks[itemKey]?.color || defaultColor,
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
                  id: getId(mapping.track_name),
                  label: getName(mapping.track_name),
                  labelType: "text",
                  data: mappingTracks.map(track => ({
                      accession: getName(track.name),
                      type: track.items[0].type,
                      label: getName(track.name),
                      labelTooltip: track.items[0].description,
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
}

function getId(name: string): string {
    return name.replace(/[^\w]/g, "-");
}

function get<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url }); //.flatMapError -> chainRej;
}

interface Data {
    features: Features;
    covidAnnotations: Cv19Annotations;
    pdbAnnotations: PdbAnnotations;
    ebiVariation: EbiVariation;
    coverage: Coverage;
    //bioMuta: EbiVariation;
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

const defaultColor = "#777";
