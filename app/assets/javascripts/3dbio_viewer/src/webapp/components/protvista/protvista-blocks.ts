import _ from "lodash";
import i18n from "../../utils/i18n";
import { BasicInfoViewer } from "../BasicInfoViewer";
import { trackDefinitions as tracks } from "../../../domain/definitions/tracks";
import { BlockDef } from "./Protvista.types";
import { profiles } from "../../../domain/entities/Profile";
import { ProtvistaPdbValidation } from "./ProtvistaPdbValidation";
import { IDRViewerBlock } from "../idr/IDRViewerBlock";
import { BasicInfoEntry } from "../BasicInfoEntry";
import { ChainInfoViewer } from "../ChainInfoViewer";

export const blockDefs: BlockDef[] = [
    {
        id: "basicInfo",
        title: i18n.t("Basic information of the molecule assembly"),
        description: "",
        help: i18n.t(
            "This section contains the basic information about the molecular complex that you can visualize on the left viewer. This molecule may be constituted by one or several protein chains, as well as nucleic acids and ligands. By selecting one of the protein chains, you can check their associated feature annotations on the right side screen. Feature annotations associated to the first chain (A) are shown by default."
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
        isSubtitle: false,
    },
    {
        id: "basicInfoEntry",
        title: i18n.t("Basic information of the entry"),
        description: "",
        help: "",
        tracks: [],
        component: BasicInfoEntry,
        profiles: [
            profiles.structural,
            profiles.validation,
            profiles.drugDesign,
            profiles.biomedicine,
            profiles.omics,
        ],
        isSubtitle: false,
    },
    {
        id: "featureAnnotation",
        title: i18n.t(`Feature annotations of the chain \${chainWithProtein}`),
        description: i18n.t(
            `The chain \${chain} of the molecular complex is the protein \${proteinName} (Uniprot ID \${uniprotId})\${genePhrase}. In the following, the numbered residues of the protein are displayed horizontally. Below the sequence, you can see the tracks showing the most relevant feature annotations of the protein.`
        ),
        help: i18n.t(
            "These features, shown as small boxes correlative to the numbering of the protein residues, have been retrieved from several external databases characterizing proteins functionally or/and structurally.  Please be aware that in some cases the atomic structure may not be completely traced. The actual coverage is reported in the structure coverage track."
        ),
        component: ChainInfoViewer,
        tracks: [],
        profiles: [
            profiles.structural,
            profiles.validation,
            profiles.drugDesign,
            profiles.biomedicine,
            profiles.omics,
        ],
        isSubtitle: false,
    },
    {
        id: "uploadData",
        title: i18n.t("Uploaded data"),
        description: "",
        help: i18n.t("This section contains the annotations in the uploaded data"),
        tracks: [],
        hasUploadedTracks: true,
        profiles: [profiles.general],
        isSubtitle: true,
    },
    {
        id: "structuralInfo",
        title: i18n.t("Structural and functional segments in this protein"),
        description: i18n.t(
            "Structural or functional blocks of the protein sequence of variable length, long as domains or short as motifs, identified both experimentally and by similarity, retrieved from several databases."
        ),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.domains,
            tracks.cellTopology,
            tracks.secondaryStructure,
            tracks.disorderedRegions /* prediction (old: inferred) */,
            tracks.motifs /* Now it's a subtrack in Domains&Sites */,
            tracks.otherRegions /* Coiled coil (D&S), LIPS (D&S), Repeats (D&S), Zinc finger (D&S) */,
        ],
        profiles: [profiles.structural, profiles.drugDesign],
        isSubtitle: true,
    },
    {
        id: "relevantSites",
        title: i18n.t("Relevant sites in the protein"),
        description: i18n.t(
            "Key specific residues of the protein since the map of contacts of these residues make it them essential to preserve the structure and/or the functionality of the protein."
        ),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.sites /* active site (D&S), biding site, nucleotide binding, metal binding */,
        ],
        profiles: [profiles.structural, profiles.drugDesign, profiles.biomedicine],
        isSubtitle: true,
    },
    {
        id: "processing",
        title: i18n.t("Post-translational modifications in the mature protein"),
        description: i18n.t(
            "Post-translational modifications driving to the mature isoform of the protein: Proteolytic processing of signal peptide and polyproteins, as well as chemical modifications of specific residues."
        ),
        help: "",
        tracks: [
            tracks.structureCoverage,
            tracks.proteolyticProcessing /* signal peptide, polyprotein chain	 */,
            tracks.ptm /* All from Phosphite/uniprot PTM */ /* Renamed to Modified residue */,
        ],
        profiles: [profiles.structural, profiles.biomedicine],
        isSubtitle: true,
    },
    {
        id: "mapValidation",
        title: i18n.t("Validation and quality"),
        description: i18n.t(`
        The median local resolution of the protein is \${resolution} Å.

The local resolution values are between \${poorQualityRegionMin} (percentile 25) and \${poorQualityRegionMax} (percentile 75). These regions can be visualized in red in the structure.`),
        help: i18n.t(`This section offers a local resolution analysis and a map-model validation of the reconstructed maps. Different algorithms are used to carriy out this analysis. Also, where possible, a validation of the Cryo-EM maps and the map-model fit will be carried out. For this, methods based on biophysical characteristics of structure (molprobity), refinement methods, showing the residues affected by said processes, and methods, when it is a structure obtained by cryo-EM, of validation of maps and models will be used.

        The resolution bar summarises the local resolution information. The bar represents the rank of the map in the data base. The mouse on the bar shows the consensus local resolution information of the map estimated with blocres, MonoRes and DeepRes. Each local resolution estimation has a median resolution and a interquartile (25-75) range. As loca resolution consensus, we provide the local median resolution of the median value of each estimation, and as dispersion measure, the maximum interquartile range of all of posible combination of the estimated quantiles 25 and quantiles 75.`),
        tracks: [
            tracks.structureCoverage,
            tracks.sequenceInformation,
            tracks.pdbRedo,
            tracks.molprobity,
            tracks.validationLocalResolution,
            tracks.validationMapToModel,
        ],
        component: ProtvistaPdbValidation,
        profiles: [profiles.structural, profiles.validation, profiles.drugDesign],
        isSubtitle: true,
    },
    {
        id: "residueAccessibility",
        title: i18n.t("Residue accessibility to the solvent"),
        description: i18n.t(
            `Percentage of the surface of a specific residue exposed to the solvent according to the spatial arrangement and packaging of the residue in the 3D structure.`
        ),
        help: "",
        tracks: [tracks.structureCoverage, tracks.residueAccessibility],
        profiles: [profiles.drugDesign],
        isSubtitle: true,
    },
    {
        id: "ligandInteraction",
        title: i18n.t("Ligand interaction"),
        description: i18n.t(`
        This section shows ligands observed directly bound to the protein of interest in different experiments and PDB entries. In addittion, we show the ligand binding residues.

        For this protein, we found \${ligandsAndSmallMoleculesCount} different ligands or small molecules.`),
        help: "",
        tracks: [tracks.structureCoverage, tracks.ligands],
        profiles: [profiles.drugDesign, profiles.biomedicine],
        isSubtitle: true,
    },
    {
        id: "bioimageDataStudies",
        title: i18n.t("BioImage Studies"),
        description: "",
        help: i18n.t(
            "This section contains image-based studies that show biological processes and functions related to the molecular complex displayed in the 3D viewer on the left. It includes imaging modalities and experimental approaches such as high-content screening, multi-dimensional microscopy and digital pathology, among others."
        ),
        tracks: [],
        component: IDRViewerBlock,
        profiles: [profiles.drugDesign, profiles.biomedicine],
        isSubtitle: true,
    },
    {
        id: "variants",
        title: i18n.t("Mutagenesis experiments and Variants"),
        description: "",
        help: i18n.t(
            "This section contains information related to [mutagenesis experiments performed on the protein and] mutations found by large-scale sequencing studies and those reviewed by uniprot."
        ),
        tracks: [tracks.structureCoverage, tracks.geneViewer, tracks.mutagenesis, tracks.variants],
        profiles: [profiles.omics, profiles.biomedicine],
        isSubtitle: true,
    },
    // <- Diseases and his relation with the variants
    {
        id: "proteomics",
        title: i18n.t("Proteomics"),
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.peptides],
        profiles: [profiles.omics],
        isSubtitle: true,
    },
    {
        id: "inmunology",
        title: i18n.t("Immunology information"),
        description: "",
        help: "",
        tracks: [tracks.structureCoverage, tracks.epitomes, tracks.antigenicSequence],
        profiles: [profiles.drugDesign, profiles.biomedicine],
        isSubtitle: true,
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
        tracks.cellTopology,
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
    isSubtitle: true,
};
