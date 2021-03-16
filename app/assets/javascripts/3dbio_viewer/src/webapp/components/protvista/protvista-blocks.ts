import _ from "lodash";
import i18n from "../../utils/i18n";
import { BasicInfoViewer } from "../BasicInfoViewer";
import { tracksDef as tracks } from "./protvista-tracks";
import { BlockDef } from "./Protvista.types";

export const blockDefs: BlockDef[] = [
    {
        id: "basicInfo",
        title: i18n.t("Basic information"),
        description: "",
        help: i18n.t(
            "This section contains the basic information about the protein structure model that is being visualized, such as the name of the protein, the name of the gene, the organism in which it is expressed, its biological function, the experimental (or computational) method that has allowed knowing the structure and its resolution. Also, if there is a cryo-EM map associated with the model, it will be shown. The IDs of PDB, EMDB (in case of cryo-EM map availability) and Uniprot will be displayed"
        ),
        tracks: [],
        component: BasicInfoViewer,
    },
    {
        id: "structuralInfo",
        title: "Structural information",
        description: i18n.t(`The protein <name> has a secondary structure consisting of  <number> alpha helices,  <number> beta sheets and  <number> turns.

        It contains  <number> domains known and annotated by the different databases used (PFAM, SMART, Interpro, CATH and Prosite). The consensus domains are:

        Furthermore, this protein contains a transmembrane region, formed by  <number> alpha helices, and <1-2> external regions, a larger cytosolic and a smaller external one ( <number> residues.

        It contains a disordered region <range> and various motifs and regions that are relevant to it functio
        `),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.domains,
            tracks.celullarRegions,
            tracks.secondaryStructure,
            tracks.disorderedRegions /* prediction (old: inferred) */,
            tracks.motifs /* Now it's a subtrack in Domains&Sites */,
            tracks.regions /* The one in Domains&Sites? */,
            tracks.otherRegions /* Coiled coil (D&S), LIPS (D&S), Repeats (D&S), Zinc finger (D&S) */,
        ],
    },
    {
        id: "relevantSites",
        title: "Relevant sites",
        description: i18n.t(`
            This section shows the amino acids that are relevant to the function of the protein or in its processing.
        `),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.sites /* active site (D&S), biding site, nucleotide binding, metal binding */,
        ],
    },
    {
        id: "processing",
        title: "Processing and post-translational modifications",
        description: i18n.t(`
            This section shows the post-translational modifications of the protein in terms of the processing of immature proteins after translation, through the elimination of the signal peptide and the cutting of the different chains that make up the protein.
        `),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.molecularProcessing /* signal peptide, chain */,
            tracks.ptm /* All from Phosphite/uniprot PTM */,
        ],
    },
    {
        id: "mapValidation",
        title: "Validation",
        description: i18n.t(`
            This section offers a complete validation of the atomic models obtained by different methods. Also, where possible, a validation of the Cryo-EM maps and the map-model fit will be carried out. For this, methods based on biophysical characteristics of structure (molprobity), refinement methods, showing the residues affected by said processes, and methods, when it is a structure obtained by cryo-EM, of validation of maps and models will be used.

            In summary, the mean resolution of the protein is <number> Å.

            There are regions that have a poorer quality, with values between <value> and <value>. These regions can be visualized in red in the structure (why is it worse? Is there any possibility of refinement by the user (guide)?)

            Furthermore, there are <number> amino acids that have been modified or are capable of refinement.

            Pearson correlation, 2-2 scatter, ranking of models according to whether they measure the same, local accuracy graph, comparison with pdb - percentile in similar resolutions and more globally, combination of measurements`),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.sequenceInformation,
            tracks.pdbRedo,
            tracks.molprobity,
            tracks.emValidation,
        ],
    },
    {
        id: "residueAccessibility",
        title: "Residue Accessibility",
        description: i18n.t(`Number of pockets`),
        help: "",
        tracks: [tracks.structureCoverage, tracks.pockets, tracks.residueAccessibility],
    },
    {
        id: "proteinInteraction",
        title: "Protein Interaction",
        description: i18n.t(
            "This section shows other proteins observed together with the protein of interest in PDB entries as a interaction network and as a list. In addittion, we show the protein residues that are interacting with the other proteins.\n\nFor this protein, we found <number> different partners."
        ),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.ppiViewer,
            tracks.functionalMappingPpi /* separate: ppi-viewer */,
        ],
    },
    {
        id: "ligandInteraction",
        title: "Ligand interaction",
        description: i18n.t(`
            This protein interacts with <name> and it could be interact with <number> protein more.`),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.ligands,
            tracks.functionalMappingLigands /* + Pandda, how to show, prefix?*/,
        ],
    },
    {
        id: "variants",
        title: "Variants and mutagenesis experiments",
        description: "",
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.geneView /* viewer */,
            tracks.mutagenesisExperiments,
            tracks.variants,
        ],
    },
    {
        id: "proteomics",
        title: "Proteomics",
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.peptides],
    },
    {
        id: "inmunology",
        title: "Inmunology information",
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.epitomes, tracks.antigenicSequence],
    },
];

export const allTracksBlock: BlockDef = {
    id: "allTracksBlock",
    title: "All Tracks Block",
    description: "Show all tracks in single protvista viewer",
    help: "Help message",
    tracks: [
        tracks.structureCoverage,
        tracks.domains,
        tracks.celullarRegions,
        tracks.secondaryStructure,
        tracks.disorderedRegions,
        tracks.motifs,
        tracks.regions,
        tracks.otherRegions,
        tracks.sites,
        tracks.molecularProcessing,
        tracks.ptm,
        tracks.sequenceInformation,
        tracks.pdbRedo,
        tracks.molprobity,
        tracks.emValidation,
        tracks.pockets,
        tracks.residueAccessibility,
        // tracks.ppiViewer,
        tracks.functionalMappingPpi,
        tracks.ligands,
        tracks.functionalMappingLigands,
        tracks.geneView,
        tracks.mutagenesisExperiments,
        tracks.variants,
        tracks.peptides,
        tracks.epitomes,
        tracks.antigenicSequence,
    ],
};
