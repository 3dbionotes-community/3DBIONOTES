import _ from "lodash";
import { recordOf } from "../../utils/ts-utils";
import { SubtrackDefinition, TrackDefinition } from "../entities/TrackDefinition";
import i18n from "../utils/i18n";
import { subtracks } from "./subtracks";

export const trackDefinitions = recordOf<TrackDefinition>()({
    structureCoverage: {
        id: "structure-coverage",
        name: i18n.t("Structure Coverage"),
        description: i18n.t("Coverage of the sequence shown with the primary protein sequence"),
        subtracks: [subtracks.structureCoverage],
    },
    domains: {
        id: "domains" as const,
        name: i18n.t("Domains"),
        description: i18n.t(
            "Specific combination of secondary structures origanized intro a characteristic 3D structure"
        ),
        subtracks: [
            subtracks.prositeDomain,
            subtracks.pfamDomain,
            subtracks.smartDomains,
            subtracks.interproDomains,
            subtracks.cathDomains,
        ],
    },
    celullarRegions: {
        id: "topology" as const,
        name: i18n.t("Cellular regions"),
        description: i18n.t("Cell space in which the protein is located"),
        subtracks: [subtracks.cytolosic, subtracks.transmembraneRegion],
    },
    secondaryStructure: {
        id: "secondary-structure" as const,
        name: i18n.t("Secondary Structure (structural features)"),
        description: i18n.t(
            "The secondary structure of proteins is the local regular folding between nearby amino acid residues of the polypeptide chain. The most common structures are alpha helix, beta sheet and turns connecting them"
        ),
        subtracks: [subtracks.helix, subtracks.betaStrand, subtracks.turn],
    },
    disorderedRegions: {
        id: "disordered-regions" as const,
        name: i18n.t("Disordered regions"),
        description: i18n.t(
            "Intrinsically disordered regions are region that do not have a fixed or ordered three-dimensional structure. They can possess many functions. They can, e.g., bind other proteins, interact with nucleic acids, or serve as scaffold proteins. Commonly, they are also involved in signaling pathways and have important roles in protein regulation"
        ),
        subtracks: [subtracks.prediction],
    },
    motifs: {
        id: "motifs" as const,
        name: i18n.t("Motifs"),
        description: i18n.t(
            "Short (usually not more than 20 amino acids) conserved sequence motif of biological significance"
        ),
        subtracks: [subtracks.motifs],
    },
    regions: {
        id: "regions" as const,
        name: i18n.t("Regions"),
        description: i18n.t("Regions in the protein with biological relevance"),
        subtracks: [subtracks.regions],
    },
    otherRegions: {
        id: "other-structural-regions" as const,
        name: i18n.t("Other structural regions"),
        description: i18n.t(
            "This are regions that interactiing with other peptides. Protein-protein interactions are often mediated by short linear motifs (SLiMs) that are  normall+P38:AA39y located in intrinsically disordered regions (IDRs) of proteins"
        ),
        subtracks: [
            subtracks.coiledCoils,
            subtracks.linearInteractingPeptide,
            subtracks.repeats,
            subtracks.zincFinger,
        ],
    },
    sites: {
        id: "sites" as const,
        name: i18n.t("Sites"),
        description: i18n.t(
            "Amino acids that have a relevant biological function, such as the union of different chemical groups or being part of the active center of an enzyme"
        ),
        subtracks: [
            subtracks.activeSite,
            subtracks.bindingSite,
            subtracks.nucleotidesBinding,
            subtracks.metalBinding,
            subtracks.otherStructuralRelevantSites,
        ],
    },
    molecularProcessing: {
        id: "molecular-processing" as const,
        name: i18n.t("Molecular processing"),
        description: i18n.t(
            "Molecular protein processing involves processing the protein to its active form, such as signal peptide removal, residue modification (glycosylation, phosphorylation, etc.), and cleavage of the original chain into several smaller chains"
        ),
        subtracks: [subtracks.signalPeptide, subtracks.chain],
    },
    ptm: {
        id: "ptm" as const,
        name: i18n.t("PTM"),
        description: i18n.t("Post-translational modifications of protein residues"),
        subtracks: [
            subtracks.acetylation,
            subtracks.disulfideBond,
            subtracks.glycosylation,
            subtracks.methylation,
            subtracks.modifiedResidue,
            subtracks.phosphorylation,
            subtracks.ubiquitination,
        ],
    },
    sequenceInformation: {
        id: "sequence-information" as const,
        name: i18n.t("Sequence information"),
        description: i18n.t(
            "Information regarding the protein sequence and the possible mutations that may be included in the structure compared to the reference sequence"
        ),
        subtracks: [subtracks.compositionalBias, subtracks.sequenceConflict],
    },
    pdbRedo: {
        id: "pdb-redo" as const,
        name: i18n.t("PDB-REDO"),
        description: i18n.t(
            "DB-REDO is a procedure to optimise crystallographic structure models, providing algorithms that make a fully automated decision making system for refinement, rebuilding and validation. It combines popular crystallographic software from CCP4, e.g. REFMAC and COOT, with  specially developed rebuilding tools Centrifuge, Pepflip & SideAide and structure analysis tools like WHAT IF and PDB-care. PDB-REDO optimises refinement settings (e.g. geometric and B-factor restraint weights, B-factor model, TLS groups, NCS and homology restraints), refines with REFMAC, partially rebuilds the structure (rejects waters, refines side chains, checks peptide planes), refines some more, and then validates the results.\nWe show the modified and refined residues by PDB-REDO"
        ),
        subtracks: [subtracks.changedRotamers, subtracks.hBondFlip, subtracks.completedResidues],
    },
    molprobity: {
        id: "molprobity" as const,
        name: i18n.t("Molprobity"),
        description: i18n.t(
            "MolProbity is a structure validation web service that provides a robust, broad-spectrum assessment of model quality at both global and local protein levels. It relies heavily on the power and sensitivity provided by optimized hydrogen placement and contact analysis of all atoms, complemented by analysis of the covalent geometry and torsion angle criteria. MolProbity detects less credible or impossible rotamers and torsion angles."
        ),
        subtracks: [subtracks.rotamerOutlier, subtracks.phiPsiOutliers],
    },
    emValidation: {
        id: "em-validation" as const,
        name: i18n.t("EM - Validation"),
        description: i18n.t(
            "Different validation methods and local quality of models and maps in cryo-EM"
        ),
        subtracks: [subtracks.deepRes, subtracks.mapQ, subtracks.fscQ, subtracks.monoRes],
    },
    pockets: {
        id: "pockets" as const,
        name: i18n.t("Pockets"),
        description: i18n.t(
            "A pocket is a cavity on the surface or in the interior of a protein that possesses suitable properties for binding a ligand or interacting with a protein. The set of amino acid residues around a binding pocket determines its physicochemical characteristics and, together with its shape and location in a protein, defines its functionality"
        ),
        subtracks: [subtracks.pockets],
    },
    residueAccessibility: {
        id: "residue-accessibility" as const,
        name: i18n.t("Residue accesibility"),
        description: i18n.t(
            "The accessibility of residues in a protein is defined as the extent of the solvent-accessible surface of a given residue and is related to the spatial arrangement and packaging of the residue. It reveals the folding state of proteins and has been considered a significant quantitative measure for the three-dimensional structures of proteins. It  is closely involved in structural domains identification, fold recognition, binding region identification, protein-protein  and protein-ligand interactions"
        ),
        subtracks: [subtracks.residueAccessibility],
    },
    ppiViewer: {
        id: "ppi-viewer" as const,
        name: i18n.t("PPI Viewer"),
        description: i18n.t("Protein-protein interaction networks graph"),
        subtracks: [subtracks.proteinNetwork, subtracks.pdbList],
    },
    functionalMappingPpi: {
        id: "functional-mapping-ppi" as const,
        name: i18n.t("Functional mapping ppi"),
        description: i18n.t("Functional mapping description (TODO)"),
        subtracks: [subtracks.functionalMappingPPI],
    },
    ligands: {
        id: "ligands" as const,
        name: i18n.t("Ligands"),
        description: i18n.t(""),
        subtracks: [subtracks.ligands],
    },
    functionalMappingLigands: {
        id: "functional-mapping-ligands" as const,
        name: i18n.t("Functional mapping ligands"),
        description: i18n.t(
            "Residues that participate in the interaction between the protein and the ligand. Only available for covid 19 related proteins"
        ),
        subtracks: [subtracks.functionalMappingLigands, subtracks.panddaDrugScreeningDiamong],
    },
    geneViewer: {
        id: "gene-viewer" as const,
        name: i18n.t("Gene viewer"),
        description: i18n.t("ENSEMBL database viewer"),
        subtracks: [subtracks.geneViewer],
    },
    mutagenesis: {
        id: "mutagenesis" as const,
        name: i18n.t("Mutagenesis experiments"),
        subtracks: [subtracks.mutagenesis],
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
        subtracks: [subtracks.uniquePeptide, subtracks.nonUniquePeptide],
    },
    epitomes: {
        id: "epitomes" as const,
        name: i18n.t("Epitomes"),
        description: i18n.t(
            "An epitope is the portion of a macromolecule that is recognized by the immune system, specifically the sequence to which antibodies or B-cell and T-cell receptors bind"
        ),
        subtracks: [subtracks.linearEpitomesN, subtracks.linearEpitomes],
    },
    antigenicSequence: {
        id: "antigenic-sequence" as const,
        name: i18n.t("Antigenic sequence"),
        description: i18n.t(
            "An antigenic sequence is a region of the protein that triggers the formation of antibodies and can cause an immune response"
        ),
        subtracks: [subtracks.abBindingSequence],
    },
});

export function getTracksFromSubtrack(subtrack: SubtrackDefinition): TrackDefinition[] {
    return _(trackDefinitions)
        .values()
        .filter(track => track.subtracks.includes(subtrack.dynamicSubtrack || subtrack))
        .value();
}
