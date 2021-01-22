import _ from "lodash";
import { AxiosRequestConfig } from "axios";
import { FutureData } from "../../../domain/entities/FutureData";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbRepository } from "../../../domain/repositories/PdbRepository";
import { Future } from "../../../utils/future";
import { AxiosBuilder, axiosRequest } from "../../../utils/future-axios";
import { config as protvistaConfig, getColorFromString } from "../protvista-config";
import { addToTrack, Subtrack, Track } from "../../../domain/entities/Track";
import { Fragment } from "../../../domain/entities/Fragment";
import { debugVariable } from "../../../utils/debug";
import {
    GroupedFeature,
    Cv19Annotation,
    Features,
    EbiVariation,
    Cv19Annotations,
    PdbAnnotations,
    Coverage,
    MobiUniprot,
} from "../PdbRepositoryNetwork.types";
import { getEmValidationTrack } from "../em-validation";
import { getId, getName } from "../utils";
import { getVariants } from "../variants";
import { addPhosphiteSubtracks, PhosphositeUniprot } from "../phosphite";
import { getDomainFamiliesTrack, PfamAnnotations } from "../domain-families";

interface Data {
    features: Features;
    covidAnnotations?: Cv19Annotations;
    pdbAnnotations?: PdbAnnotations;
    ebiVariation: EbiVariation;
    coverage: Coverage;
    mobiUniprot?: MobiUniprot;
    phosphositeUniprot?: PhosphositeUniprot;
    pfamAnnotations?: PfamAnnotations;
}

interface Options {
    protein: string;
    pdb: string;
    chain: string;
}

export class PdbRepositoryNetwork implements PdbRepository {
    get(options: Options): FutureData<Pdb> {
        // TODO: Get protein from pdb
        return getData(options).map(data => this.getPdb(data));
    }

    getPdb(data: Data): Pdb {
        debugVariable(data);
        const {
            features,
            covidAnnotations,
            ebiVariation,
            pdbAnnotations,
            coverage,
            mobiUniprot,
            phosphositeUniprot,
            pfamAnnotations,
        } = data;

        const variants = ebiVariation ? getVariants(ebiVariation) : undefined;
        const mapping = covidAnnotations ? covidAnnotations[0] : undefined;
        const functionalMappingTrack = this.getFunctionalMappingTrack(mapping);
        const emValidationTrack = pdbAnnotations ? getEmValidationTrack(pdbAnnotations) : null;
        const structureCoverageTrack = coverage ? this.getStructureCoverageTrack(coverage) : null;
        const domainFamiliesTrack = pfamAnnotations
            ? getDomainFamiliesTrack(pfamAnnotations)
            : null;

        const tracks1: Track[] = _.compact([
            functionalMappingTrack,
            ...this.getTrackFromFeatures(features),
            emValidationTrack,
            domainFamiliesTrack,
            structureCoverageTrack,
        ]);

        const tracks2 = addToTrack({
            tracks: tracks1,
            trackInfo: { id: "domains-and-sites", label: "Domains & sites" },
            subtracks: this.getMobiUniprotSubtracks(mobiUniprot),
        });

        const tracks = addPhosphiteSubtracks(tracks2, phosphositeUniprot);

        return {
            sequence: features ? features.sequence : "TODO",
            length: this.getTotalFeaturesLength(tracks),
            tracks,
            variants,
        };
    }

    private getTotalFeaturesLength(tracks: Track[]): number {
        return (
            _(tracks)
                .flatMap(track => track.subtracks)
                .flatMap(subtrack => subtrack.locations)
                .flatMap(location => location.fragments)
                .map(fragment => fragment.end)
                .max() || 0
        );
    }

    getTrackFromFeatures(features: Features): Track[] {
        const groupedFeatures = features ? this.getGroupedFeatures(features) : [];
        return groupedFeatures.map(groupedFeature =>
            this.getTrackFromGroupedFeature(groupedFeature)
        );
    }

    getMobiUniprotSubtracks(mobiUniprot: MobiUniprot | undefined): Subtrack[] {
        if (!mobiUniprot) return [];

        const fragments = _(mobiUniprot.lips)
            .values()
            .flatten()
            .map(
                (obj): Fragment => ({
                    start: obj.start,
                    end: obj.end,
                    description: "TODO",
                    color: "#cc2060", // TODO: Missing in config
                })
            )
            .value();

        const subtrack: Subtrack = {
            type: "LINEAR_INTERACTING_PEPTIDE",
            accession: "LIPS",
            shape: "rectangle",
            locations: [{ fragments }],
            label: "Linear interacting peptide",
        };

        return [subtrack];
    }

    private getStructureCoverageTrack(coverage: Coverage): Track {
        const itemKey = "region";
        const trackConfig = protvistaConfig.tracks[itemKey];
        const name = "Region";

        return {
            id: "structure-coverage",
            label: "Structure coverage",
            subtracks: [
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
                                    color: getColorFromString(itemKey),
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
            subtracks: feature.items.map((item, idx) => {
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
                                    color: getColorFromString(itemKey),
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
                  subtracks: mappingTracks.map(track => ({
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

function getOrEmpty<Data>(url: string): Future<RequestError, Data | undefined> {
    const data$ = get<Data>(url) as Future<RequestError, Data | undefined>;

    return data$.flatMapError(_err => {
        console.log(`Cannot get data: ${url}`);
        return Future.success(undefined);
    });
}

type DataRequests = { [K in keyof Data]-?: Future<RequestError, Data[K]> };

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

function getData(options: Options): FutureData<Data> {
    const bionotesUrl = "http://3dbionotes.cnb.csic.es";
    const { protein, pdb, chain } = options;

    const data$: DataRequests = {
        features: get(`https://www.ebi.ac.uk/proteins/api/features/${protein}`),
        covidAnnotations: getOrEmpty(`${bionotesUrl}/cv19_annotations/${protein}_annotations.json`),
        pdbAnnotations: getOrEmpty(
            `${bionotesUrl}/ws/lrs/pdbAnnotFromMap/all/${pdb}/${chain}/?format=json`
        ),
        ebiVariation: get(`https://www.ebi.ac.uk/proteins/api/variation/${protein}`),
        coverage: get(`${bionotesUrl}/api/alignments/Coverage/${pdb}${chain}`),
        mobiUniprot: getOrEmpty(`${bionotesUrl}/api/annotations/mobi/Uniprot/${protein}`),
        phosphositeUniprot: getOrEmpty(
            `${bionotesUrl}/api/annotations/Phosphosite/Uniprot/${protein}`
        ),
        pfamAnnotations: getOrEmpty(`${bionotesUrl}/api/annotations/Pfam/Uniprot/${protein}`),
    };

    const data1$ = Future.join3(data$.features, data$.covidAnnotations, data$.coverage);
    const data2$ = Future.join3(data$.ebiVariation, data$.pdbAnnotations, data$.mobiUniprot);
    const data3$ = Future.join(data$.phosphositeUniprot, data$.pfamAnnotations);

    return Future.join3(data1$, data2$, data3$).map(
        ([
            [features, covidAnnotations, coverage],
            [ebiVariation, pdbAnnotations, mobiUniprot],
            [phosphositeUniprot, pfamAnnotations],
        ]): Data => ({
            features,
            covidAnnotations,
            ebiVariation,
            pdbAnnotations,
            coverage,
            mobiUniprot,
            phosphositeUniprot,
            pfamAnnotations,
        })
    );
}

function get<Data>(url: string): Future<RequestError, Data> {
    return request<Data>({ method: "GET", url });
}
