import React from "react";
import _ from "lodash";
import { Pdb } from "../../../domain/entities/Pdb";
import { PdbView, ProtvistaBlock, ProtvistaTrackElement, TrackView } from "./Protvista.types";
import { hasFragments, Track } from "../../../domain/entities/Track";
import { renderToString } from "react-dom/server";
import { Tooltip } from "./Tooltip";
import { recordOf } from "../../../utils/ts-utils";
import i18n from "../../utils/i18n";
import { debugVariable } from "../../../utils/debug";

export type BlockDef = Omit<ProtvistaBlock, "pdbView">;

const blockDefs = recordOf<BlockDef>()({
    structuralInfo: {
        id: "structuralInfo",
        title: "Structural information",
        description: i18n.t(`The protein <name> has a secondary structure consisting of  <number> alpha helices,  <number> beta sheets and  <number> turns.

        It contains  <number> domains known and annotated by the different databases used (PFAM, SMART, Interpro, CATH and Prosite). The consensus domains are:

        Furthermore, this protein contains a transmembrane region, formed by  <number> alpha helices, and <1-2> external regions, a larger cytosolic and a smaller external one ( <number> residues.

        It contains a disordered region <range> and various motifs and regions that are relevant to it functio
        `),
        help: "Some help",
        tracks: [
            "structure-coverage",
            "domains",
            "topology" /* Cellular regions (topology): cytolosic (old: chain), transmembrance region  */,
            "structural-features",
            "disordered-regions" /* prediction (old: inferred) */,
            "motif" /* Now it's a subtrack in Domains&Sites, make it a standalone track with single subtrack*/,
            "regions" /* The one in Domains&Sites? */,
            "other-structural-regions" /* Coiled coil (D&S), LIPS (D&S), Repeats (D&S), Zinc finger (D&S) */,
        ],
    },
    relevantSites: {
        id: "relevantSites",
        title: "Relevant sites",
        description: i18n.t(`
            This section shows the amino acids that are relevant to the function of the protein or in its processing.
        `),
        help: "TODO",
        tracks: [
            "structure-coverage",
            "sites" /* active site (D&S), biding site, nucleotide binding, metal binding */,
        ],
    },
    processing: {
        id: "processing",
        title: "Processing and post-translational modifications",
        description: i18n.t(`
            This section shows the post-translational modifications of the protein in terms of the processing of immature proteins after translation, through the elimination of the signal peptide and the cutting of the different chains that make up the protein.
        `),
        help: "TODO",
        tracks: [
            "structure-coverage",
            "molecule-processing" /* signal peptide, chain */,
            "PTM" /* All from Phosphite/uniprot PTM */,
        ],
    },
    mapValidations: {
        id: "mapValidation",
        title: "Validation",
        description: i18n.t(`
            This section offers a complete validation of the atomic models obtained by different methods. Also, where possible, a validation of the Cryo-EM maps and the map-model fit will be carried out. For this, methods based on biophysical characteristics of structure (molprobity), refinement methods, showing the residues affected by said processes, and methods, when it is a structure obtained by cryo-EM, of validation of maps and models will be used.

            In summary, the mean resolution of the protein is <number> Å.

            There are regions that have a poorer quality, with values between <value> and <value>. These regions can be visualized in red in the structure (why is it worse? Is there any possibility of refinement by the user (guide)?)

            Furthermore, there are <number> amino acids that have been modified or are capable of refinement.

            Pearson correlation, 2-2 scatter, ranking of models according to whether they measure the same, local accuracy graph, comparison with pdb - percentile in similar resolutions and more globally, combination of measurements`),
        help: "Some help",
        tracks: [
            "structure-coverage",
            "sequence-information",
            "pdb-redo",
            "molprobity",
            "em-validation",
        ],
    },
    residueAccessibility: {
        id: "residueAccessibility",
        title: "Residue Accessibility",
        description: i18n.t(`Number of pockets`),
        help: "TODO",
        tracks: ["structure-coverage", "pockets", "residue-accessibility"],
    },
    proteinInteraction: {
        id: "proteinInteraction",
        title: "Protein Interaction",
        description: i18n.t(`Number of pockets`),
        help: "TODO",
        tracks: ["structure-coverage", "functional-mapping-ppi" /* separate: ppi-viewer */],
    },
    ligandInteraction: {
        id: "ligandInteraction",
        title: "Ligand interaction",
        description: i18n.t(`
            This protein interacts with <name> and it could be interact with <number> protein more.`),
        help: "TODO",
        tracks: [
            "structure-coverage",
            "ligands",
            "functional-mapping-ligands" /* + Pandda, how to show, prefix?*/,
        ],
    },
    variants: {
        id: "variants",
        title: "Variants and mutagenesis experiments",
        description: i18n.t(`TODO`),
        help: "TODO",
        tracks: [
            "structure-coverage",
            "gene-view" /* viewer */,
            "mutagenesis-experiments",
            "variants",
        ],
    },
    proteomics: {
        id: "proteomics",
        title: "Proteomics",
        description: i18n.t(`TODO`),
        help: "TODO",
        tracks: ["structure-coverage", "peptides"],
    },
    inmunology: {
        id: "inmunology",
        title: "Inmunology information",
        description: i18n.t(`TODO`),
        help: "TODO",
        tracks: ["structure-coverage", "epitopes", "antigenic-sequence"],
    },
});

