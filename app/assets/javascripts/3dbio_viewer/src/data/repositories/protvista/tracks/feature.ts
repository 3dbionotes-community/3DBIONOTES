import _ from "lodash";
import { SubtrackId } from "../../../../domain/definitions/tracks";
import { Evidence as DomainEvidence, EvidenceSource } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { getEvidenceText } from "./legacy/TooltipFactory";
import {
    getPhosphiteEvidencesFromFeature,
    PhosphositeUniprot,
    PhosphositeUniprotItem,
} from "./phosphite";

const mapping: Record<string, SubtrackId> = {
    REGION: "regions",
    COILED: "coiled-coils",
    CARBOHYD: "glycosylation",
    CHAIN: "chain",
    DISULFID: "disulfide-bond",
    DOMAIN: "prosite-domain",
    HELIX: "helix",
    MOTIF: "motifs",
    MUTAGEN: "mutagenesis",
    SIGNAL: "signal-peptide",
    SITE: "other-structural-relevant-sites",
    STRAND: "beta-strand",
    TOPO_DOM: "cytolosic",
    TRANSMEM: "transmembrane-region",
    TURN: "turn",
    // VARIANT: {trackId: "",  ""},
};

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

type PhosphositeByInterval = _.Dictionary<PhosphositeUniprotItem[]>;

export function getFeatureFragments(
    protein: string,
    features: Features,
    phosphosite: PhosphositeUniprot | undefined
): Fragments {
    const phosphositeByInterval = _.groupBy(phosphosite, item => [item.start, item.end].join("-"));

    return getFragments(
        features.features,
        (feature): FragmentResult => {
            const subtrackId = mapping[feature.type];
            if (!subtrackId) {
                console.debug(`Unprocessed type: ${feature.type}`);
                return;
            }

            return {
                subtrackId,
                start: feature.begin,
                end: feature.end,
                description: feature.description,
                evidences: getEvidences(protein, feature, phosphositeByInterval),
            };
        }
    );
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
