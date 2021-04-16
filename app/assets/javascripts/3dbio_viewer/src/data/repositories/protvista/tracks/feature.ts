import _ from "lodash";
import { subtracks } from "../../../../domain/definitions/subtracks";
import { Evidence as DomainEvidence } from "../../../../domain/entities/Evidence";
import { FragmentResult, Fragments, getFragments } from "../../../../domain/entities/Fragment2";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { getEvidenceFromDefaultSources, ApiEvidence } from "../entities/ApiEvidenceSource";
import { getPtmSubtrackFromDescription } from "./db-ptm";

// Example: https://www.ebi.ac.uk/proteins/api/features/O14920

const mapping: Record<string, SubtrackDefinition> = {
    ACT_SITE: subtracks.activeSite,
    BINDING: subtracks.bindingSite,
    CARBOHYD: subtracks.glycosylation,
    CHAIN: subtracks.chain,
    COILED: subtracks.coiledCoils,
    COMPBIAS: subtracks.compositionalBias,
    CONFLICT: subtracks.sequenceConflict,
    DISULFID: subtracks.disulfideBond,
    DOMAIN: subtracks.prositeDomain,
    HELIX: subtracks.helix,
    METAL: subtracks.metalBinding,
    // MOD_RES -> PTM subtracks, use ptmMappingFromDescription
    MOTIF: subtracks.motifs,
    MUTAGEN: subtracks.mutagenesis,
    NP_BIND: subtracks.nucleotidesBinding,
    REGION: subtracks.regions,
    REPEAT: subtracks.repeats,
    SIGNAL: subtracks.signalPeptide,
    SITE: subtracks.otherStructuralRelevantSites,
    STRAND: subtracks.betaStrand,
    TOPO_DOM: subtracks.cytolosic,
    TRANSMEM: subtracks.transmembraneRegion,
    TURN: subtracks.turn,
    ZN_FING: subtracks.zincFinger,
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
    alternativeSequence?: string;
    evidences?: ApiEvidence[];
}

type FeatureType = string;

export function getFeatureFragments(protein: string, features: Features): Fragments {
    return getFragments(
        features.features,
        (feature): FragmentResult => {
            const subtrack = getSubtrackFromFeature(feature);

            if (!subtrack) {
                console.debug(`Unprocessed type: ${feature.type}`);
                return;
            }

            return {
                id: feature.ftId,
                subtrack,
                start: feature.begin,
                end: feature.end,
                description: feature.description,
                evidences: getEvidences({ protein, feature }),
                alternativeSequence: feature.alternativeSequence,
            };
        }
    );
}

function getSubtrackFromFeature(feature: Feature): SubtrackDefinition | undefined {
    if (feature.type === "MOD_RES") {
        return getPtmSubtrackFromDescription(feature.description) || subtracks.modifiedResidue;
    } else {
        return mapping[feature.type];
    }
}

function getEvidences(options: { protein: string; feature: Feature }): DomainEvidence[] {
    const { protein, feature } = options;

    return _(feature.evidences || [getDefaultEvidence(protein, feature)])
        .groupBy(apiEvidence => apiEvidence.code)
        .toPairs()
        .map(([code, apiEvidencesForCode]) =>
            getEvidence(feature, protein, code, apiEvidencesForCode)
        )
        .compact()
        .value();
}

function getEvidence(
    feature: Feature,
    protein: string,
    code: string,
    apiEvidencesForCode: ApiEvidence[]
) {
    const defaultEvidence = getDefaultEvidence(protein, feature);

    const sourceEvidences = _(apiEvidencesForCode)
        .map(apiEvidence => ({ ...defaultEvidence, ...apiEvidence }.source))
        .compact()
        .value();

    return getEvidenceFromDefaultSources({ accession: protein, code, sourceEvidences });
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

function getDefaultEvidence(protein: string, feature: Feature): ApiEvidence {
    const type = uniprotLink[feature.type];
    const url = `http://www.uniprot.org/uniprot/${protein}#${type || ""}`;

    return {
        code: "Imported information",
        source: { name: "Imported from UniProt", id: protein, url },
    };
}
