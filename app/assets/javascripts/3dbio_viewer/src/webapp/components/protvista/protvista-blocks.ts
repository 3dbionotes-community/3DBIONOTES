import _ from "lodash";
import i18n from "../../utils/i18n";
import { BasicInfoViewer } from "../BasicInfoViewer";
import { trackDefinitions as tracks } from "../../../domain/definitions/tracks";
import { BlockDef } from "./Protvista.types";
import { profiles } from "../../../domain/entities/Profile";
import { ProtvistaPdbValidation } from "./ProtvistaPdbValidation";

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
        profiles: [
            profiles.structural,
            profiles.validation,
            profiles.drugDesign,
            profiles.biomedicine,
            profiles.omics,
        ],
    },
    {
        id: "uploadData",
        title: i18n.t("Uploaded data"),
        description: "",
        help: i18n.t("This section contains the annotations in the uploaded data"),
        tracks: [],
        hasUploadedTracks: true,
        profiles: [profiles.general],
    },
    {
        id: "structuralInfo",
        title: "Structural information",
        description: i18n.t(`The protein \${proteinName} has a secondary structure consisting of \${alphaHelices} alpha helices, \${betaSheets} beta sheets and \${turns} turns.

        It contains \${domains} domains known and annotated by the different databases used (PFAM, SMART, Interpro, CATH and Prosite). The consensus domains are:

        Furthermore, this protein contains a transmembrane region, formed by \${transmembraneAlphaHelices} alpha helices, and \${transmembraneExternalRegions} external regions, a larger cytosolic and a smaller external one (\${transmembraneResidues} residues).

        It contains a disordered region \${disorderedRegionRange} and various motifs and regions that are relevant to its function.
        `),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.domains,
            tracks.cellularRegions,
            tracks.secondaryStructure,
            tracks.disorderedRegions /* prediction (old: inferred) */,
            tracks.motifs /* Now it's a subtrack in Domains&Sites */,
            tracks.regions /* The one in Domains&Sites? */,
            tracks.otherRegions /* Coiled coil (D&S), LIPS (D&S), Repeats (D&S), Zinc finger (D&S) */,
        ],
        profiles: [profiles.structural, profiles.drugDesign],
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
        profiles: [profiles.structural, profiles.drugDesign, profiles.biomedicine],
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
        profiles: [profiles.structural, profiles.biomedicine],
    },
    {
        id: "mapValidation",
        title: "Validation",
        description: i18n.t(`
            This section offers a complete validation of the atomic models obtained by different methods. Also, where possible, a validation of the Cryo-EM maps and the map-model fit will be carried out. For this, methods based on biophysical characteristics of structure (molprobity), refinement methods, showing the residues affected by said processes, and methods, when it is a structure obtained by cryo-EM, of validation of maps and models will be used.

            In summary, the mean resolution of the protein is \${resolution} Å.

            There are regions that have a poorer quality, with values between \${poorQualityRegionMin} and \${poorQualityRegionMax}. These regions can be visualized in red in the structure (why is it worse? Is there any possibility of refinement by the user (guide)?)

            Furthermore, there are \${modifiedOrRefinementAminoAcids} amino acids that have been modified or are capable of refinement.

            Pearson correlation, 2-2 scatter, ranking of models according to whether they measure the same, local accuracy graph, comparison with pdb - percentile in similar resolutions and more globally, combination of measurements`),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.sequenceInformation,
            tracks.pdbRedo,
            tracks.molprobity,
            tracks.emValidation,
        ],
        component: ProtvistaPdbValidation,
        profiles: [profiles.structural, profiles.validation, profiles.drugDesign],
    },
    {
        id: "residueAccessibility",
        title: "Residue Accessibility",
        description: i18n.t(`Number of pockets`),
        help: "",
        tracks: [tracks.structureCoverage, tracks.pockets, tracks.residueAccessibility],
        profiles: [profiles.drugDesign],
    },
    {
        id: "proteinInteraction",
        title: "Protein Interaction",
        description: i18n.t(
            "This section shows other proteins observed together with the protein of interest in PDB entries as a interaction network and as a list. In addittion, we show the protein residues that are interacting with the other proteins.\n\nFor this protein, we found ${proteinPartners} different partners."
        ),
        help: "",
        tracks: [tracks.structureCoverage, tracks.ppiViewer, tracks.functionalMappingPpi],
        profiles: [profiles.drugDesign, profiles.biomedicine],
    },
    {
        id: "ligandInteraction",
        title: "Ligand interaction",
        description: i18n.t(`
            This protein interacts with \${proteinInteractsWith} and it could be interact with \${proteinInteractsMoreCount} protein more.`),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.ligands,
            tracks.functionalMappingLigands /* + Pandda, how to show, prefix?*/,
        ],
        profiles: [profiles.drugDesign, profiles.biomedicine],
    },
    // <- Diseases and his relation with the variants
    {
        id: "variants",
        title: "Variants and mutagenesis experiments",
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.geneViewer, tracks.mutagenesis, tracks.variants],
        profiles: [profiles.omics, profiles.biomedicine],
    },
    {
        id: "proteomics",
        title: "Proteomics",
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.peptides],
        profiles: [profiles.omics],
    },
    {
        id: "inmunology",
        title: "Inmunology information",
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.epitomes, tracks.antigenicSequence],
        profiles: [profiles.drugDesign, profiles.biomedicine],
    },
];

export const testblock: BlockDef = {
    id: "testBlock",
    title: "Test Block",
    description: "",
    help: "Test Block",
    tracks: [
        tracks.structureCoverage,
        /*
        tracks.domains,
        tracks.cellularRegions,
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
        tracks.ppiViewer,
        tracks.functionalMappingPpi,
        tracks.ligands,
        tracks.functionalMappingLigands,
        tracks.geneViewer,
        tracks.mutagenesis,
        */
        tracks.variants,
        /*
        tracks.peptides,
        tracks.epitomes,
        tracks.antigenicSequence,
        */
    ],
    profiles: [],
};
