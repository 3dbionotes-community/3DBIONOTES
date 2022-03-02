import _ from "lodash";
import { Color } from "../../../../domain/entities/Color";
import { Content, InfoItem } from "../../../../domain/entities/InfoItem";
import { ProteinId } from "../../../../domain/entities/Protein";
import {
    KeywordConsequence,
    getTranslations,
    Keyword,
    Variant,
    Variants,
    KeywordSource,
    urls,
    getVariantFilters,
} from "../../../../domain/entities/Variant";
import i18n from "../../../../domain/utils/i18n";
import { Maybe } from "../../../../utils/ts-utils";
import {
    ApiEvidence,
    ApiEvidenceSource,
    getEvidencesFromApiEvidence,
} from "../entities/ApiEvidenceSource";
import { MutagenesisAnnotation, MutagenesisResponse } from "./mutagenesis";

/*
Example: https://www.ebi.ac.uk/proteins/api/variation/O14920

Logic from:
    - extendProtVista/add_biomuta.js
    - myProtVista/src/VariantFilterDialog.js
*/

export interface EbiVariation {
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

export interface EbiVariationFeature {
    type: "VARIANT";
    alternativeSequence: string; //"L",
    begin: string; //"2",
    end: string; // "2",
    xrefs?: ApiEvidenceSource[];
    evidences?: ApiEvidence[];
    cytogeneticBand?: string;
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
    populationFrequencies: Array<{
        populationName: string;
        frequency: number;
        source: string;
    }>;
    predictions?: Array<{
        predictionValType: string;
        predictorType: string;
        score: number;
        predAlgorithmNameType: string;
        sources: string[];
    }>;
    somaticStatus: number; // 0;
    clinicalSignificances: Array<{
        type: string;
        sources: string[];
    }>;
    sourceType: string; // "large_scale_study" | "mixed" | "uniprot";
}

export type GenomicVariantsCNCBResponse = { features: GenomicVariantsAnnotation[] };

export interface GenomicVariantsAnnotation {
    type: "VARIANT";
    mutationType: string;
    sourceType: KeywordSource;
    mutationEffect: string;
    begin: number;
    end: number;
    wildType: string;
    alternativeSequence: string;
    numberOfViruses: number;
    reportedProtChange: string;
    genomicPosition: number;
    originalGenomic: string;
    newGenomic: string;
    evidenceLevel: string;
    xrefs: ApiEvidenceSource[];
}

const keywordsFromSourceType: Record<string, Keyword[]> = {
    large_scale_study: ["large_scale_studies"],
    uniprot: ["uniprot"],
    mixed: ["uniprot", "large_scale_studies"],
};

const colorByConsequence: Record<KeywordConsequence, Color> = {
    disease: "#FF0000",
    predicted: "#002594", // gradient?
    nonDisease: "#99cc00",
    other: "#FFCC00",
};

interface Info {
    variant: string;
    wildType: string;
    position: number;
}

type Source =
    | { type: "ebi"; info: Info; annotation: EbiVariationFeature }
    | { type: "muta"; info: Info; annotation: MutagenesisAnnotation }
    | { type: "genomic"; info: Info; annotation: GenomicVariantsAnnotation };

export function getVariants(
    ebiVariation: Maybe<EbiVariation>,
    mutagenesis: Maybe<MutagenesisResponse>,
    genomicVariants: Maybe<GenomicVariantsCNCBResponse>,
    proteinId: ProteinId
): Variants {
    const annotations = _.concat<Source>(
        (ebiVariation?.features || []).map(a => ({
            type: "ebi" as const,
            info: {
                variant: a.alternativeSequence,
                wildType: a.wildType,
                position: parseInt(a.begin),
            },
            annotation: a,
        })),
        (mutagenesis || []).map(a => ({
            type: "muta" as const,
            info: { variant: a.variation, wildType: a.original, position: a.start },
            annotation: a,
        })),
        (genomicVariants?.features || []).map(a => ({
            type: "genomic" as const,
            info: { variant: a.alternativeSequence, wildType: a.wildType, position: a.begin },
            annotation: a,
        }))
    );

    const getKey = (obj: Source) => [obj.info.variant, obj.info.position].join("-");

    const annotationsGrouped = _(annotations).groupBy(getKey).values().value();

    return {
        sequence: ebiVariation?.sequence,
        filters: getVariantFilters(),
        variants: annotationsGrouped.map(
            (group): Variant => {
                const mainAnnotation = group[0]!;
                const { variant, position, wildType } = mainAnnotation.info;

                const ebiAnnotation = _(group)
                    .map(o => (o.type === "ebi" ? o.annotation : undefined))
                    .compact()
                    .last();

                const mutaAnnotations = _(group)
                    .map(o => (o.type === "muta" ? o.annotation : undefined))
                    .compact()
                    .value();

                const genomicAnnotation = _(group)
                    .map(o => (o.type === "genomic" ? o.annotation : undefined))
                    .compact()
                    .first();

                const isDisease = !_.isEmpty(mutaAnnotations);
                const consequence = getConsequence({
                    variant,
                    ebiAnnotation,
                    genomicAnnotation,
                    mutaAnnotations,
                });

                return {
                    accession: getKey(mainAnnotation),
                    variant,
                    alternativeSequence: variant,
                    wildType,
                    color: consequence ? colorByConsequence[consequence] : "grey",
                    start: position.toString(),
                    end: position.toString(),
                    association: isDisease ? associationWithDisease : [],
                    keywords: getKeywords({ ebiAnnotation, genomicAnnotation, consequence }),
                    info: getInfo({ proteinId, ebiAnnotation, mutaAnnotations, genomicAnnotation }),
                };
            }
        ),
    };
}

const associationWithDisease = [{ disease: true }];

const sourceTypeFromEbiAnnotation: Record<string, KeywordSource> = {
    uniprot: "uniprot",
    large_scale_study: "large_scale_studies",
    cncb: "cncb",
};

const translations = getTranslations();

function getInfo(options: {
    proteinId: ProteinId;
    ebiAnnotation: Maybe<EbiVariationFeature>;
    mutaAnnotations: MutagenesisAnnotation[];
    genomicAnnotation: Maybe<GenomicVariantsAnnotation>;
}): InfoItem[] {
    const { proteinId, ebiAnnotation, genomicAnnotation, mutaAnnotations } = options;

    const mainAnnotation = genomicAnnotation || ebiAnnotation;

    const sourceType = mainAnnotation
        ? sourceTypeFromEbiAnnotation[mainAnnotation.sourceType]
        : undefined;

    const firstMutation = _.first(mutaAnnotations);

    const mutation = mainAnnotation
        ? { from: mainAnnotation.wildType, to: mainAnnotation.alternativeSequence }
        : firstMutation
        ? { from: firstMutation.original, to: firstMutation.variation }
        : undefined;

    const diseasesAll = mutaAnnotations.map(muta => {
        const diseaseName = _.capitalize(muta.disease.split(" / ").slice(1).join(" / "));
        const polyphenText = (muta.polyphen || "").replace(/\<possibly\>/g, "probably");

        const polyphenLinks = _(muta.evidence)
            .flatMap(evidence => evidence.references)
            .map(reference => reference.split(":", 2)[1])
            .compact()
            .without("null")
            .map(ref => ({ name: ref, url: urls.ncbi(ref) }))
            .concat([{ name: proteinId, url: urls.hive(proteinId) }])
            .value();

        return {
            title: i18n.t("Disease"),
            contents: [
                { text: "", links: [{ name: diseaseName, url: urls.diseases(diseaseName) }] },
                { text: `BioMuta DB - ${polyphenText}`, links: polyphenLinks },
            ],
        };
    });

    const diseases = _.uniqWith(diseasesAll, _.isEqual);
    const evidences = getEvidencesFromApiEvidence(ebiAnnotation?.evidences || [], proteinId);
    const crossReferences = getCrossReferencesAsContents(mainAnnotation?.xrefs);

    return _.compact([
        sourceType
            ? {
                  title: i18n.t("Source"),
                  contents: [{ text: translations.sourceType[sourceType] || sourceType }],
              }
            : null,

        mutation
            ? {
                  title: i18n.t("Variant"),
                  contents: [{ text: `${mutation.from} > ${mutation.to}` }],
              }
            : null,

        !_.isEmpty(evidences)
            ? {
                  title: i18n.t("Evidences"),
                  contents: _.flatMap(evidences, evidence => [
                      { text: evidence.title },
                      ...evidence.sources.map(src => ({ text: src.name, links: src.links })),
                  ]),
              }
            : null,

        ...(!_.isEmpty(crossReferences)
            ? _.compact([
                  genomicAnnotation ? { title: i18n.t("CNCB") } : null,
                  { title: i18n.t("Cross-references"), contents: crossReferences },
              ])
            : []),

        ...(!_.isEmpty(diseases) ? [{ title: i18n.t("Disease Association") }, ...diseases] : []),
    ]);
}

function getCrossReferencesAsContents(xrefs: Maybe<ApiEvidenceSource[]>): Content[] {
    return _(xrefs)
        .groupBy(xref => xref.id)
        .toPairs()
        .map(([xrefId, xrefs]) => ({
            text: xrefId,
            links: xrefs.map(xref => ({ url: "", ...xref })),
        }))
        .value();
}

function getConsequence(options: {
    variant: string;
    ebiAnnotation: Maybe<EbiVariationFeature>;
    genomicAnnotation: Maybe<GenomicVariantsAnnotation>;
    mutaAnnotations: MutagenesisAnnotation[];
}): Maybe<KeywordConsequence> {
    const { variant, ebiAnnotation, genomicAnnotation, mutaAnnotations } = options;
    const mainAnnotation = genomicAnnotation || ebiAnnotation;
    const isDisease = !_.isEmpty(mutaAnnotations);
    const isReviewed = mainAnnotation && ["uniprot", "mixed"].includes(mainAnnotation.sourceType);
    const isOther = variant === "*";

    if (isOther) {
        return "other";
    } else if (isDisease) {
        return "disease";
    } else if (isReviewed) {
        return "nonDisease";
    } else {
        return undefined;
    }
}

function getKeywords(options: {
    ebiAnnotation: Maybe<EbiVariationFeature>;
    genomicAnnotation: Maybe<GenomicVariantsAnnotation>;
    consequence: Maybe<KeywordConsequence>;
}): Keyword[] {
    const { ebiAnnotation, genomicAnnotation, consequence } = options;
    const mainAnnotation = genomicAnnotation || ebiAnnotation;

    const sourceKeywords = mainAnnotation
        ? keywordsFromSourceType[mainAnnotation.sourceType] || []
        : [];

    return _.compact([consequence, genomicAnnotation ? "cncb" : null, ...sourceKeywords]);
}
