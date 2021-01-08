import { Legend } from "../../domain/entities/Legend";

const variantsFilters: Config["variantsFilters"] = [
    {
        type: "consequence",
        items: [{ label: "Disease (reviewed)", color: "#990000" }],
        properties: {
            association: function (variant) {
                /*
                return _.some(variant.association, function (association) {
                    return association.disease === true;
                });
                */
                return true;
            },
        },
    },
    {
        type: "consequence",
        items: [
            { label: "Predicted deleterious", color: "#002594" },
            { label: "Predicted benign", color: "#8FE3FF" },
        ],
    },
    {
        type: "consequence",
        items: [{ label: "Non-disease (reviewed)", color: "#99cc00" }],
    },
    {
        type: "consequence",
        items: [{ label: "Init, stop loss or gain", color: "#FFCC00" }],
    },

    {
        type: "source",
        items: [{ label: "UniProt reviewed", color: "#808080" }],
    },
    {
        type: "source",
        items: [{ label: "Large scale studies", color: "#808080" }],
    },
    {
        type: "source",
        items: [{ label: "CNCB", color: "#808080" }],
    },
];

// From ./myProtVista/src/FeatureFactory.js
// TODO: merge with object
const shapeByTrackName = {
    //molecular processing
    chain: "rectangle",
    transit: "rectangle",
    init_met: "arrow",
    propep: "rectangle",
    peptide: "rectangle",
    signal: "rectangle",
    //structural
    helix: "rectangle",
    strand: "rectangle",
    turn: "rectangle",
    //domains & sites
    region: "rectangle",
    coiled: "rectangle",
    motif: "rectangle",
    repeat: "rectangle",
    ca_bind: "rectangle",
    dna_bind: "rectangle",
    domain: "rectangle",
    zn_fing: "rectangle",
    np_bind: "rectangle",
    metal: "diamond",
    site: "chevron",
    binding: "catFace",
    act_site: "circle",
    //ptms
    mod_res: "triangle",
    lipid: "wave",
    carbohyd: "hexagon",
    disulfid: "bridge",
    crosslnk: "bridge",
    //seqInfo
    compbias: "rectangle",
    conflict: "rectangle",
    non_cons: "doubleBar",
    non_ter: "doubleBar",
    unsure: "rectangle",
    non_std: "pentagon",
    //mutagenesis
    mutagen: "rectangle",
    //topology
    topo_dom: "rectangle",
    transmem: "rectangle",
    intramem: "rectangle",
    //variants
    /* TODO
    var_seq: "variant",
    variant: "variant",
    missense: "variant", //CHECK
    ms_del: "variant", //CHECK
    insdel: "variant", //CHECK
    stop_lost: "variant", //CHECK
    stop_gained: "variant", //CHECK
    init_codon: "variant", //CHECK
    */
    //proteomics
    unique: "rectangle",
    non_unique: "rectangle",

    mod_res_pho: "triangle",
    mod_res_met: "triangle",
    mod_res_ace: "triangle",
    mod_res_cro: "triangle",
    mod_res_cit: "triangle",
    mod_res_sum: "triangle",
    mod_res_ubi: "triangle",
    pfam_domain: "rectangle",
    interpro_domain: "rectangle",
    smart_domain: "rectangle",
    disprot: "rectangle",
    pdb_xray: "rectangle",
    pdb_nmr: "rectangle",
    // crosslnk: "triangle", // Duplicated in ptms
    linear_motif: "rectangle",
    linear_epitope: "rectangle",
    rama: "pentagon",
    omega: "circle",
    rota: "diamond",
    h_bond_flip: "circle",
    changed_rotamer: "diamond",
    completed_res: "pentagon",
    completed_loop: "rectangle",
} as const;

type Shape = typeof shapeByTrackName[keyof typeof shapeByTrackName];

