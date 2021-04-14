import { config } from "../../data/repositories/protvista/config";
import { recordOf } from "../../utils/ts-utils";
import { SubtrackDefinition } from "../entities/TrackDefinition";
import i18n from "../utils/i18n";

const shapes = config.shapeByTrackName;
const colors = config.colorByTrackName;

export const subtracks = recordOf<SubtrackDefinition>()({
    // Structure coverage
    structureCoverage: {
        id: "structure-coverage" as const,
        name: i18n.t("Structure Coverage"),
        description: i18n.t("Coverage of the sequence shown with the primary protein sequence"),
    },

    // Domains
    prositeDomain: {
        id: "prosite-domain" as const,
        source: "Prosite db",
        name: i18n.t("Prosite domain"), // (domain in domain & sites)
        color: colors.domain,
        description: i18n.t(
            "Information collected from the Prosite database. PROSITE consists of documentation entries describing protein domains, families and functional sites, as well as associated patterns and profiles to identify them, using  multiple sequence alignments. Prosite profiles may be less sensitive, as they are intended to cover domains along their entire length with the best possible alignment and obtain an accurate functional characterization"
        ),
    },
    pfamDomain: {
        id: "pfam-domain" as const,
        name: i18n.t("Pfam domains"), // (domain families)
        source: "Pfam db",
        color: colors.pfam_domain,
        description: i18n.t(
            "Information collected from the Pfam database. The Pfam database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models (HMMs)"
        ),
    },
    smartDomains: {
        id: "smart-domains" as const,
        name: i18n.t("Smart domains"), // (domain families)
        source: "Smart db",
        color: colors.smart_domain,
        description: i18n.t(
            "Information collected from the SMART database. The SMART (Simple Modular Architecture Research Tool) compiles genetically mobile domains and domain architectures"
        ),
    },
    interproDomains: {
        id: "interpro-domains" as const,
        name: i18n.t("Interpro domains"), // (domain families)
        source: "Interpro db",
        color: "#A0A0FF",
        description: i18n.t(
            "Information collected from the InterPro database. The InterPro database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models"
        ),
    },
    cathDomains: {
        id: "cath-domains" as const,
        name: i18n.t("CATH domains"),
        source: "Cath db",
        description: i18n.t(
            "Information collected from the CATH database. The CATH database provides hierarchical classification of protein domains based on their folding patterns and evolutionary relationship"
        ),
    },

    // Celullar Regions
    cytolosic: {
        id: "cytolosic" as const,
        name: i18n.t("Cytolosic/Extracellular region"),
        color: colors.topo_dom,
        source: "Uniprot",
    },
    transmembraneRegion: {
        id: "transmembrane-region" as const,
        name: i18n.t("Transmembrane region"),
        source: "Uniprot",
        description: i18n.t("Region of the protein embedded in cell membranes"),
        color: colors.transmem,
    },

    // Secondary structure
    helix: {
        id: "helix" as const,
        name: i18n.t("Helix"),
        source: "Uniprot",
        color: colors.helix,
        isBlast: false,
    },
    betaStrand: {
        id: "beta-strand" as const,
        name: i18n.t("Beta strand"),
        source: "Uniprot",
        color: colors.strand,
        isBlast: false,
    },
    turn: {
        id: "turn" as const,
        name: i18n.t("Turn"),
        source: "Uniprot",
        color: colors.turn,
        isBlast: false,
    },

    // Disordered regions
    prediction: {
        id: "prediction" as const,
        name: i18n.t("Prediction"),
        source: "DIBS",
        description: i18n.t(
            "Disordered Binding Site (DIBS) database is a large repository for protein complexes that are formed between Intrinsically Disordered"
        ),
    },

    // Motifs
    motifs: {
        id: "motifs" as const,
        name: i18n.t("Motifs"),
        source: "Uniprot",
        description: i18n.t(""),
        color: colors.motif,
    },

    // Regions
    regions: {
        id: "regions" as const,
        name: i18n.t("Regions"),
        source: "Uniprot",
        color: colors.region,
    },

    // Other regions
    coiledCoils: {
        id: "coiled-coils" as const,
        name: i18n.t("Coiled coils"),
        source: "Uniprot",
        color: colors.coiled,
        description: i18n.t(
            "Coiled coils are built by two or more alpha helices that wind around each other to form a supercoil"
        ),
    },
    linearInteractingPeptide: {
        id: "lip" as const,
        name: i18n.t("Linear interacting peptide"),
        source: "Uniprot/MobyDB",
        color: colors.linear_interacting_peptide,
        description: i18n.t(
            "This are regions that interact with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normally located in intrinsically disordered regions (IDRs) of proteins"
        ),
    },
    repeats: {
        id: "repeats" as const,
        name: i18n.t("Repeats"),
        source: "Uniprot",
        color: colors.repeat,
        description: i18n.t(
            "A repeat is any sequence block that appear more than one time in the sequence, either in an identical or a highly similar form"
        ),
    },
    zincFinger: {
        id: "zinc-finger" as const,
        name: i18n.t("Zinc finger"),
        source: "Uniprot",
        color: colors.zn_fing,
        description: i18n.t(
            "Small, functional, independently folded domain that coordinates one or more zinc ions.  It is a structural motifs and hence, it should be inside of motifs annotations. Apply differents colours to represent the differents type of motifs"
        ),
    },

    // Sites
    activeSite: {
        id: "active-site" as const,
        name: i18n.t("Active site"),
        source: "Uniprot",
        color: colors.act_site,
        shape: "circle",
        description: i18n.t("Amino acid(s) directly involved in the activity of an enzyme"),
    },
    bindingSite: {
        id: "binding-site" as const,
        name: i18n.t("Binding site"),
        source: "Uniprot",
        color: colors.binding,
        shape: shapes.binding,
        description: i18n.t(
            "Binding site for any chemical group (co-enzyme, prothetic groups, etc)"
        ),
    },
    nucleotidesBinding: {
        id: "nucleotides-binding" as const,
        name: i18n.t("Nucleotides binding"),
        source: "Uniprot",
        color: colors.np_bind,
        shape: shapes.np_bind,
        description: i18n.t("Binding site for a nucleotides or nucleic acids"),
    },
    metalBinding: {
        id: "metal-binding" as const,
        name: i18n.t("Metal binding"),
        source: "Uniprot",
        description: i18n.t("Binding site for a metal ion"),
        shape: shapes.metal,
        color: colors.metal,
    },
    otherStructuralRelevantSites: {
        id: "other-structural-relevant-sites" as const,
        name: i18n.t("Others structural relevant sites"),
        source: "Uniprot, PhosphoSitePlus",
        description: i18n.t("Binding site for others chemical group"),
        shape: shapes.site,
        color: colors.site,
    },

    // Mollecular processing
    signalPeptide: {
        id: "signal-peptide" as const,
        name: i18n.t("Signal peptide"),
        source: "Uniprot",
        description: i18n.t("N-terminal signal peptide"),
        color: colors.signal,
    },
    chain: {
        id: "chain" as const,
        name: i18n.t("Chain"),
        shape: shapes.chain,
        color: colors.chain,
        source: "Uniprot",
        description: i18n.t(
            "Mature region of the protein. This describes the extension of a polypeptide chain in the mature protein after processing"
        ),
    },

    // PTM
    acetylation: {
        id: "acetylation" as const,
        name: i18n.t("Acetylation"),
        color: colors.mod_res_ace,
        shape: shapes.mod_res_ace,
        source: "Uniprot",
        description: i18n.t(
            "Protein acetylation is one of the major post-translational modifications (PTMs) in eukaryotes, in which the acetyl group from acetyl coenzyme A (Ac-CoA) is transferred to a specific site on a polypeptide chain."
        ),
    },
    disulfideBond: {
        id: "disulfide-bond" as const,
        name: i18n.t("Disulfide Bond"),
        source: "Uniprot",
        color: colors.disulfid,
        shape: shapes.disulfid,
        description: i18n.t(
            "The positions of cysteine residues participating in disulphide bonds."
        ),
        isBlast: false,
    },
    glycosylation: {
        id: "glycosylation" as const,
        name: i18n.t("Glycosylation"),
        source: "Uniprot",
        description: i18n.t("Residues with covalently attached glycan group(s)"),
        color: colors.carbohyd,
        shape: shapes.carbohyd,
    },
    methylation: {
        id: "methylation" as const,
        name: i18n.t("Methylation"),
        source: "PhosphoSitePlus, Uniprot",
        description: i18n.t("Residues with covalently attached methyl group (s)"),
        color: colors.metal,
        shape: shapes.metal,
    },
    modifiedResidue: {
        id: "modified-residue" as const,
        name: i18n.t("Modified residue"),
        source: "Uniprot",
        description: i18n.t("Modified residues with others chemical groups bounded"),
    },
    phosphorylation: {
        id: "phosphorylation" as const,
        name: i18n.t("Phosphorylation"),
        source: "PhosphoSitePlus, Uniprot",
        color: colors.mod_res_pho,
        shape: shapes.mod_res_pho,
        description: i18n.t("Residues with covalently attached phosphoryl groups."),
    },
    ubiquitination: {
        id: "ubiquitination" as const,
        name: i18n.t("Ubiquitination"),
        source: "PhosphoSitePlus, Uniprot",
        color: colors.mod_res_ubi,
        shape: shapes.mod_res_ubi,
        description: i18n.t(
            "Residues with ubiquitin chains. The ubiquitinization process consists of the addition of ubiquitin chains to a protein that has to be degraded."
        ),
    },

    // Sequence information
    compositionalBias: {
        id: "compositional-bias" as const,
        name: i18n.t("Compositional bias"),
        source: "PhosphoSitePlus, Uniprot",
        color: colors.compbias,
        shape: shapes.compbias,
        description: i18n.t(
            "Regions that exhibit compositional bias within the protein. That is, regions where there are over-represented amino acids, which are included in the description of the annotation."
        ),
    },
    sequenceConflict: {
        id: "sequence-conflict" as const,
        name: i18n.t("Sequence conflict"),
        color: colors.conflict,
        shape: shapes.conflict,
        source: "Uniprot",
        description: i18n.t("Sequence discrepancies of unknown origin"),
    },

    // PDB-REDO
    changedRotamers: {
        id: "changed-rotamers" as const,
        name: i18n.t("Changed rotamers"),
        source: "PDB-REDO",
    },
    hBondFlip: {
        id: "h-bond-flip" as const,
        name: i18n.t("H bond flip"),
        source: "PDB-REDO",
    },
    completedResidues: {
        id: "completed-residues" as const,
        name: i18n.t("Completed residues"),
        source: "PDB-REDO",
    },

    // Molprobity
    rotamerOutlier: {
        id: "rotamer-outlier" as const,
        name: i18n.t("Rotamer outlier"),
        source: "Molprobity",
    },
    phiPsiOutliers: {
        id: "phi-psi-outliers" as const,
        name: i18n.t("Phi/Psi outliers"),
        source: "Molprobity",
    },

    // em validation
    deepRes: {
        id: "deep-res" as const,
        name: i18n.t("DeepRes"),
        source: "Local server",
        description: i18n.t(
            "Local quality method of the map based on the detection of 3D characteristics through Deep Learning. This method can be applied to any cryo-EM map and detects subtle changes in local quality after applying isotropic filters or other map processing methods."
        ),
    },
    mapQ: {
        id: "map-q" as const,
        name: i18n.t("MapQ"),
        source: "Local server",
        description: i18n.t(
            "Method that measures the resolubility of individual atoms in cryo-EM maps after having obtained a structural model of the protein under study."
        ),
    },
    fscQ: {
        id: "fsc-q" as const,
        name: i18n.t("FscQ"),
        source: "Local server",
        description: i18n.t(
            "Method that measures the local quality of the fit between the atomic model and the cryo-EM map, being a quantitative measure of how the experimental data supports the structural model"
        ),
    },
    monoRes: {
        id: "mono-res" as const,
        name: i18n.t("MonoRes"),
        source: "Local server",
        description: i18n.t(
            "Local resolution method of the map based on the use of monogenic signals."
        ),
    },

    // Pockets
    pockets: {
        id: "pockets" as const,
        name: i18n.t("Pockets"),
        source: "P2Rank or Kalasanty",
        description: i18n.t(
            "Show the different amino acids that would make up the pocket and show them into the structure (There are prediction methods (P2RANK, DeepSite, etc.) and annotations in the literature, related to the relevant sites in the protein)"
        ),
    },

    // Residue accessibility
    residueAccessibility: {
        id: "residue-accessibility" as const,
        name: i18n.t("Residue accesibility"),
        description: i18n.t(
            "Graph, range of colors in the residues and show the surface of the protein (display mode). Allow download"
        ),
    },

    // PPI Viewer
    proteinNetwork: {
        id: "protein-network" as const,
        name: i18n.t("Protein Network"),
        source: "Interactome 3D, String",
        description: i18n.t(
            "Set of proteins that interact directly with the protein under study. It is shown as a network of interactions."
        ),
    },
    pdbList: {
        id: "pdb-list" as const,
        name: i18n.t(
            "Extensible List of pdbs with interactions or name of differents proteins with the interactions"
        ),
        source: "PDB, Publications",
    },

    // Functional mapping PPI
    functionalMappingPPI: {
        id: "functional-mapping-ppi" as const,
        name: i18n.t("Functional mapping ppi"),
        description: i18n.t(
            "Residues that participate in the interaction between the different proteins. Only available for covid 19 related proteins"
        ),
        source: {
            icon: "http://draco.cs.wpi.edu/wuhan/favicon.ico",
            url: "http://draco.cs.wpi.edu/wuhan/",
        },
    },

    // Ligands
    ligands: {
        id: "ligands" as const,
        name: i18n.t("Extensible List of ligands with interactions with the protein"),
        source: "PDB, Publications",
        description: i18n.t(""),
    },

    // Functional mapping ligands
    functionalMappingLigands: {
        id: "functional-mapping-ligands" as const,
        name: i18n.t("Functional mapping ligands"),
        source: {
            url: "http://draco.cs.wpi.edu/wuhan/",
            icon: "http://draco.cs.wpi.edu/wuhan/favicon.icon",
        },
        description: i18n.t("Combined with the following one. Common names or both tags"),
    },
    panddaDrugScreeningDiamong: {
        id: "pandda-drug-screening-diamond" as const,
        name: i18n.t("Pandda drug screening diamond"),
        source: "https://www.diamond.ac.uk/covid-19/for-scientists/",
    },

    // Gene view
    geneViewer: {
        id: "gene" as const,
        name: i18n.t("Gene"),
        source: "Ensembl",
        description: i18n.t(
            "Gene panel to visualize the different transcripts (exons and introns)"
        ),
    },

    // Mutagenesis
    mutagenesis: {
        id: "mutagenesis" as const,
        name: i18n.t("Mutagenesis"),
        source: "Uniprot",
        description: i18n.t("Residues which has been experimentally altered by mutagenesis"),
        color: colors.mutagen,
        shape: shapes.mutagen,
    },

    // Peptides
    uniquePeptide: {
        id: "unique-peptide" as const,
        name: i18n.t("Unique peptide"),
        source: "Uniprot",
        description: i18n.t(
            "Unique peptides are those that only belong to the group of genes that encode the protein"
        ),
    },
    nonUniquePeptide: {
        id: "non-unique-peptide" as const,
        name: i18n.t("Non unique peptide"),
        source: "Uniprot",
        description: i18n.t(
            "Non-unique peptides are those that have been identified for several proteins and, therefore, for 2 or more different groups of genes"
        ),
    },

    // Epitomes
    linearEpitomesN: {
        id: "linear-epitope-n" as const,
        name: i18n.t("Linear epitope 1, 2, 3, 4, 5"),
        description: i18n.t("Different entries from IEDB"),
    },
    linearEpitomes: {
        id: "linear-epitope" as const,
        name: i18n.t("Linear epitope"),
        source: "IEDB",
    },

    // Antigenic sequence
    abBindingSequence: {
        id: "ab-binding-sequence" as const,
        name: i18n.t("Ab binding sequence"),
        source: "Uniprot - HPA",
    },
});
