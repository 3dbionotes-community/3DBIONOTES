import _ from "lodash";
import { getFragment } from "../../../../domain/entities/Fragment";
import { Evidence as DomainEvidence, EvidenceSource } from "../../../../domain/entities/Evidence";
import { Subtrack, Track } from "../../../../domain/entities/Track";
import { config, getColorFromString, getShapeFromString, getTrack } from "../config";
import { getId, getName } from "../utils";
import { getEvidenceText } from "./legacy/TooltipFactory";
import {
    getPhosphiteEvidencesFromFeature,
    PhosphositeUniprot,
    PhosphositeUniprotItem,
} from "./phosphite";
import { SubtrackId, TrackId } from "../../../../webapp/components/protvista/protvista-tracks";

export interface Features {
    accession: string;
    entryName: string;
    sequence: string;
    sequenceChecksum: string;
    taxid: number;
    features: Feature[];
}

export interface Feature {
    ftId: string;
    type: FeatureType;
    category: string;
    description: string;
    begin: string;
    end: string;
    molecule: string;
    evidences?: Evidence[];
}

type FeatureType = string;

interface Evidence {
    code: string;
    source?: {
        name: string;
        id: string;
        url: string;
        alternativeUrl?: string;
    };
}

export interface GroupedFeature {
    name: string;
    items: {
        name: string;
        items: Feature[];
    }[];
}

type PhosphositeByInterval = _.Dictionary<PhosphositeUniprotItem[]>;

export function getTrackFromFeatures(
    features: Features,
    phosphosite: PhosphositeUniprot | undefined
): Track[] {
    const groupedFeatures = features ? getGroupedFeatures(features) : [];
    const phosphositeByInterval = _.groupBy(phosphosite, item => [item.start, item.end].join("-"));
    return groupedFeatures.map(groupedFeature =>
        getTrackFromGroupedFeature(features.accession, groupedFeature, phosphositeByInterval)
    );
}

function getTrackFromGroupedFeature(
    protein: string,
    feature: GroupedFeature,
    phosphositeByInterval: PhosphositeByInterval
): Track {
    return {
        id: getId(feature.name),
        label: feature.name,
        subtracks: feature.items.map(
            (item, idx): Subtrack => {
                const itemKey = item.name.toLowerCase();
                const track = getTrack(itemKey);

                return {
                    accession: item.name + "-" + idx,
                    type: item.name,
                    label: track?.label || getName(item.name),
                    labelTooltip: track?.tooltip || getName(item.name),
                    shape: getShapeFromString(itemKey, "circle"),
                    locations: [
                        {
                            fragments: _.flatMap(item.items, feature =>
                                getFragment({
                                    id: feature.ftId,
                                    type: feature.type,
                                    start: feature.begin,
                                    end: feature.end,
                                    description: feature.description,
                                    evidences: getEvidences(
                                        protein,
                                        feature,
                                        phosphositeByInterval
                                    ),
                                    color: getColorFromString(itemKey),
                                })
                            ),
                        },
                    ],
                };
            }
        ),
    };
}

function getEvidences(
    protein: string,
    feature: Feature,
    phosphositeByInterval: PhosphositeByInterval
): DomainEvidence[] {
    return _(feature.evidences || getDefaultEvidences(protein, feature))
        .groupBy(apiEvidence => apiEvidence.code)
        .toPairs()
        .map(([code, apiEvidencesForCode]) => getEvidence(protein, code, apiEvidencesForCode))
        .compact()
        .concat(getPhosphiteEvidencesFromFeature({ protein, feature, phosphositeByInterval }))
        .value();
}

function getEvidence(
    protein: string,
    code: string,
    apiEvidences: Evidence[]
): DomainEvidence | undefined {
    const apiSources = _.compact(apiEvidences.map(apiEvidence => apiEvidence.source));
    const evidenceText = getEvidenceText({ accession: protein }, code, apiSources);
    const apiSource = apiSources[0];
    if (!apiSource) return;

    const source: EvidenceSource = {
        name: apiSource.name,
        links: apiSources.map(src => ({ name: src.id, url: src.url })),
    };

    const alternativeSourceLinks = _(apiSources)
        .map(src => (src.alternativeUrl ? { name: src.id, url: src.alternativeUrl } : null))
        .compact()
        .value();

    const alternativeSource: EvidenceSource | undefined = _.isEmpty(alternativeSourceLinks)
        ? undefined
        : {
              name: apiSource.name === "PubMed" ? "EuropePMC" : source.name,
              links: alternativeSourceLinks,
          };

    return { title: evidenceText, source: source, alternativeSource };
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

const mapping: Record<string, { trackId: TrackId; subtrackId: SubtrackId }> = {
    REGION: { trackId: "regions", subtrackId: "regions" },
    COILED: { trackId: "other-structural-regions", subtrackId: "coiled-coils" },
    CARBOHYD: { trackId: "ptm", subtrackId: "glycosylation" },
    CHAIN: { trackId: "molecular-processing", subtrackId: "chain" },
    DISULFID: { trackId: "ptm", subtrackId: "disulfide-bond" },
    DOMAIN: { trackId: "domains-and-sites", subtrackId: "prosite-domain" },
    HELIX: { trackId: "structural-features", subtrackId: "helix" },
    MOTIF: { trackId: "motifs", subtrackId: "motifs" },
    MUTAGEN: { trackId: "mutagenesis", subtrackId: "mutagenesis" },
    SIGNAL: { trackId: "molecular-processing", subtrackId: "signal-peptide" },
    SITE: { trackId: "sites", subtrackId: "other-structural-relevant-sites" },
    STRAND: { trackId: "structural-features", subtrackId: "beta-strand" },
    TOPO_DOM: { trackId: "topology", subtrackId: "cytolosic" },
    TRANSMEM: { trackId: "topology", subtrackId: "transmembrane-region" },
    TURN: { trackId: "structural-features", subtrackId: "turn" },
    // VARIANT: {trackId: "", subtrackId: ""},
};

/* From extendProtVista/add_evidences.js */

const uniprotLink: Record<FeatureType, string> = {
    DOMAINS_AND_SITES: "family_and_domains",
    MOLECULE_PROCESSING: "ptm_processing",
    DOMAIN: "domainsAnno_section",
    REGION: "Region_section",
    BINDING: "sitesAnno_section",
    PROPEP: "peptides_section",
    CHAIN: "peptides_section",
    CARBOHYD: "aaMod_section",
    DISULFID: "aaMod_section",
    MOD_RES: "aaMod_section",
    CROSSLNK: "aaMod_section",
    LIPID: "aaMod_section",
    CONFLICT: "Sequence_conflict_section",
    NP_BIND: "regionAnno_section",
    MOTIF: "Motif_section",
    REPEAT: "domainsAnno_section",
    METAL: "sitesAnno_section",
    DNA_BIND: "regionAnno_section",
    SITE: "Site_section",
    SIGNAL: "sitesAnno_section",
    ACT_SITE: "sitesAnno_section",
};

function getDefaultEvidences(protein: string, feature: Feature): Evidence[] {
    const type = uniprotLink[feature.type];
    const url = `http://www.uniprot.org/uniprot/${protein}#${type || ""}`;
    const evidence: Evidence = {
        code: "Imported information",
        source: { name: "Imported from UniProt", id: protein, url },
    };

    return [evidence];
}
