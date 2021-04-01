import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence as DomainEvidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { getEvidenceFromSources, ApiEvidenceSource } from "../entities/ApiEvidenceSource";
import {
    getPhosphiteEvidencesFromFeature,
    PhosphositeUniprot,
    PhosphositeUniprotItem,
} from "./phosphite";

const mapping: Record<string, SubtrackDefinition> = {
    REGION: subtracks.regions,
    COILED: subtracks.coiledCoils,
    CARBOHYD: subtracks.glycosylation,
    CHAIN: subtracks.chain,
    DISULFID: subtracks.disulfideBond,
    DOMAIN: subtracks.prositeDomain,
    HELIX: subtracks.helix,
    MOTIF: subtracks.motifs,
    MUTAGEN: subtracks.mutagenesis,
    SIGNAL: subtracks.signalPeptide,
    SITE: subtracks.otherStructuralRelevantSites,
    STRAND: subtracks.betaStrand,
    TOPO_DOM: subtracks.cytolosic,
    TRANSMEM: subtracks.transmembraneRegion,
    TURN: subtracks.turn,
    // VARIANT
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
    source?: ApiEvidenceSource;
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
            const subtrack = mapping[feature.type];
            if (!subtrack) {
                console.debug(`Unprocessed type: ${feature.type}`);
                return;
            }

            return {
                subtrack,
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
        .map(([code, apiEvidencesForCode]) =>
            getEvidenceFromSources({
                accession: protein,
                code,
                sourceEvidences: _.compact(
                    apiEvidencesForCode.map(apiEvidence => apiEvidence.source)
                ),
            })
        )
        .compact()
        .concat(getPhosphiteEvidencesFromFeature({ protein, feature, phosphositeByInterval }))
        .value();
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
