import _ from "lodash";
import { SubtrackDefinition, TrackDefinition } from "../entities/TrackDefinition";
import i18n from "../utils/i18n";
import { subtracks } from "./subtracks";

export const trackDefinitions = {
    structureCoverage: definition({
        id: "structure-coverage",
        name: i18n.t("Structure Coverage"),
        description: i18n.t("Segments of the protein sequence traced in the atomic model."),
        subtracks: [subtracks.structureCoverage],
    }),
    domains: definition({
        id: "domains" as const,
        name: i18n.t("Domains"),
        description: i18n.t(
            "Domain composition retrieved from databases Prosite, Pfam, Smart, InterPro, and CATH."
        ),
        subtracks: [
            subtracks.prositeDomain,
            subtracks.pfamDomain,
            subtracks.smartDomains,
            subtracks.interproDomains,
            subtracks.cathDomains,
        ],
    }),
    cellTopology: definition({
        id: "topology" as const,
        name: i18n.t("Cell topology"),
        description: i18n.t(
            "Segments of the protein that are soluble (located in the cytosol or in the extracellular environment) or insoluble (embeded in the cell plasma membrane)."
        ),
        subtracks: [subtracks.cytolosic, subtracks.transmembraneRegion],
    }),
    secondaryStructure: definition({
        id: "secondary-structure" as const,
        name: i18n.t("Secondary Structure"),
        description: i18n.t("Segments of the protein folded as alpha-helix, beta strand or turn."),
        subtracks: [subtracks.helix, subtracks.betaStrand, subtracks.turn],
    }),
    disorderedRegions: definition({
        id: "disordered-regions" as const,
        name: i18n.t("Disordered regions"),
        description: i18n.t("Intrinsically disordered regions (IDPRs)."),
        subtracks: [subtracks.prediction],
    }),
    motifs: definition({
        id: "motifs" as const,
        name: i18n.t("Motifs"),
        description: i18n.t(
            "Short (usually not more than 20 amino acids) conserved sequence of potential biological significance"
        ),
        subtracks: [subtracks.motifs],
    }),
    regions: definition({
        id: "regions" as const,
        name: i18n.t("Regions"),
        description: i18n.t("Regions in the protein with biological relevance"),
        subtracks: [subtracks.regions],
    }),
    otherRegions: definition({
        id: "other-structural-regions" as const,
        name: i18n.t("Other structural regions"),
        description: i18n.t(
            "Coiled coils, small linear interacting peptides (SLiM), sequence block repeats, and zinc fingers."
        ),
        subtracks: [
            subtracks.coiledCoils,
            subtracks.linearInteractingPeptide,
            subtracks.repeats,
            subtracks.zincFinger,
        ],
    }),
    sites: definition({
        id: "sites" as const,
        name: i18n.t("Sites"),
        description: i18n.t(
            "Catalytic residues in the active site, as well as residues that interact with other proteins, nucleic acids, ligands, metals or other chemical groups"
        ),
        subtracks: [
            subtracks.activeSite,
            subtracks.bindingSite,
            subtracks.nucleotidesBinding,
            subtracks.metalBinding,
            subtracks.otherStructuralRelevantSites,
        ],
    }),
    proteolyticProcessing: definition({
        id: "proteolytic-processing" as const,
        name: i18n.t("Proteolytic processing"),
        description: i18n.t(
            "Proteolytic processing to remove the signal peptide or to release each protein chain from a polyprotein (that includes several proteins generated in a single step of transcription and translation)."
        ),
        subtracks: [subtracks.signalPeptide, subtracks.chain],
    }),
    ptm: definition({
        id: "ptm" as const,
        name: i18n.t("Modified residue"),
        description: i18n.t(
            "Chemical modifications of specific protein residues such as acetylation, glycosilation, phosphorilation or methylation."
        ),
        subtracks: [
            subtracks.acetylation,
            subtracks.disulfideBond,
            subtracks.glycosylation,
            subtracks.methylation,
            subtracks.modifiedResidue,
            subtracks.phosphorylation,
            subtracks.ubiquitination,
        ],
    }),
    sequenceInformation: definition({
        id: "sequence-information" as const,
        name: i18n.t("Sequence information"),
        description: i18n.t(
            "Information regarding the protein sequence and the possible mutations that may be included in the structure compared to the reference sequence."
        ),
        subtracks: [subtracks.compositionalBias, subtracks.sequenceConflict],
    }),
    pdbRedo: definition({
        id: "pdb-redo" as const,
        name: i18n.t("PDB-REDO"),
        description: i18n.t(
            `PDB-REDO is a procedure to optimise crystallographic structure models, providing algorithms that make a fully automated decision making system for refinement, rebuilding and validation. It combines popular crystallographic software from CCP4, e.g. REFMAC and COOT, with  specially developed rebuilding tools Centrifuge, Pepflip & SideAide and structure analysis tools like WHAT IF and PDB-care. PDB-REDO optimises refinement settings (e.g. geometric and B-factor restraint weights, B-factor model, TLS groups, NCS and homology restraints), refines with REFMAC, partially rebuilds the structure (rejects waters, refines side chains, checks peptide planes), refines some more, and then validates the results.
            We show the modified and refined residues by PDB-REDO`
        ),
        subtracks: [subtracks.changedRotamers, subtracks.hBondFlip, subtracks.completedResidues],
    }),
    molprobity: definition({
        id: "molprobity" as const,
        name: i18n.t("Molprobity"),
        description: i18n.t(
            "MolProbity is a structure validation web service that provides a robust, broad-spectrum assessment of model quality at both global and local protein levels. It relies heavily on the power and sensitivity provided by optimized hydrogen placement and contact analysis of all atoms, complemented by analysis of the covalent geometry and torsion angle criteria. MolProbity detects less credible or impossible rotamers and torsion angles."
        ),
        subtracks: [subtracks.rotamerOutlier, subtracks.phiPsiOutliers],
    }),
    validationLocalResolution: definition({
        id: "em-validation-local-resolution" as const,
        name: i18n.t("Validation - Local Resolution"),
        description: i18n.t(
            "Different validation methods and local quality of the map-to-models fit in cryo-EM"
        ),
        subtracks: [subtracks.deepRes, subtracks.monoRes, subtracks.blocRes],
    }),
    validationMapToModel: definition({
        id: "em-validation-map-to-model" as const,
        name: i18n.t("Validation - Map to model"),
        description: i18n.t(
            "Different validation methods and local quality of the map-to-models fit in cryo-EM"
        ),
        subtracks: [subtracks.fscQ, subtracks.mapQ, subtracks.daq],
    }),
    pockets: definition({
        id: "pockets" as const,
        name: i18n.t("Pockets"),
        description: i18n.t(
            "A pocket is a cavity on the surface or in the interior of a protein that possesses suitable properties for binding a ligand or interacting with a protein. The set of amino acid residues around a binding pocket determines its physicochemical characteristics and, together with its shape and location in a protein, defines its functionality"
        ),
        subtracks: [subtracks.pockets],
    }),
    residueAccessibility: definition({
        id: "residue-accessibility" as const,
        name: i18n.t("Residue accesibility"),
        description: i18n.t("Solvent-accessible surface per residue."),
        subtracks: [subtracks.residueAccessibility],
    }),
    ppiViewer: definition({
        id: "ppi-viewer" as const,
        name: i18n.t("PPI Viewer"),
        subtracks: [subtracks.proteinNetwork],
    }),
    functionalMappingPpi: definition({
        id: "functional-mapping-ppi" as const,
        name: i18n.t("Functional mapping ppi"),
        subtracks: [subtracks.functionalMappingPPI],
    }),
    ligands: definition({
        id: "ligands" as const,
        name: i18n.t("Ligands"),
        subtracks: [subtracks.ligands],
    }),
    nmr: definition({
        id: "nmr" as const,
        name: i18n.t("Functional mapping ligands"),
        subtracks: [subtracks.nmr],
    }),
    functionalMappingLigands: definition({
        id: "functional-mapping-ligands" as const,
        name: i18n.t("Functional mapping ligands"),
        description: i18n.t(
            "Residues that participate in the interaction between the protein and the ligand. Only available for covid 19 related proteins"
        ),
        subtracks: [subtracks.functionalMappingLigands, subtracks.panddaDrugScreeningDiamond],
    }),
    geneViewer: definition({
        id: "gene-viewer" as const,
        name: i18n.t("Gene viewer"),
        // description: i18n.t("ENSEMBL database viewer"),
        subtracks: [subtracks.geneViewer],
    }),
    mutagenesis: definition({
        id: "mutagenesis" as const,
        name: i18n.t("Mutagenesis experiments"),
        subtracks: [subtracks.mutagenesis],
    }),
    variants: definition({
        id: "variants" as const,
        name: i18n.t("Variants"),
        subtracks: [
            {
                id: "variants" as const,
                name: i18n.t("Variants"),
                source: "Uniprot, BioMutaDB, Ensembl, CNCB, Large scale studies",
            },
        ],
    }),
    peptides: definition({
        id: "peptides" as const,
        name: i18n.t("Peptides"),
        description: i18n.t(
            "Peptides generated in silico by Uniprot using rules based on mass spectrometry experiments and comparing with peptides already identified in proteomics repositories. Only those that have already been identified are shown on the track."
        ),
        subtracks: [subtracks.uniquePeptide, subtracks.nonUniquePeptide],
    }),
    epitomes: definition({
        id: "epitomes" as const,
        name: i18n.t("Epitomes"),
        description: i18n.t(
            "An epitope is the portion of a macromolecule that is recognized by the immune system, specifically the sequence to which antibodies or B-cell and T-cell receptors bind."
        ),
        subtracks: [subtracks.linearEpitomesN, subtracks.linearEpitomes],
    }),
    antigenicSequence: definition({
        id: "antigenic-sequence" as const,
        name: i18n.t("Antigenic sequence"),
        description: i18n.t(
            "An antigenic sequence is a region of the protein that triggers the formation of antibodies and can cause an immune response."
        ),
        subtracks: [subtracks.abBindingSequence],
    }),
};

export function getTracksFromSubtrack(subtrack: SubtrackDefinition): TrackDefinition[] {
    // Check subtrack ID instead of full subtrack so we match subtracks with custom names (i.e. em-validation)
    const subtrackId = subtrack.dynamicSubtrack?.id || subtrack.id;

    return _(trackDefinitions)
        .values()
        .filter(track => track.subtracks.map(subtrack => subtrack.id).includes(subtrackId))
        .value();
}

function definition(value: TrackDefinition): TrackDefinition {
    return value;
}
