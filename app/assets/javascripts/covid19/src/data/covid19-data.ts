// @ts-nocheck
import { Covid19Data } from "./Covid19Data.types";

export const data: Covid19Data = {
    Organisms: [],
    Ligands: [],
    RefModelSources: [
        {
            name: "CERES",
            description:
                "The Cryo-EM re-refinement system (CERES) provides automatically re-refined models deposited in the Protein Data Bank that have map resolutions better than 5Å, using the latest version of phenix.real_space_refine within the Phenix software package.",
            externalLink: "https://cci.lbl.gov/ceres",
        },
        {
            name: "CSTF",
            description:
                "The Coronavirus Structural Task Force (CSTF) serve as a public global resource for the macromolecular models for 17 of the 28 different SARS-CoV and SARS-CoV-2 proteins, as well as structures of the most important human coronavirus interaction partners. All structures have been evaluated and some have been reviewed manually, atom by atom.",
            externalLink: "https://insidecorona.net/",
        },
        {
            name: "PDB-REDO",
            description:
                "The PDB-REDO databank contains optimised versions of existing PDB entries with electron density maps, a description of model changes, and a wealth of model validation data.",
            externalLink: "https://pdb-redo.eu/",
        },
        {
            name: "IDR",
            description:
                "The Image Data Resource (IDR) is a public repository of image datasets from published scientific studies, where the community can submit, search and access high-quality bio-image data.",
            externalLink: "https://idr.openmicroscopy.org/",
        },
        {
            name: "NMR",
            description:
                "The international Covid19-NMR-Consortium project works to determine RNA and protein structures of SARS-CoV-2 and to investigate the drugability of those structures by small molecules.",
            externalLink: "",
        },
    ],
    RefModelMethods: [
        {
            source: "CSTF",
            name: "Isolde",
            description:
                "These are manual re-refinements from ISOLDE in ChimeraX, done by Tristan Croll. Structures were energy-minimised, visually checked residue-by-residue and, where necessary, rebuilt. Crystal structures were further refined with phenix.refine.",
            externalLink: "https://insidecorona.net/",
        },
        {
            source: "PDB-REDO",
            name: "PDB-Redo",
            description:
                "All the entries are treated with a consistent protocol that reduces the effects of differences in age, software, and depositors. This makes PDB-REDO a great datatset for large scale structure analysis studies.",
            externalLink: "https://pdb-redo.eu/",
        },
        {
            source: "CERES",
            name: "PHENIX",
            description:
                "Re-refinements have been performed using the latest version of phenix.real_space_refine, a command-line tool inside the PHENIX software package for refinement of a model against a map. Models are taken from the Protein Data Bank and maps from the Electron Microscopy Data Bank, establishing a resolution cut-off of 5 Å because real_space_refine performs best for maps with resolutions better than 5 Å.",
            externalLink: "https://cci.lbl.gov/ceres",
        },
        {
            source: "CSTF",
            name: "Refmac",
            description:
                "These are manual re-refinements from coot and REFMAC5 done by Dr. Sam Horrell. Structures were validated using inbuilt validation tools from coot in combination with validation through the molprobity server (Duke University School of Medicine).",
            externalLink: "https://insidecorona.net/",
        },
        {
            source: "IDR",
            name: "IDR",
            description:
                "High throughput sample analysis of collections of compounds that provide a variety of chemically diverse structures that can be used to identify structure types that have affinity with pharmacological targets. (Source Accession: EFO_0007553)",
            externalLink: "https://idr.openmicroscopy.org/",
        },
        {
            source: "NMR",
            name: "NMR",
            description:
                "NMR-based screening using a fragment library for binding to 25 SCoV2 proteins and identification of hits also against previously unexplored SCoV2 proteins. Computational mapping has been used to predict binding sites and identify functional moieties (chemotypes) of the ligands occupying these pockets.",
            externalLink: "",
        },
    ],
    Structures: [],
};
