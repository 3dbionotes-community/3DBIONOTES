import _ from "lodash";
import { recordOf } from "../../../utils/ts-utils";
import i18n from "../../utils/i18n";
import { BlockDef, TrackDef } from "./Protvista.types";

const tracksDef = recordOf<TrackDef>()({
    structureCoverage: {
        id: "structure-coverage",
        name: i18n.t("Structure Coverage"),
        description: i18n.t("Coverage of the sequence shown with the primary protein sequence"),
        subtracks: [
            {
                id: "structure-coverage",
                name: i18n.t("Structure Coverage"),
                source: "",
                description: i18n.t(
                    "Coverage of the sequence shown with the primary protein sequence"
                ),
            },
        ],
    },
    domains: {
        id: "domains",
        name: i18n.t("Domains"),
        description: i18n.t(
            "Specific combination of secondary structures origanized intro a characteristic 3D structure"
        ),
        subtracks: [
            {
                id: "prosite-domain",
                source: "Prosite db",
                name: i18n.t("Prosite domain (domain in domain & sites)"),
                description: i18n.t(
                    "Information collected from the Prosite database. PROSITE consists of documentation entries describing protein domains, families and functional sites, as well as associated patterns and profiles to identify them, using  multiple sequence alignments. Prosite profiles may be less sensitive, as they are intended to cover domains along their entire length with the best possible alignment and obtain an accurate functional characterization"
                ),
            },
            {
                id: "pfam-domain",
                name: i18n.t("Pfam domains (domain families)"),
                source: "Pfam db",
                description: i18n.t(
                    "Information collected from the Pfam database. The Pfam database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models (HMMs)"
                ),
            },
            {
                id: "smart-domains",
                name: i18n.t("Smart domains (domain families)"),
                source: "Smart db",
                description: i18n.t(
                    "Information collected from the SMART database. The SMART (Simple Modular Architecture Research Tool) compiles genetically mobile domains and domain architectures"
                ),
            },
            {
                id: "interpro-domains",
                name: i18n.t("Interpro domains (domain families)"),
                source: "Interpro db",
                description: i18n.t(
                    "Information collected from the InterPro database. The InterPro database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models"
                ),
            },
            {
                id: "",
                name: i18n.t("CATH domains"),
                source: "Cath db",
                description: i18n.t(
                    "Information collected from the CATH database. The CATH database provides hierarchical classification of protein domains based on their folding patterns and evolutionary relationship"
                ),
            },
        ],
    },
    celullarRegions: {
        id: "topology",
        name: i18n.t("Cellular regions"),
        description: i18n.t("Cell space in which the protein is located"),
        subtracks: [
            {
                id: "cytolosic",
                name: i18n.t("Cytolosic /Extracellular region"),
                source: "Uniprot",
            },
            {
                id: "transmembrane-region",
                name: i18n.t("Transmembrane region"),
                source: "Uniprot",
                description: i18n.t("Region of the protein embedded in cell membranes"),
            },
        ],
    },
    secondaryStructure: {
        id: "secondary-structure",
        name: i18n.t("Secondary Structure (structural features)"),
        description: i18n.t(
            "The secondary structure of proteins is the local regular folding between nearby amino acid residues of the polypeptide chain. The most common structures are alpha helix, beta sheet and turns connecting them"
        ),
        subtracks: [
            { id: "helix", name: i18n.t("Helix"), source: "Uniprot" },
            { id: "beta-strand", name: i18n.t("Beta strand"), source: "Uniprot" },
            { id: "turn", name: i18n.t("Turn"), source: "Uniprot" },
        ],
    },
    disorderedRegions: {
        id: "disordered-regions",
        name: i18n.t("Disordered regions"),
        description: i18n.t(
            "Intrinsically disordered regions are region that do not have a fixed or ordered three-dimensional structure. They can possess many functions. They can, e.g., bind other proteins, interact with nucleic acids, or serve as scaffold proteins. Commonly, they are also involved in signaling pathways and have important roles in protein regulation"
        ),
        subtracks: [
            {
                id: "prediction",
                name: i18n.t("Prediction"),
                source: "DIBS",
                description: i18n.t(
                    "Disordered Binding Site (DIBS) database is a large repository for protein complexes that are formed between Intrinsically Disordered"
                ),
            },
        ],
    },
    motifs: {
        id: "motifs",
        name: i18n.t("Motifs"),
        description: i18n.t(
            "Short (usually not more than 20 amino acids) conserved sequence motif of biological significance"
        ),
        subtracks: [
            { id: "motifs", name: i18n.t("Motifs"), source: "Uniprot", description: i18n.t("") },
        ],
    },
    regions: {
        id: "regions",
        name: i18n.t("Regions"),
        description: i18n.t("Regions in the protein with biological relevance"),
        subtracks: [{ id: "regions", name: i18n.t("Regions"), source: "Uniprot" }],
    },
    otherRegions: {
        id: "other-regions",
        name: i18n.t("Other structural regions"),
        description: i18n.t(
            "This are regions that interactiing with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normall+P38:AA39y located in intrinsically disordered regions (IDRs) of proteins"
        ),
        subtracks: [
            {
                id: "coiled-coils",
                name: i18n.t("Coiled coils"),
                source: "Uniprot",
                description: i18n.t(
                    "Coiled coils are built by two or more alpha helices that wind around each other to form a supercoil"
                ),
            },
            {
                id: "lip",
                name: i18n.t("Linear interacting peptide"),
                source: "Uniprot/MobyDB",
                description: i18n.t(
                    "This are regions that interact with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normally located in intrinsically disordered regions (IDRs) of proteins"
                ),
            },
            {
                id: "repeats",
                name: i18n.t("Repeats"),
                source: "Uniprot",
                description: i18n.t(
                    "A repeat is any sequence block that appear more than one time in the sequence, either in an identical or a highly similar form"
                ),
            },
            {
                id: "zinc-finger",
                name: i18n.t("Zinc finger"),
                source: "Uniprot",
                description: i18n.t(
                    "Small, functional, independently folded domain that coordinates one or more zinc ions.  It is a structural motifs and hence, it should be inside of motifs annotations. Apply differents colours to represent the differents type of motifs"
                ),
            },
        ],
    },
    sites: {
        id: "sites",
        name: i18n.t("Sites"),
        description: i18n.t(
            "Amino acids that have a relevant biological function, such as the union of different chemical groups or being part of the active center of an enzyme"
        ),
        subtracks: [
            {
                id: "active-site",
                name: i18n.t("Active site"),
                source: "Uniprot",
                description: i18n.t("Amino acid(s) directly involved in the activity of an enzyme"),
            },
            {
                id: "binding-site",
                name: i18n.t("Binding site"),
                source: "Uniprot",
                description: i18n.t(
                    "Binding site for any chemical group (co-enzyme, prothetic groups, etc)"
                ),
            },
            {
                id: "nucleotides-binding",
                name: i18n.t("Nucleotides binding"),
                source: "Uniprot",
                description: i18n.t("Binding site for a nucleotides or nucleic acids"),
            },
            {
                id: "metal-binding",
                name: i18n.t("Metal binding"),
                source: "Uniprot",
                description: i18n.t("Binding site for a metal ion"),
            },
            {
                id: "other-sites",
                name: i18n.t("Others structural relevant sites"),
                source: "Uniprot, PhosphoSitePlus",
                description: i18n.t("Binding site for others chemical group"),
            },
        ],
    },
    molecularProcessing: {
        id: "molecular-processing",
        name: i18n.t("Molecular processing"),
        description: i18n.t(
            "Molecular protein processing involves processing the protein to its active form, such as signal peptide removal, residue modification (glycosylation, phosphorylation, etc.), and cleavage of the original chain into several smaller chains"
        ),
        subtracks: [
            {
                id: "signal-peptide",
                name: i18n.t("Signal peptide"),
                source: "Uniprot",
                description: i18n.t("N-terminal signal peptide"),
            },
            {
                id: "chain",
                name: i18n.t("Chain"),
                source: "Uniprot",
                description: i18n.t(
                    "Mature region of the protein. This describes the extension of a polypeptide chain in the mature protein after processing"
                ),
            },
        ],
    },
    ptm: {
        id: "ptm",
        name: i18n.t("PTM"),
        description: i18n.t("Post-translational modifications of protein residues"),
        subtracks: [
            {
                id: "acetylation",
                name: i18n.t("Acetylation"),
                source: "Uniprot",
                description: i18n.t(
                    "Protein acetylation is one of the major post-translational modifications (PTMs) in eukaryotes, in which the acetyl group from acetyl coenzyme A (Ac-CoA) is transferred to a specific site on a polypeptide chain."
                ),
            },
            {
                id: "disulfide-bond",
                name: i18n.t("Disulfide Bond"),
                source: "Uniprot",
                description: i18n.t(
                    "The positions of cysteine residues participating in disulphide bonds."
                ),
            },
            {
                id: "glycosylation",
                name: i18n.t("Glycosylation"),
                source: "Uniprot",
                description: i18n.t("Residues with covalently attached glycan group(s)."),
            },
            {
                id: "methylation",
                name: i18n.t("Methylation"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t("Residues with covalently attached methyl group (s)."),
            },
            {
                id: "modified-residue",
                name: i18n.t("Modified residue"),
                source: "Uniprot",
                description: i18n.t("Modified residues with others chemical groups bounded"),
            },
            {
                id: "phosphorylation",
                name: i18n.t("Phosphorylation"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t("Residues with covalently attached phosphoryl groups."),
            },
            {
                id: "ubiquitination",
                name: i18n.t("Ubiquitination"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t(
                    "Residues with ubiquitin chains. The ubiquitinization process consists of the addition of ubiquitin chains to a protein that has to be degraded."
                ),
            },
        ],
    },
    sequenceInformation: {
        id: "sequence-information",
        name: i18n.t("Sequence information"),
        description: i18n.t(
            "Information regarding the protein sequence and the possible mutations that may be included in the structure compared to the reference sequence"
        ),
        subtracks: [
            {
                id: "compositional-bias",
                name: i18n.t("Compositional bias"),
                source: "PhosphoSitePlus, Uniprot",
                description: i18n.t(
                    "Regions that exhibit compositional bias within the protein. That is, regions where there are over-represented amino acids, which are included in the description of the annotation."
                ),
            },
            {
                id: "sequence-conflict",
                name: i18n.t("Sequence conflict"),
                source: "Uniprot",
                description: i18n.t("Sequence discrepancies of unknown origin"),
            },
        ],
    },
    pdbRedo: {
        id: "pdb-redo",
        name: i18n.t("PDB-REDO"),
        description: i18n.t(
            "DB-REDO is a procedure to optimise crystallographic structure models, providing algorithms that make a fully automated decision making system for refinement, rebuilding and validation. It combines popular crystallographic software from CCP4, e.g. REFMAC and COOT, with  specially developed rebuilding tools Centrifuge, Pepflip & SideAide and structure analysis tools like WHAT IF and PDB-care. PDB-REDO optimises refinement settings (e.g. geometric and B-factor restraint weights, B-factor model, TLS groups, NCS and homology restraints), refines with REFMAC, partially rebuilds the structure (rejects waters, refines side chains, checks peptide planes), refines some more, and then validates the results.\nWe show the modified and refined residues by PDB-REDO"
        ),
        subtracks: [
            {
                id: "changed-rotamers",
                name: i18n.t("Changed rotamers"),
                source: "PDB-REDO",
            },
            {
                id: "h-bond-flip",
                name: i18n.t("H bond flip"),
                source: "PDB-REDO",
            },
            {
                id: "completed-residues",
                name: i18n.t("Completed residues"),
                source: "PDB-REDO",
            },
        ],
    },
    molprobity: {
        id: "molprobity",
        name: i18n.t("Molprobity"),
        description: i18n.t(
            "MolProbity is a structure validation web service that provides a robust, broad-spectrum assessment of model quality at both global and local protein levels. It relies heavily on the power and sensitivity provided by optimized hydrogen placement and contact analysis of all atoms, complemented by analysis of the covalent geometry and torsion angle criteria. MolProbity detects less credible or impossible rotamers and torsion angles."
        ),
        subtracks: [
            {
                id: "rotamer-outlier",
                name: i18n.t("Rotamer outlier"),
                source: "Molprobity",
            },
            {
                id: "phi-psi-outliers",
                name: i18n.t("Phi/Psi outliers"),
                source: "Molprobity",
            },
        ],
    },
    emValidation: {
        id: "em-validation",
        name: i18n.t("EM - Validation"),
        description: i18n.t(
            "Different validation methods and local quality of models and maps in cryo-EM"
        ),
        subtracks: [
            {
                id: "deep-res",
                name: i18n.t("DeepRes"),
                source: "Local server",
                description: i18n.t(
                    "Local quality method of the map based on the detection of 3D characteristics through Deep Learning. This method can be applied to any cryo-EM map and detects subtle changes in local quality after applying isotropic filters or other map processing methods."
                ),
            },
            {
                id: "map-q",
                name: i18n.t("MapQ"),
                source: "Local server",
                description: i18n.t(
                    "Method that measures the resolubility of individual atoms in cryo-EM maps after having obtained a structural model of the protein under study."
                ),
            },
            {
                id: "fsc-q",
                name: i18n.t("FscQ"),
                source: "Local server",
                description: i18n.t(
                    "Method that measures the local quality of the fit between the atomic model and the cryo-EM map, being a quantitative measure of how the experimental data supports the structural model"
                ),
            },
            {
                id: "mono-res",
                name: i18n.t("MonoRes"),
                source: "Local server",
                description: i18n.t(
                    "Local resolution method of the map based on the use of monogenic signals."
                ),
            },
        ],
    },
    pockets: {
        id: "pockets",
        name: i18n.t("Pockets"),
        description: i18n.t(
            "A pocket is a cavity on the surface or in the interior of a protein that possesses suitable properties for binding a ligand or interacting with a protein. The set of amino acid residues around a binding pocket determines its physicochemical characteristics and, together with its shape and location in a protein, defines its functionality"
        ),
        subtracks: [
            {
                id: "pockets",
                name: i18n.t("Pockets"),
                source: "P2Rank or Kalasanty",
                description: i18n.t(
                    "Show the different amino acids that would make up the pocket and show them into the structure (There are prediction methods (P2RANK, DeepSite, etc.) and annotations in the literature, related to the relevant sites in the protein)"
                ),
            },
        ],
    },
    residueAccessibility: {
        id: "residue-accessibility",
        name: i18n.t("Residue accesibility"),
        description: i18n.t(
            "The accessibility of residues in a protein is defined as the extent of the solvent-accessible surface of a given residue and is related to the spatial arrangement and packaging of the residue. It reveals the folding state of proteins and has been considered a significant quantitative measure for the three-dimensional structures of proteins. It  is closely involved in structural domains identification, fold recognition, binding region identification, protein-protein  and protein-ligand interactions"
        ),
        subtracks: [
            {
                id: "residue-accessibility",
                name: i18n.t("Residue accesibility"),
                source: "",
                description: i18n.t(
                    "Graph, range of colors in the residues and show the surface of the protein (display mode). Allow download"
                ),
            },
        ],
    },
    ppiViewer: {
        id: "ppi-viewer",
        name: i18n.t("PPI Viewer"),
        description: "",
        subtracks: [
            {
                id: "protein-network",
                name: i18n.t("Protein Network"),
                source: "Interactome 3D, String",
                description: i18n.t(
                    "Set of proteins that interact directly with the protein under study. It is shown as a network of interactions."
                ),
            },
            {
                id: "pdb-list",
                name: i18n.t(
                    "Extensible List of pdbs with interactions or name of differents proteins with the interactions"
                ),
                source: "PDB, Publications",
            },
        ],
    },
    functionalMappingPpi: {
        id: "functional-mapping-ppi",
        name: i18n.t("Functional mapping ppi"),
        description: i18n.t(""),
        subtracks: [
            {
                id: "functional-mapping",
                name: i18n.t("Functional mapping ppi"),
                description: i18n.t(
                    "Residues that participate in the interaction between the different proteins. Only available for covid 19 related proteins"
                ),
                source: "http://draco.cs.wpi.edu/wuhan/",
            },
        ],
    },
    ligands: {
        id: "ligands",
        name: i18n.t("Ligands"),
        description: i18n.t(""),
        subtracks: [
            {
                id: "ligands",
                name: i18n.t("Extensible List of ligands with interactions with the protein"),
                source: "PDB, Publications",
                description: i18n.t(""),
            },
        ],
    },
    functionalMappingLigands: {
        id: "functional-mapping-ligands",
        name: i18n.t("Functional mapping ligands"),
        description: i18n.t(
            "Residues that participate in the interaction between the protein and the ligand. Only available for covid 19 related proteins"
        ),
        subtracks: [
            {
                id: "functional-mapping-ligands",
                name: i18n.t("Functional mapping ligands"),
                source: "http://draco.cs.wpi.edu/wuhan/",
                description: i18n.t("Combined with the following one. Common names or both tags"),
            },
            {
                id: "pandda-drug-screening-diamond",
                name: i18n.t("Pandda drug screening diamond"),
                source: "https://www.diamond.ac.uk/covid-19/for-scientists/",
            },
        ],
    },
    geneView: {
        id: "gene-view",
        name: i18n.t("Gene view"),
        subtracks: [
            {
                id: "gene",
                name: i18n.t("Gene"),
                source: "Ensembl",
                description: i18n.t(
                    "Gene panel to visualize the different transcripts (exons and introns)"
                ),
            },
        ],
    },
    mutagenesisExperiments: {
        id: "mutagenesis",
        name: i18n.t("Mutagenesis experiments"),
        subtracks: [
            {
                id: "mutagenesis",
                name: i18n.t("Mutagenesis"),
                source: "Uniprot",
                description: i18n.t(
                    "Residues which has been experimentally altered by mutagenesis"
                ),
            },
        ],
    },
    variants: {
        id: "variants",
        name: i18n.t("Variants"),
        subtracks: [
            {
                id: "variants",
                name: i18n.t("Variants"),
                source: "Uniprot, BioMutaDB, Ensembl, CNCB, Large scale studies",
            },
        ],
    },
    peptides: {
        id: "peptides",
        name: i18n.t("Peptides"),
        description: i18n.t(
            "Peptides generated in silico by Uniprot using rules based on mass spectrometry experiments and comparing with peptides already identified in proteomics repositories. Only those that have already been identified are shown on the track"
        ),
        subtracks: [
            {
                id: "unique-peptide",
                name: i18n.t("Unique peptide"),
                source: "Uniprot",
                description: i18n.t(
                    "Unique peptides are those that only belong to the group of genes that encode the protein"
                ),
            },
            {
                id: "non-unique-peptide",
                name: i18n.t("Non unique peptide"),
                source: "Uniprot",
                description: i18n.t(
                    "Non-unique peptides are those that have been identified for several proteins and, therefore, for 2 or more different groups of genes"
                ),
            },
        ],
    },
    epitomes: {
        id: "epitomes",
        name: i18n.t("Epitomes"),
        description: i18n.t(
            "An epitope is the portion of a macromolecule that is recognized by the immune system, specifically the sequence to which antibodies or B-cell and T-cell receptors bind"
        ),
        subtracks: [
            {
                id: "linear-epitope-1-2-3-4-5",
                name: i18n.t("Linear epitope 1, 2, 3, 4 , 5"),
                source: "",
                description: i18n.t("Different entries from IEDB"),
            },
            {
                id: "linear-epitope",
                name: i18n.t("Linear epitope"),
                source: "IEDB",
            },
        ],
    },
    antigenicSequence: {
        id: "antigenic-sequence",
        name: i18n.t("Antigenic sequence"),
        description: i18n.t(
            "An antigenic sequence is a region of the protein that triggers the formation of antibodies and can cause an immune response"
        ),
        subtracks: [
            {
                id: "ab-binding-sequence",
                name: i18n.t("Ab binding sequence"),
                source: "Uniprot - HPA",
            },
        ],
    },
});

export const blockDefs: BlockDef[] = [
    {
        id: "basicInfo",
        title: i18n.t("Basic information"),
        description: i18n.t(
            "This section contains the basic information about the protein structure model that is being visualized, such as the name of the protein, the name of the gene, the organism in which it is expressed, its biological function, the experimental (or computational) method that has allowed knowing the structure and its resolution. Also, if there is a cryo-EM map associated with the model, it will be shown. The IDs of PDB, EMDB (in case of cryo-EM map availability) and Uniprot will be displayed"
        ),
        help: "Some help",
        tracks: [],
        isProtvista: false,
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
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.domains,
            tracksDef.celullarRegions,
            tracksDef.secondaryStructure,
            tracksDef.disorderedRegions /* prediction (old: inferred) */,
            tracksDef.motifs /* Now it's a subtrack in Domains&Sites */,
            tracksDef.regions /* The one in Domains&Sites? */,
            tracksDef.otherRegions /* Coiled coil (D&S), LIPS (D&S), Repeats (D&S), Zinc finger (D&S) */,
        ],
    },
    {
        id: "relevantSites",
        title: "Relevant sites",
        description: i18n.t(`
            This section shows the amino acids that are relevant to the function of the protein or in its processing.
        `),
        help: "",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.sites /* active site (D&S), biding site, nucleotide binding, metal binding */,
        ],
    },
    {
        id: "processing",
        title: "Processing and post-translational modifications",
        description: i18n.t(`
            This section shows the post-translational modifications of the protein in terms of the processing of immature proteins after translation, through the elimination of the signal peptide and the cutting of the different chains that make up the protein.
        `),
        help: "",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.molecularProcessing /* signal peptide, chain */,
            tracksDef.ptm /* All from Phosphite/uniprot PTM */,
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
        help: "Some help",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.sequenceInformation,
            tracksDef.pdbRedo,
            tracksDef.molprobity,
            tracksDef.emValidation,
        ],
    },
    {
        id: "residueAccessibility",
        title: "Residue Accessibility",
        description: i18n.t(`Number of pockets`),
        help: "",
        isProtvista: true,
        tracks: [tracksDef.structureCoverage, tracksDef.pockets, tracksDef.residueAccessibility],
    },
    {
        id: "proteinInteraction",
        title: "Protein Interaction",
        description: i18n.t(
            "This section shows other proteins observed together with the protein of interest in PDB entries as a interaction network and as a list. In addittion, we show the protein residues that are interacting with the other proteins.\n\nFor this protein, we found <number> different partners."
        ),
        help: "",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.ppiViewer,
            tracksDef.functionalMappingPpi /* separate: ppi-viewer */,
        ],
    },
    {
        id: "ligandInteraction",
        title: "Ligand interaction",
        description: i18n.t(`
            This protein interacts with <name> and it could be interact with <number> protein more.`),
        help: "",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.ligands,
            tracksDef.functionalMappingLigands /* + Pandda, how to show, prefix?*/,
        ],
    },
    {
        id: "variants",
        title: "Variants and mutagenesis experiments",
        description: "",
        help: "",
        isProtvista: true,
        tracks: [
            tracksDef.structureCoverage,
            tracksDef.geneView /* viewer */,
            tracksDef.mutagenesisExperiments,
            tracksDef.variants,
        ],
    },
    {
        id: "proteomics",
        title: "Proteomics",
        description: "",
        help: "",
        isProtvista: true,
        tracks: [tracksDef.structureCoverage, tracksDef.peptides],
    },
    {
        id: "inmunology",
        title: "Inmunology information",
        description: "",
        help: "",
        isProtvista: true,
        tracks: [tracksDef.structureCoverage, tracksDef.epitomes, tracksDef.antigenicSequence],
    },
];

export const blockDefsById = _.keyBy(blockDefs, b => b.id) as Record<BlockDef["id"], BlockDef>;
