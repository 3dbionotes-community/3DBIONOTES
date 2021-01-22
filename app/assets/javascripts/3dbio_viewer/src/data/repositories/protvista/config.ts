import { Color } from "../../../domain/entities/Color";

// Contents from ./myProtVista/src/FeatureFactory.js

// Concatenation of myProtVista/style/main.css and extendProtVista/extend_style.css
const colorByTrackName = {
    chain: "#CC9933",
    transit: "#009966",
    init_met: "#996633",
    propep: "#99CCCC",
    peptide: "#006699",
    signal: "#CC0033",
    turn: "#0571AF",
    strand: "#FFCC00",
    helix: "#FF0066",
    crosslnk: "#FF6600",
    disulfid: "#23B14D",
    region: "#B33E00",
    coiled: "#006699",
    motif: "#402060",
    repeat: "#9900FF",
    ca_bind: "#FF3399",
    dna_bind: "#009933",
    domain: "#9999FF",
    zn_fing: "#990066",
    np_bind: "#FF9900",
    metal: "#009900",
    site: "#660033",
    binding: "#006699",
    act_site: "#FF6666",
    mod_res: "#000066",
    lipid: "#99CC33",
    carbohyd: "#CC3366",
    compbias: "#FF3366",
    mutagen: "#FF9900",
    conflict: "#6633CC",
    non_cons: "#FF0033",
    non_ter: "#339933",
    unsure: "#33FF00",
    non_std: "#330066",
    topo_dom: "#CC0000",
    transmem: "#CC00CC",
    intramem: "#0000CC",
    unique: "#fd5a5d",
    non_unique: "#5a60fb",
    antigen: "#996699",
    mod_res_ace: "#660000",
    mod_res_cro: "#000066",
    mod_res_cit: "#444400",
    mod_res_met: "#006600",
    mod_res_pho: "#1293be",
    mod_res_sum: "#af0066",
    mod_res_ubi: "#ff6600",
    linear_motif: "#402060",
    linear_interacting_peptide: "#cc2060",
    linear_epitope: "#83be00",
    pfam_domain: "#ffa0a0",
    smart_domain: "#a0ffa0",
    interpro_domain: "#a0a0ff",
    disprot: "#a8aff0",
    database: "#a8aff0",
    pdb_nmr: "#a8f0af",
    pdb_xray: "#f0a8af",
    inferred: "#f0a8af",
    predictors: "#ffcc66",
    long: "#ccff66",
    interacting_residues: "#006699",
    rama: "#990000",
    omega: "#992060",
    rota: "#402060",
    changed_rotamer: "#402060",
    h_bond_flip: "#cc0055",
    completed_res: "#339955",
    completed_loop: "#3355cc",
};

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
    var_seq: "variant",
    variant: "variant",
    missense: "variant", //CHECK
    ms_del: "variant", //CHECK
    insdel: "variant", //CHECK
    stop_lost: "variant", //CHECK
    stop_gained: "variant", //CHECK
    init_codon: "variant", //CHECK
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
    },
    transit: {
        label: "Transit peptide",
        tooltip: "This describes the extent of a transit peptide",
    },
    init_met: {
        label: "Initiator methionine",
        tooltip: "This indicates that the initiator methionine is cleaved from the mature protein",
    },
    propep: {
        label: "Propeptide",
        tooltip: "Part of a protein that is cleaved during maturation or activation",
    },
    peptide: {
        label: "Peptide",
        tooltip: "The position and length of an active peptide in the mature protein",
    },
    signal: { label: "Signal peptide", tooltip: "N-terminal signal peptide" },
    helix: {
        label: "Helix",
        tooltip: "The positions of experimentally determined helical regions",
    },
    strand: {
        label: "Beta strand",
        tooltip: "The positions of experimentally determined beta strands",
    },
    turn: {
        label: "Turn",
        tooltip: "The positions of experimentally determined hydrogen-bonded turns",
    },
    disulfid: {
        label: "Disulfide bond",
        tooltip: "The positions of cysteine residues participating in disulphide bonds",
    },
    crosslnk: {
        label: "Cross-link",
        tooltip:
            "Covalent linkages of various types formed between two proteins or between two parts of the same protein",
    },
    region: {
        label: "Region",
        tooltip:
            "Regions in multifunctional enzymes or fusion proteins, or characteristics of a region, e.g., protein-protein interactions mediation",
    },
    coiled: {
        label: "Coiled coil",
        tooltip:
            "Coiled coils are built by two or more alpha-helices that wind around each other to form a supercoil",
    },
    motif: {
        label: "Motif",
        tooltip: "Short conserved sequence motif of biological significance",
    },
    repeat: {
        label: "Repeat",
        tooltip: "Repeated sequence motifs or repeated domains within the protein",
    },
    ca_bind: {
        label: "Calcium binding",
        tooltip: "Calcium-binding regions, such as the EF-hand motif",
    },
    dna_bind: {
        label: "DNA binding",
        tooltip:
            "DNA-binding domains such as AP2/ERF domain, the ETS domain, the Fork-Head domain, the HMG box and the Myb domain",
    },
    domain: {
        label: "Domain",
        tooltip:
            "Specific combination of secondary structures organized into a characteristic three-dimensional structure or fold",
    },
    zn_fing: {
        label: "Zinc finger",
        tooltip:
            "Small, functional, independently folded domain that coordinates one or more zinc ions",
    },
    np_bind: {
        label: "Nucleotide binding",
        tooltip: "(aka flavin-binding). Region in the protein which binds nucleotide phosphates",
    },
    metal: {
        label: "Metal binding",
        tooltip: "Binding site for a metal ion",
    },
    site: {
        label: "Site",
        tooltip: "Any interesting single amino acid site on the sequence",
    },
    binding: {
        label: "Binding site",
        tooltip: "Binding site for any chemical group (co-enzyme, prosthetic group, etc.)",
    },
    act_site: {
        label: "Active site",
        tooltip: "Amino acid(s) directly involved in the activity of an enzyme",
    },
    mod_res: {
        label: "Modified residue",
        tooltip: "Modified residues such as phosphorylation, acetylation, acylation, methylation",
    },
    lipid: {
        label: "Lipidation",
        tooltip: "Covalently attached lipid group(s)",
    },
    carbohyd: {
        label: "Glycosylation",
        tooltip: "Covalently attached glycan group(s)",
    },
    compbias: {
        label: "Compositional bias",
        tooltip:
            "Position of regions of compositional bias within the protein and the particular amino acids that are over-represented within those regions",
    },
    conflict: {
        label: "Sequence conflict",
        tooltip: "Sequence discrepancies of unknown origin",
    },
    non_cons: {
        label: "Non-adjacent residues",
        tooltip:
            "Indicates that two residues in a sequence are not consecutive and that there is an undetermined number of unsequenced residues between them",
    },
    non_ter: {
        label: "Non-terminal residue",
        tooltip:
            "The sequence is incomplete. The residue is not the terminal residue of the complete protein",
    },
    unsure: {
        label: "Sequence uncertainty",
        tooltip:
            "Regions of a sequence for which the authors are unsure about the sequence assignment",
    },
    non_std: {
        label: "Non-standard residue",
        tooltip: "Non-standard amino acids (selenocysteine and pyrrolysine)",
    },
    mutagen: {
        label: "Mutagenesis",
        tooltip: "Site which has been experimentally altered by mutagenesis",
    },
    topo_dom: {
        label: "Topological domain",
        tooltip: "Location of non-membrane regions of membrane-spanning proteins",
    },
    transmem: {
        label: "Transmembrane",
        tooltip: "Extent of a membrane-spanning region",
    },
    intramem: {
        label: "Intramembrane",
        tooltip: "Extent of a region located in a membrane without crossing it",
    },
    variant: {
        label: "Natural variant",
        tooltip:
            "Natural variant of the protein, including polymorphisms, variations between strains, isolates or cultivars, disease-associated mutations and RNA editing events",
    },
    unique: { label: "Unique peptide", tooltip: "" },
    non_unique: { label: "Non-unique peptide", tooltip: "" },
    antigen: { label: "Antibody binding sequences", tooltip: "" },
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
    colorByTrackName,
};

interface Config {
    categories: Array<{
        name: string;
        label: string;
        tooltip?: string;
        visualizationType: "basic" | "continuous" | "variant";
    }>;
    tracks: Record<string, { label: string; tooltip: string }>;
    shapeByTrackName: Record<keyof typeof shapeByTrackName, Shape>;
    colorByTrackName: Record<keyof typeof colorByTrackName, Color>;
}

const defaultColor = "#777";

export function getColorFromString(trackName: string): Color {
    if (trackName in config.colorByTrackName) {
        return config.colorByTrackName[trackName as keyof typeof colorByTrackName];
    } else {
        return defaultColor;
    }
}

export function getShapeFromString(trackName: string): Shape | undefined {
    if (trackName in config.shapeByTrackName) {
        return config.shapeByTrackName[trackName as keyof typeof shapeByTrackName];
    } else {
        return undefined;
    }
}