const categories: Config["categories"] = [
    {
        name: "DOMAINS_AND_SITES",
        label: "Domains & sites",
        visualizationType: "basic",
    },
    {
        name: "MOLECULE_PROCESSING",
        label: "Molecule processing",
        visualizationType: "basic",
    },
    {
        name: "PTM",
        label: "PTM",
        visualizationType: "basic",
    },
    {
        name: "SEQUENCE_INFORMATION",
        label: "Sequence information",
        visualizationType: "basic",
    },
    {
        name: "STRUCTURAL",
        label: "Structural features",
        visualizationType: "basic",
    },
    {
        name: "TOPOLOGY",
        label: "Topology",
        visualizationType: "basic",
    },
    {
        name: "MUTAGENESIS",
        label: "Mutagenesis",
        visualizationType: "basic",
    },
    {
        name: "EPITOPES",
        label: "Epitopes",
        visualizationType: "basic",
    },
    {
        name: "DOMAIN_FAMILIES",
        label: "Domain families",
        visualizationType: "basic",
    },
    {
        name: "DISORDERED_REGIONS",
        label: "Disordered regions",
        visualizationType: "basic",
    },
    {
        name: "INTERACTING_RESIDUES",
        label: "Interacting residues",
        visualizationType: "basic",
    },
    {
        name: "RESIDUE_ASA",
        label: "Residue accessibility",
        visualizationType: "continuous",
    },
    {
        name: "EM_VALIDATION",
        label: "em validation",
        visualizationType: "basic",
    },
    {
        name: "MOLPROBITY",
        label: "Mol Probity",
        tooltip: "Structure assessment / Mol Probity",
        visualizationType: "basic",
    },
    {
        name: "PDB_REDO",
        label: "PDB-REDO",
        tooltip: "Structure assessment / PDB-REDO",
        visualizationType: "basic",
    },
    {
        name: "STRUCTURE_COVERAGE",
        label: "Structure coverage",
        visualizationType: "basic",
    },
    {
        name: "SEQUENCE_COVERAGE",
        label: "Sequence coverage",
        visualizationType: "basic",
    },
    {
        name: "PROTEOMICS",
        label: "Proteomics",
        visualizationType: "basic",
    },
    {
        name: "ANTIGEN",
        label: "Antigenic sequences",
        visualizationType: "basic",
    },
    {
        name: "VARIATION",
        label: "Variants",
        visualizationType: "variant",
    },
    {
        name: "__fake",
        label: "__fake",
        visualizationType: "basic",
    },
];

