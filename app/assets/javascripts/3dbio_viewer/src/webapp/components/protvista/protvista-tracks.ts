import { withOptionalProperties } from "../../../utils/ts-utils";
import i18n from "../../utils/i18n";
import { GeneViewer } from "../gene-viewer/GeneViewer";
import { PPIViewer } from "../ppi/PPIViewer";
import { TrackDefBase } from "./Protvista.types";

type TracksDef = typeof tracksDef;

export type TrackDef = TracksDef[keyof TracksDef];

export type TrackId = TrackDef["id"];

export type SubtrackId = TrackDef["subtracks"][number]["id"];

export const tracksDef = withOptionalProperties<TrackDefBase>()({
    structureCoverage: {
        id: "structure-coverage" as const,
        name: i18n.t("Structure Coverage"),
        description: i18n.t("Coverage of the sequence shown with the primary protein sequence"),
        subtracks: [
            {
                id: "structure-coverage" as const,
                name: i18n.t("Structure Coverage"),
                source: "",
                description: i18n.t(
                    "Coverage of the sequence shown with the primary protein sequence"
                ),
            },
        ],
    },
    domains: {
        id: "domains-and-sites" as const,
        name: i18n.t("Domains"),
        description: i18n.t(
            "Specific combination of secondary structures origanized intro a characteristic 3D structure"
        ),
        subtracks: [
            {
                id: "prosite-domain" as const,
                source: "Prosite db",
                name: i18n.t("Prosite domain (domain in domain & sites)"),
                description: i18n.t(
                    "Information collected from the Prosite database. PROSITE consists of documentation entries describing protein domains, families and functional sites, as well as associated patterns and profiles to identify them, using  multiple sequence alignments. Prosite profiles may be less sensitive, as they are intended to cover domains along their entire length with the best possible alignment and obtain an accurate functional characterization"
                ),
            },
            {
                id: "pfam-domain" as const,
                name: i18n.t("Pfam domains (domain families)"),
                source: "Pfam db",
                description: i18n.t(
                    "Information collected from the Pfam database. The Pfam database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models (HMMs)"
                ),
            },
            {
                id: "smart-domains" as const,
                name: i18n.t("Smart domains (domain families)"),
                source: "Smart db",
                description: i18n.t(
                    "Information collected from the SMART database. The SMART (Simple Modular Architecture Research Tool) compiles genetically mobile domains and domain architectures"
                ),
            },
            {
                id: "interpro-domains" as const,
                name: i18n.t("Interpro domains (domain families)"),
                source: "Interpro db",
                description: i18n.t(
                    "Information collected from the InterPro database. The InterPro database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models"
                ),
            },
            {
                id: "cath-domains" as const,
                name: i18n.t("CATH domains"),
                source: "Cath db",
                description: i18n.t(
                    "Information collected from the CATH database. The CATH database provides hierarchical classification of protein domains based on their folding patterns and evolutionary relationship"
                ),
            },
        ],
    },
    celullarRegions: {
        id: "topology" as const,
        name: i18n.t("Cellular regions"),
        description: i18n.t("Cell space in which the protein is located"),
        subtracks: [
            {
                id: "cytolosic" as const,
                name: i18n.t("Cytolosic /Extracellular region"),
                source: "Uniprot",
            },
            {
                id: "transmembrane-region" as const,
                name: i18n.t("Transmembrane region"),
                source: "Uniprot",
                description: i18n.t("Region of the protein embedded in cell membranes"),
            },
        ],
    },
    secondaryStructure: {
        id: "structural-features" as const,
        name: i18n.t("Secondary Structure (structural features)"),
        description: i18n.t(
            "The secondary structure of proteins is the local regular folding between nearby amino acid residues of the polypeptide chain. The most common structures are alpha helix, beta sheet and turns connecting them"
        ),
        subtracks: [
            { id: "helix" as const, name: i18n.t("Helix"), source: "Uniprot" },
            { id: "beta-strand" as const, name: i18n.t("Beta strand"), source: "Uniprot" },
            { id: "turn" as const, name: i18n.t("Turn"), source: "Uniprot" },
        ],
    },
    disorderedRegions: {
        id: "disordered-regions" as const,
        name: i18n.t("Disordered regions"),
        description: i18n.t(
            "Intrinsically disordered regions are region that do not have a fixed or ordered three-dimensional structure. They can possess many functions. They can, e.g., bind other proteins, interact with nucleic acids, or serve as scaffold proteins. Commonly, they are also involved in signaling pathways and have important roles in protein regulation"
        ),
        subtracks: [
            {
                id: "prediction" as const,
                name: i18n.t("Prediction"),
                source: "DIBS",
                description: i18n.t(
                    "Disordered Binding Site (DIBS) database is a large repository for protein complexes that are formed between Intrinsically Disordered"
                ),
            },
        ],
    },
    motifs: {
        id: "motifs" as const,
        name: i18n.t("Motifs"),
        description: i18n.t(
            "Short (usually not more than 20 amino acids) conserved sequence motif of biological significance"
        ),
        subtracks: [
            {
                id: "motifs" as const,
                name: i18n.t("Motifs"),
                source: "Uniprot",
                description: i18n.t(""),
            },
        ],
    },
    regions: {
        id: "regions" as const,
        name: i18n.t("Regions"),
        description: i18n.t("Regions in the protein with biological relevance"),
        subtracks: [{ id: "regions" as const, name: i18n.t("Regions"), source: "Uniprot" }],
    },
    otherRegions: {
        id: "other-structural-regions" as const,
        name: i18n.t("Other structural regions"),
        description: i18n.t(
            "This are regions that interactiing with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normall+P38:AA39y located in intrinsically disordered regions (IDRs) of proteins"
        ),
        subtracks: [
            {
                id: "coiled-coils" as const,
                name: i18n.t("Coiled coils"),
                source: "Uniprot",
                description: i18n.t(
                    "Coiled coils are built by two or more alpha helices that wind around each other to form a supercoil"
                ),
            },
            {
                id: "lip" as const,
                name: i18n.t("Linear interacting peptide"),
                source: "Uniprot/MobyDB",
                description: i18n.t(
                    "This are regions that interact with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normally located in intrinsically disordered regions (IDRs) of proteins"
                ),
            },
            {
                id: "repeats" as const,
                name: i18n.t("Repeats"),
                source: "Uniprot",
                description: i18n.t(
                    "A repeat is any sequence block that appear more than one time in the sequence, either in an identical or a highly similar form"
                ),
            },
            {
                id: "zinc-finger" as const,
                name: i18n.t("Zinc finger"),
                source: "Uniprot",
                description: i18n.t(
                    "Small, functional, independently folded domain that coordinates one or more zinc ions.  It is a structural motifs and hence, it should be inside of motifs annotations. Apply differents colours to represent the differents type of motifs"
                ),
            },
        ],
    },
    sites: {
        id: "sites" as const,
        name: i18n.t("Sites"),
        description: i18n.t(
            "Amino acids that have a relevant biological function, such as the union of different chemical groups or being part of the active center of an enzyme"
        ),
        subtracks: [
            {
                id: "active-site" as const,
                name: i18n.t("Active site"),
                source: "Uniprot",
                description: i18n.t("Amino acid(s) directly involved in the activity of an enzyme"),
            },
            {
                id: "binding-site" as const,
                name: i18n.t("Binding site"),
                source: "Uniprot",
                description: i18n.t(
                    "Binding site for any chemical group (co-enzyme, prothetic groups, etc)"
                ),
            },
            {
                id: "nucleotides-binding" as const,
                name: i18n.t("Nucleotides binding"),
                source: "Uniprot",
                description: i18n.t("Binding site for a nucleotides or nucleic acids"),
            },
            {
                id: "metal-binding" as const,
                name: i18n.t("Metal binding"),
                source: "Uniprot",
                description: i18n.t("Binding site for a metal ion"),
            },
            {
                id: "other-structural-relevant-sites" as const,
                name: i18n.t("Others structural relevant sites"),
                source: "Uniprot, PhosphoSitePlus",
                description: i18n.t("Binding site for others chemical group"),
            },
        ],
    },
    molecularProcessing: {
        id: "molecule-processing" as const,
        name: i18n.t("Molecular processing"),
        description: i18n.t(
            "Molecular protein processing involves processing the protein to its active form, such as signal peptide removal, residue modification (glycosylation, phosphorylation, etc.), and cleavage of the original chain into several smaller chains"
        ),
        subtracks: [
            {
                id: "signal-peptide" as const,
                name: i18n.t("Signal peptide"),
                source: "Uniprot",
                description: i18n.t("N-terminal signal peptide"),
            },
            {
                id: "chain" as const,
                name: i18n.t("Chain"),
                source: "Uniprot",
                description: i18n.t(
                    "Mature region of the protein. This describes the extension of a polypeptide chain in the mature protein after processing"
                ),
            },
        ],
    },
    ptm: {
        id: "ptm" as const,
        name: i18n.t("PTM"),
        description: i18n.t("Post-translational modifications of protein residues"),
        subtracks: [
            {
                id: "acetylation" as const,
                name: i18n.t("Acetylation"),
                source: "Uniprot",
                description: i18n.t(
                    "Protein acetylation is one of the major post-translational modifications (PTMs) in eukaryotes, in which the acetyl group from acetyl coenzyme A (Ac-CoA) is transferred to a specific site on a polypeptide chain."
                ),
            },
            {
                id: "disulfide-bond" as const,
                name: i18n.t("Disulfide Bond"),
                source: "Uniprot",
                description: i18n.t(
                    "The positions of cysteine residues participating in disulphide bonds."
                ),
            },
            {
                id: "glycosylation" as const,
                name: i18n.t("Glycosylation"),
                source: "Uniprot",
                description: i18n.t("Residues with covalently attached glycan group(s)."),
            },
            {
                id: "methylation" as const,
                name: i18n.t("Methylation"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t("Residues with covalently attached methyl group (s)."),
            },
            {
                id: "modified-residue" as const,
                name: i18n.t("Modified residue"),
                source: "Uniprot",
                description: i18n.t("Modified residues with others chemical groups bounded"),
            },
            {
                id: "phosphorylation" as const,
                name: i18n.t("Phosphorylation"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t("Residues with covalently attached phosphoryl groups."),
            },
            {
                id: "ubiquitination" as const,
                name: i18n.t("Ubiquitination"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t(
                    "Residues with ubiquitin chains. The ubiquitinization process consists of the addition of ubiquitin chains to a protein that has to be degraded."
                ),
            },
        ],
    },
    sequenceInformation: {
        id: "sequence-information" as const,
        name: i18n.t("Sequence information"),
        description: i18n.t(
            "Information regarding the protein sequence and the possible mutations that may be included in the structure compared to the reference sequence"
        ),
        subtracks: [
            {
                id: "compositional-bias" as const,
                name: i18n.t("Compositional bias"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t(
                    "Regions that exhibit compositional bias within the protein. That is, regions where there are over-represented amino acids, which are included in the description of the annotation."
                ),
            },
            {
                id: "sequence-conflict" as const,
                name: i18n.t("Sequence conflict"),
                source: "Uniprot",
                description: i18n.t("Sequence discrepancies of unknown origin"),
            },
        ],
    },
    pdbRedo: {
        id: "pdb-redo" as const,
        name: i18n.t("PDB-REDO"),
        description: i18n.t(
            "DB-REDO is a procedure to optimise crystallographic structure models, providing algorithms that make a fully automated decision making system for refinement, rebuilding and validation. It combines popular crystallographic software from CCP4, e.g. REFMAC and COOT, with  specially developed rebuilding tools Centrifuge, Pepflip & SideAide and structure analysis tools like WHAT IF and PDB-care. PDB-REDO optimises refinement settings (e.g. geometric and B-factor restraint weights, B-factor model, TLS groups, NCS and homology restraints), refines with REFMAC, partially rebuilds the structure (rejects waters, refines side chains, checks peptide planes), refines some more, and then validates the results.\nWe show the modified and refined residues by PDB-REDO"
        ),
        subtracks: [
            {
                id: "changed-rotamers" as const,
                name: i18n.t("Changed rotamers"),
                source: "PDB-REDO",
            },
            {
                id: "h-bond-flip" as const,
                name: i18n.t("H bond flip"),
                source: "PDB-REDO",
            },
            {
                id: "completed-residues" as const,
                name: i18n.t("Completed residues"),
                source: "PDB-REDO",
            },
        ],
    },
    molprobity: {
        id: "molprobity" as const,
        name: i18n.t("Molprobity"),
        description: i18n.t(
            "MolProbity is a structure validation web service that provides a robust, broad-spectrum assessment of model quality at both global and local protein levels. It relies heavily on the power and sensitivity provided by optimized hydrogen placement and contact analysis of all atoms, complemented by analysis of the covalent geometry and torsion angle criteria. MolProbity detects less credible or impossible rotamers and torsion angles."
        ),
        subtracks: [
            {
                id: "rotamer-outlier" as const,
                name: i18n.t("Rotamer outlier"),
                source: "Molprobity",
            },
            {
                id: "phi-psi-outliers" as const,
                name: i18n.t("Phi/Psi outliers"),
                source: "Molprobity",
            },
        ],
    },
    emValidation: {
        id: "em-validation" as const,
        name: i18n.t("EM - Validation"),
        description: i18n.t(
            "Different validation methods and local quality of models and maps in cryo-EM"
        ),
        subtracks: [
            {
                id: "deep-res" as const,
                name: i18n.t("DeepRes"),
                source: "Local server",
                description: i18n.t(
                    "Local quality method of the map based on the detection of 3D characteristics through Deep Learning. This method can be applied to any cryo-EM map and detects subtle changes in local quality after applying isotropic filters or other map processing methods."
                ),
            },
            {
                id: "map-q" as const,
                name: i18n.t("MapQ"),
                source: "Local server",
                description: i18n.t(
                    "Method that measures the resolubility of individual atoms in cryo-EM maps after having obtained a structural model of the protein under study."
                ),
            },
            {
                id: "fsc-q" as const,
                name: i18n.t("FscQ"),
                source: "Local server",
                description: i18n.t(
                    "Method that measures the local quality of the fit between the atomic model and the cryo-EM map, being a quantitative measure of how the experimental data supports the structural model"
                ),
            },
            {
                id: "mono-res" as const,
                name: i18n.t("MonoRes"),
                source: "Local server",
                description: i18n.t(
                    "Local resolution method of the map based on the use of monogenic signals."
                ),
            },
        ],
    },
    pockets: {
        id: "pockets" as const,
        name: i18n.t("Pockets"),
        description: i18n.t(
            "A pocket is a cavity on the surface or in the interior of a protein that possesses suitable properties for binding a ligand or interacting with a protein. The set of amino acid residues around a binding pocket determines its physicochemical characteristics and, together with its shape and location in a protein, defines its functionality"
        ),
        subtracks: [
            {
                id: "pockets" as const,
                name: i18n.t("Pockets"),
                source: "P2Rank or Kalasanty",
                description: i18n.t(
                    "Show the different amino acids that would make up the pocket and show them into the structure (There are prediction methods (P2RANK, DeepSite, etc.) and annotations in the literature, related to the relevant sites in the protein)"
                ),
            },
        ],
    },
    residueAccessibility: {
        id: "residue-accessibility" as const,
        name: i18n.t("Residue accesibility"),
        description: i18n.t(
            "The accessibility of residues in a protein is defined as the extent of the solvent-accessible surface of a given residue and is related to the spatial arrangement and packaging of the residue. It reveals the folding state of proteins and has been considered a significant quantitative measure for the three-dimensional structures of proteins. It  is closely involved in structural domains identification, fold recognition, binding region identification, protein-protein  and protein-ligand interactions"
        ),
        subtracks: [
            {
                id: "residue-accessibility" as const,
                name: i18n.t("Residue accesibility"),
                source: "",
                description: i18n.t(
                    "Graph, range of colors in the residues and show the surface of the protein (display mode). Allow download"
                ),
            },
        ],
    },
    ppiViewer: {
        id: "ppi-viewer" as const,
        name: i18n.t("PPI Viewer"),
        description: i18n.t("Protein-protein interaction networks graph"),
        component: PPIViewer,
        subtracks: [
            {
                id: "protein-network" as const,
                name: i18n.t("Protein Network"),
                source: "Interactome 3D, String",
                description: i18n.t(
                    "Set of proteins that interact directly with the protein under study. It is shown as a network of interactions."
                ),
            },
            {
                id: "pdb-list" as const,
                name: i18n.t(
                    "Extensible List of pdbs with interactions or name of differents proteins with the interactions"
                ),
                source: "PDB, Publications",
            },
        ],
    },
    functionalMappingPpi: {
        id: "functional-mapping-ppi" as const,
        name: i18n.t("Functional mapping ppi"),
        description: i18n.t("Functional mapping description (TODO)"),
        subtracks: [
            {
                id: "functional-mapping" as const,
                name: i18n.t("Functional mapping ppi"),
                description: i18n.t(
                    "Residues that participate in the interaction between the different proteins. Only available for covid 19 related proteins"
                ),
                source: "http://draco.cs.wpi.edu/wuhan/",
            },
        ],
    },
    ligands: {
        id: "ligands" as const,
        name: i18n.t("Ligands"),
        description: i18n.t(""),
        subtracks: [
            {
                id: "ligands" as const,
                name: i18n.t("Extensible List of ligands with interactions with the protein"),
                source: "PDB, Publications",
                description: i18n.t(""),
            },
        ],
    },
    functionalMappingLigands: {
        id: "functional-mapping-ligands" as const,
        name: i18n.t("Functional mapping ligands"),
        description: i18n.t(
            "Residues that participate in the interaction between the protein and the ligand. Only available for covid 19 related proteins"
        ),
        subtracks: [
            {
                id: "functional-mapping-ligands" as const,
                name: i18n.t("Functional mapping ligands"),
                source: "http://draco.cs.wpi.edu/wuhan/",
                description: i18n.t("Combined with the following one. Common names or both tags"),
            },
            {
                id: "pandda-drug-screening-diamond" as const,
                name: i18n.t("Pandda drug screening diamond"),
                source: "https://www.diamond.ac.uk/covid-19/for-scientists/",
            },
        ],
    },
    geneViewer: {
        id: "gene-viewer" as const,
        name: i18n.t("Gene viewer"),
        description: i18n.t("ENSEMBL database viewer"),
        component: GeneViewer,
        subtracks: [
            {
                id: "gene" as const,
                name: i18n.t("Gene"),
                source: "Ensembl",
                description: i18n.t(
                    "Gene panel to visualize the different transcripts (exons and introns)"
                ),
            },
        ],
    },
    mutagenesis: {
        id: "mutagenesis" as const,
        name: i18n.t("Mutagenesis experiments"),
        subtracks: [
            {
                id: "mutagenesis" as const,
                name: i18n.t("Mutagenesis"),
                source: "Uniprot",
                description: i18n.t(
                    "Residues which has been experimentally altered by mutagenesis"
                ),
            },
        ],
    },
    variants: {
        id: "variants" as const,
        name: i18n.t("Variants"),
        subtracks: [
            {
                id: "variants" as const,
                name: i18n.t("Variants"),
                source: "Uniprot, BioMutaDB, Ensembl, CNCB, Large scale studies",
            },
        ],
    },
    peptides: {
        id: "peptides" as const,
        name: i18n.t("Peptides"),
        description: i18n.t(
            "Peptides generated in silico by Uniprot using rules based on mass spectrometry experiments and comparing with peptides already identified in proteomics repositories. Only those that have already been identified are shown on the track"
        ),
        subtracks: [
            {
                id: "unique-peptide" as const,
                name: i18n.t("Unique peptide"),
                source: "Uniprot",
                description: i18n.t(
                    "Unique peptides are those that only belong to the group of genes that encode the protein"
                ),
            },
            {
                id: "non-unique-peptide" as const,
                name: i18n.t("Non unique peptide"),
                source: "Uniprot",
                description: i18n.t(
                    "Non-unique peptides are those that have been identified for several proteins and, therefore, for 2 or more different groups of genes"
                ),
            },
        ],
    },
    epitomes: {
        id: "epitomes" as const,
        name: i18n.t("Epitomes"),
        description: i18n.t(
            "An epitope is the portion of a macromolecule that is recognized by the immune system, specifically the sequence to which antibodies or B-cell and T-cell receptors bind"
        ),
        subtracks: [
            {
                id: "linear-epitope-1-2-3-4-5" as const,
                name: i18n.t("Linear epitope 1, 2, 3, 4 , 5"),
                source: "",
                description: i18n.t("Different entries from IEDB"),
            },
            {
                id: "linear-epitope" as const,
                name: i18n.t("Linear epitope"),
                source: "IEDB",
            },
        ],
    },
    antigenicSequence: {
        id: "antigenic-sequence" as const,
        name: i18n.t("Antigenic sequence"),
        description: i18n.t(
            "An antigenic sequence is a region of the protein that triggers the formation of antibodies and can cause an immune response"
        ),
        subtracks: [
            {
                id: "ab-binding-sequence" as const,
                name: i18n.t("Ab binding sequence"),
                source: "Uniprot - HPA",
            },
        ],
    },
});