export function getBlocks(pdb: Pdb): ProtvistaBlock[] {
    const [tracks1, tracks2] = _.partition(pdb.tracks, track => track.id !== "em-validation");
    debugVariable({ pdb });

    const pdbs = recordOf<Pdb>()({
        main: { ...pdb, tracks: tracks1 },
        validations: { ...pdb, tracks: tracks2, variants: undefined },
    });

    return [
        { ...blockDefs.structuralInfo, pdbView: getPdbView(pdbs.main) },
        { ...blockDefs.mapValidations, pdbView: getPdbView(pdbs.validations) },
    ];
}

export function loadPdbView(elementRef: React.RefObject<ProtvistaTrackElement>, pdbView: PdbView) {
    const protvistaEl = elementRef.current;
    if (!protvistaEl) return;

    protvistaEl.viewerdata = pdbView;

    if (protvistaEl.layoutHelper && !_.isEmpty(pdbView.tracks)) {
        protvistaEl.layoutHelper.hideSubtracks(0);
    }

    // Collapse first track, which is expanded by default
    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });
}

function getPdbView(pdb: Pdb): PdbView {
    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        displayVariants: !!pdb.variants,
        tracks: _.compact(
            pdb.tracks.map(track => {
                const subtracks = getTrackData(pdb.protein.id, track);
                if (_.isEmpty(subtracks)) return null;
                return {
                    ...track,
                    data: subtracks,
                    help: "TODO",
                };
            })
        ),
        variants: pdb.variants
            ? {
                  ...pdb.variants,
                  variants: pdb.variants.variants.map(variant => ({
                      ...variant,
                      tooltipContent: variant.description,
                  })),
              }
            : undefined,
    };
}

function getTrackData(protein: string, track: Track): TrackView["data"] {
    return _.flatMap(track.subtracks, subtrack =>
        hasFragments(subtrack)
            ? [
                  {
                      ...subtrack,
                      help: "TODO",
                      labelTooltip: subtrack.label,
                      locations: subtrack.locations.map(location => ({
                          ...location,
                          fragments: location.fragments.map(fragment => ({
                              ...fragment,
                              tooltipContent: renderToString(
                                  <Tooltip
                                      protein={protein}
                                      subtrack={subtrack}
                                      fragment={fragment}
                                  />
                              ),
                          })),
                      })),
                  },
              ]
            : []
    );
}