const tracks: Config["tracks"] = {
    chain: {
        label: "Chain",
        tooltip:
            "(aka mature region). This describes the extent of a polypeptide chain in the mature protein following processing",
        color: "#CC9933",
    },
    transit: {
        label: "Transit peptide",
        tooltip: "This describes the extent of a transit peptide",
        color: "#009966",
    },
    init_met: {
        label: "Initiator methionine",
        tooltip: "This indicates that the initiator methionine is cleaved from the mature protein",
        color: "#996633",
    },
    propep: {
        label: "Propeptide",
        tooltip: "Part of a protein that is cleaved during maturation or activation",
        color: "#99CCCC",
    },
    peptide: {
        label: "Peptide",
        tooltip: "The position and length of an active peptide in the mature protein",
        color: "#006699",
    },
    signal: { label: "Signal peptide", tooltip: "N-terminal signal peptide", color: "#CC0033" },
    helix: {
        label: "Helix",
        tooltip: "The positions of experimentally determined helical regions",
        color: "#FF0066",
    },
    strand: {
        label: "Beta strand",
        tooltip: "The positions of experimentally determined beta strands",
        color: "#FFCC00",
    },
    turn: {
        label: "Turn",
        tooltip: "The positions of experimentally determined hydrogen-bonded turns",
        color: "#0571AF",
    },
    disulfid: {
        label: "Disulfide bond",
        tooltip: "The positions of cysteine residues participating in disulphide bonds",
        color: "#23B14D",
    },
    crosslnk: {
        label: "Cross-link",
        tooltip:
            "Covalent linkages of various types formed between two proteins or between two parts of the same protein",
        color: "#FF6600",
    },
    region: {
        label: "Region",
        tooltip:
            "Regions in multifunctional enzymes or fusion proteins, or characteristics of a region, e.g., protein-protein interactions mediation",
        color: "#B33E00",
    },
    coiled: {
        label: "Coiled coil",
        tooltip:
            "Coiled coils are built by two or more alpha-helices that wind around each other to form a supercoil",
        color: "#006699",
    },
    motif: {
        label: "Motif",
        tooltip: "Short conserved sequence motif of biological significance",
        color: "#402060",
    },
    repeat: {
        label: "Repeat",
        tooltip: "Repeated sequence motifs or repeated domains within the protein",
        color: "#9900FF",
    },
    ca_bind: {
        label: "Calcium binding",
        tooltip: "Calcium-binding regions, such as the EF-hand motif",
        color: "#FF3399",
    },
    dna_bind: {
        label: "DNA binding",
        tooltip:
            "DNA-binding domains such as AP2/ERF domain, the ETS domain, the Fork-Head domain, the HMG box and the Myb domain",
        color: "#009933",
    },
    domain: {
        label: "Domain",
        tooltip:
            "Specific combination of secondary structures organized into a characteristic three-dimensional structure or fold",
        color: "#9999FF",
    },
    zn_fing: {
        label: "Zinc finger",
        tooltip:
            "Small, functional, independently folded domain that coordinates one or more zinc ions",
        color: "#990066",
    },
    np_bind: {
        label: "Nucleotide binding",
        tooltip: "(aka flavin-binding). Region in the protein which binds nucleotide phosphates",
        color: "#FF9900",
    },
    metal: {
        label: "Metal binding",
        tooltip: "Binding site for a metal ion",
        color: "#009900",
    },
    site: {
        label: "Site",
        tooltip: "Any interesting single amino acid site on the sequence",
        color: "#660033",
    },
    binding: {
        label: "Binding site",
        tooltip: "Binding site for any chemical group (co-enzyme, prosthetic group, etc.)",
        color: "#006699",
    },
    act_site: {
        label: "Active site",
        tooltip: "Amino acid(s) directly involved in the activity of an enzyme",
        color: "#FF6666",
    },
    mod_res: {
        label: "Modified residue",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
        color: "#000066",
    },
    lipid: {
        label: "Lipidation",
        tooltip: "Covalently attached lipid group(s)",
        color: "#99CC33",
    },
    carbohyd: {
        label: "Glycosylation",
        tooltip: "Covalently attached glycan group(s)",
        color: "#CC3366",
    },
    compbias: {
        label: "Compositional bias",
        tooltip:
            "Position of regions of compositional bias within the protein and the particular amino acids that are over-represented within those regions",
        color: "#FF3366",
    },
    conflict: {
        label: "Sequence conflict",
        tooltip: "Sequence discrepancies of unknown origin",
        color: "#6633CC",
    },
    non_cons: {
        label: "Non-adjacent residues",
        tooltip:
            "Indicates that two residues in a sequence are not consecutive and that there is an undetermined number of unsequenced residues between them",
        color: "#FF0033",
    },
    non_ter: {
        label: "Non-terminal residue",
        tooltip:
            "The sequence is incomplete. The residue is not the terminal residue of the complete protein",
        color: "#339933",
    },
    unsure: {
        label: "Sequence uncertainty",
        tooltip:
            "Regions of a sequence for which the authors are unsure about the sequence assignment",
        color: "#33FF00",
    },
    non_std: {
        label: "Non-standard residue",
        tooltip: "Non-standard amino acids (selenocysteine and pyrrolysine)",
        color: "#330066",
    },
    mutagen: {
        label: "Mutagenesis",
        tooltip: "Site which has been experimentally altered by mutagenesis",
        color: "#FF9900",
    },
    topo_dom: {
        label: "Topological domain",
        tooltip: "Location of non-membrane regions of membrane-spanning proteins",
        color: "#CC0000",
    },
    transmem: {
        label: "Transmembrane",
        tooltip: "Extent of a membrane-spanning region",
        color: "#CC00CC",
    },
    intramem: {
        label: "Intramembrane",
        tooltip: "Extent of a region located in a membrane without crossing it",
        color: "#0000CC",
    },
    variant: {
        label: "Natural variant",
        tooltip:
            "Natural variant of the protein, including polymorphisms, variations between strains, isolates or cultivars, disease-associated mutations and RNA editing events",
    },
    unique: { label: "Unique peptide", tooltip: "", color: "#fc3133" },
    non_unique: { label: "Non-unique peptide", tooltip: "", color: "#8585fc" },
    antigen: { label: "Antibody binding sequences", tooltip: "", color: "#996699" },
    mod_res_pho: {
        label: "Phosphorylation",
        tooltip: "Modified residues: Addition of a phosphoryl group",
    },
    mod_res_met: {
        label: "Methylation",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    mod_res_ace: {
        label: "Acetylation",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    mod_res_cro: {
        label: "Crotonylation",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    mod_res_cit: {
        label: "Citrullination",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    mod_res_sum: {
        label: "SUMOylation",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    mod_res_ubi: {
        label: "Ubiquitination",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    disprot: {
        label: "Disprot",
        tooltip: "Disoredered regions collected from the DisProt database",
    },
    pdb_nmr: { label: "NMR", tooltip: "Disoredered regions inferred from NMR srtuctures" },
    pdb_xray: { label: "X-ray", tooltip: "Disoredered regions inferred from X-ray srtuctures" },
    long: {
        label: "Long disorder",
        tooltip: "Disoredered regions collected from the DisProt database",
    },
    pfam_domain: {
        label: "Pfam domain",
        tooltip:
            "Information collected from the Pfam database. The Pfam database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models (HMMs)",
    },
    interpro_domain: {
        label: "InterPro domain",
        tooltip:
            "Information collected from the InterPro database. The InterPro database is a large collection of protein families, each represented by multiple sequence alignments and hidden Markov models",
    },
    smart_domain: {
        label: "SMART domain",
        tooltip:
            "Information collected from the SMART database. The SMART (Simple Modular Architecture Research Tool) compiles genetically mobile domains and domain architectures",
    },
    linear_motif: {
        label: "Short linear motif",
        tooltip:
            "Informtaion collected from the Eucariotic Linear Motif (ELM) resource. Short linear motifs are compact protein interaction sites composed of short stretches of adjacent amino acids",
    },
    linear_epitope: {
        label: "Linear epitope",
        tooltip:
            "Information collected from the Immune Epitope Database (IEDB). Antibody binding sites",
    },
    rama: { label: "Phi/Psi outliers", tooltip: "Ramachandra angle outliers" },
    omega: { label: "Omega non-Trans", tooltip: "non-Trans omega angles" },
    rota: { label: "Rotamer outliers", tooltip: "Rotamer Chi angles outliers" },
    h_bond_flip: { label: "H-bond flip", tooltip: "H-bond flip" },
    changed_rotamer: { label: "Changed rotamer", tooltip: "Changed rotamer" },
    completed_res: { label: "Completed residues", tooltip: "Completed residues" },
    completed_loop: { label: "Completed loop", tooltip: "Completed loop" },
};

export const config: Config = {
    categories,
    tracks,
    shapeByTrackName,
    variantsFilters,
};

export interface Config {
    categories: Array<{
        name: string;
        label: string;
        tooltip?: string;
        visualizationType: "basic" | "continuous" | "variant";
    }>;
    tracks: Record<string, { label: string; tooltip: string; color?: string }>;
    shapeByTrackName: Record<string, Shape>;
    variantsFilters: Array<{
        type: VariantFilterType;
        items: Array<{ label: string; color: string }>;
        properties?: {
            association?(variant: unknown): boolean;
        };
    }>;
}

export type VariantFilterType = "source" | "consequence";
