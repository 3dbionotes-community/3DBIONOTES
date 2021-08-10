import { Covid19Data } from "./Covid19Data.types";

export const data: Covid19Data = {
    Organisms: {
        "9606": {
            name: "Homo sapiens",
            externalLink: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=9606",
        },
        "9986": {
            name: "Oryctolagus cuniculus",
            externalLink: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=9986",
        },
        "2697049": {
            name: "Severe acute respiratory syndrome coronavirus 2",
            externalLink: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=2697049",
        },
        "694009": {
            name: "Severe acute respiratory syndrome-related coronavirus",
            externalLink: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=694009",
        },
        "32630": {
            name: "synthetic construct",
            externalLink: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=32630",
        },
    },
    Entities: {
        P0DTC2: {
            name: ["S", "Spike entity"],
            description: "Spike entity, ...",
            externalLink: "https://www.uniprot.org/uniprot/P0DTC2",
        },
        P0DTD1: {
            name: [
                "NSP3",
                "Non-structural entity 3",
                "PL-Pro",
                "Papain-like entityase",
                "Macro domain",
            ],
            description: "Multifunctional entity involved in the ...",
            externalLink: "https://www.uniprot.org/uniprot/P0DTD1",
        },
        Q9BYF1: {
            name: ["ACE2", "Angiotensin-converting enzyme 2"],
            description: "Essential counter-regulatory carboxypeptidase of the ...",
            externalLink: "https://www.uniprot.org/uniprot/Q9BYF1",
        },
        P59594: {
            name: ["S", "Spike entity"],
            description: "Spike entity, ...",
            externalLink: "https://www.uniprot.org/uniprot/P59594",
        },
        "Fab 2-7": null,
        "Synthetic nanobody mNb6": null,
    },
    Ligands: {
        NAG: {
            name: [
                "2-acetamido-2-deoxy-beta-D-glucopyranose",
                "N-acetyl-beta-D-glucosamine",
                "2-acetamido-2-deoxy-beta-D-glucose",
                "2-acetamido-2-deoxy-D-glucose",
                "2-acetamido-2-deoxy-glucose",
                "N-ACETYL-D-GLUCOSAMINE",
            ],
            InnChIKey: "OVRNDRQMDRJTHS-FMDGEEDCSA-N",
            imageLink: ["https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/NAG_400.svg"],
            externalLink: ["https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/NAG"],
        },
        "NAG-NAG": {
            name: [
                "2-acetamido-2-deoxy-beta-D-glucopyranose-(1-4)-2-acetamido-2-deoxy-beta-D-glucopyranose",
            ],
            type: "Carbohydrate polymer",
            components: ["NAG", "NAG"],
        },
        "BMA-NAG-NAG": {
            name: [
                "beta-D-mannopyranose-(1-4)-2-acetamido-2-deoxy-beta-D-glucopyranose-(1-4)-2-acetamido-2-deoxy-beta-D-glucopyranose",
            ],
            type: "Carbohydrate polymer",
            components: ["BMA", "NAG", "NAG"],
        },
        "NAG-BMA-NAG-NAG": {
            name: [
                "2-acetamido-2-deoxy-beta-D-glucopyranose-(1-3)-beta-D-mannopyranose-(1-4)-2-acetamido-2-deoxy-beta-D-glucopyranose-(1-4)-2-acetamido-2-deoxy-beta-D-glucopyranose",
            ],
            type: "Carbohydrate polymer",
            components: ["NAG", "BMA", "NAG", "NAG"],
        },
        EDO: {
            name: ["1,2-ETHANEDIOL", "ETHYLENE GLYCOL"],
            InnChIKey: "LYCAIKOWRPUZTN-UHFFFAOYSA-N",
            imageLink: ["https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/EDO_400.svg"],
            externalLink: ["https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/EDO"],
        },
        DMS: {
            name: ["DIMETHYL SULFOXIDE"],
            InnChIKey: "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
            imageLink: ["https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/DMS_400.svg"],
            externalLink: ["https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/DMS"],
        },
    },
    Structures: [
        {
            title: ["Structure of post fusion core of 2019-nCoV S2 subunit"],
            entity: ["Q9BYF1", "P0DTC2", "P59594"],
            pdb: {
                id: "6vw1",
                imageLink: [
                    "https://www.ebi.ac.uk/pdbe/static/entry/6vw1_deposited_chain_front_image-200x200.png",
                    "https://cdn.rcsb.org/images/structures/vw/6vw1/6vw1_model-1.jpeg",
                    "https://cdn.rcsb.org/images/structures/vw/6vw1/6vw1_assembly-1.jpeg",
                ],
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/6vw1",
                    "https://www.rcsb.org/structure/6vw1",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=6vw1"],
                validation: {
                    "pdb-redo": {
                        externalLink: ["https://pdb-redo.eu/db/6vw1"],
                        queryLink: ["http://3dbionotes.cnb.csic.es/pdb_redo/6vw1"],
                        badgeColor: "w3-turq",
                    },
                    isolde: {
                        queryLink: ["http://rinchen-dos.cnb.csic.es/isolde/6vw1/6vw1_refine_7"],
                        badgeColor: "w3-cyan",
                    },
                },
            },
            emdb: {
                id: "EMD-23215",
                method: "Single particle reconstruction",
                resolution: "3.29",
                imageLink: ["https://www.ebi.ac.uk/pdbe/static/entry/EMD-23215/400_23215.gif"],
                externalLink: ["https://www.ebi.ac.uk/pdbe/entry/emdb/EMD-23215"],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=EMD-23215"],
            },
            organism: ["9606", "2697049", "694009"],
            compModel: {
                source: "SWISS-MODEL",
                project: "7dVLxC",
                model: "01",
                imageLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/01.png"],
                externalLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/01.pdb"],
                queryLink: ["https://3dbionotes.cnb.csic.es/models/P0DTC2/swiss-model/7dVLxC-01"],
            },
            ligand: [
                {
                    NAG: {
                        instances: 3,
                    },
                },
                {
                    "NAG-NAG": {
                        instances: 5,
                    },
                },
                {
                    "BMA-NAG-NAG": {
                        instances: 3,
                    },
                },
                {
                    "NAG-BMA-NAG-NAG": {
                        instances: 1,
                    },
                },
                {
                    EDO: {
                        instances: 4,
                    },
                },
            ],
        },
        {
            title: ["Cryo-EM structure of protein encoded by vaccine candidate BNT162b2"],
            entity: ["P0DTC2"],
            pdb: {
                id: "7l7k",
                method: "Electron Microscopy",
                resolution: "3.29",
                imageLink: [
                    "https://www.ebi.ac.uk/pdbe/static/entry/7l7k_deposited_chain_front_image-200x200.png",
                    "https://cdn.rcsb.org/images/structures/vw/7l7k/7l7k_model-1.jpeg",
                    "https://cdn.rcsb.org/images/structures/vw/7l7k/7l7k_assembly-1.jpeg",
                ],
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/7l7k",
                    "https://www.rcsb.org/structure/7l7k",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=7l7k"],
            },
            emdb: {
                id: "EMD-23215",
                method: "Single particle reconstruction",
                resolution: "3.29",
                imageLink: ["https://www.ebi.ac.uk/pdbe/static/entry/EMD-23215/400_23215.gif"],
                externalLink: ["https://www.ebi.ac.uk/pdbe/entry/emdb/EMD-23215"],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=EMD-23215"],
            },
            organism: ["2697049"],
            compModel: {
                source: "BSM-Arc",
                model: "YP_009724390_v03_1",
                externalLink: ["https://bsma.pdbj.org/entry/15"],
                queryLink: [
                    "https://3dbionotes.cnb.csic.es/models/P0DTC2/BSM-Arc/YP_009724390_v03_1",
                ],
            },
        },
        {
            entity: ["P0DTC2", "Fab 2-7"],
            pdb: {
                id: "7lss",
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/7lss",
                    "https://www.rcsb.org/structure/7lss",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=7lss"],
                validation: {},
            },
            emdb: {
                id: "EMD-23507",
                method: "Single particle reconstruction",
                resolution: "3.72",
                imageLink: ["https://www.ebi.ac.uk/pdbe/static/entry/EMD-23507/400_23507.gif"],
                externalLink: ["https://www.ebi.ac.uk/pdbe/entry/emdb/EMD-23507"],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=EMD-23507"],
                validation: ["DeepRes", "MonoRes", "Map-Q", "FSC-Q"],
            },
            organism: ["2697049", "9606"],
            compModel: null,
            ligand: [
                {
                    NAG: {
                        instances: 30,
                    },
                },
                {
                    "NAG-NAG": {
                        instances: 6,
                    },
                },
            ],
        },
        {
            entity: ["P0DTC2", "Synthetic nanobody mNb6"],
            pdb: {
                id: "7kkl",
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/7kkl",
                    "https://www.rcsb.org/structure/7kkl",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=7kkl"],
                validation: {},
            },
            emdb: {
                id: "EMD-22910",
                imageLink: ["https://www.ebi.ac.uk/pdbe/static/entry/EMD-22910/400_22910.gif"],
                externalLink: ["https://www.ebi.ac.uk/pdbe/entry/emdb/EMD-22910"],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=EMD-22910"],
                validation: ["DeepRes", "MonoRes", "Map-Q", "FSC-Q"],
            },
            organism: ["2697049", "32630"],
            compModel: null,
            ligand: [
                {
                    NAG: {
                        instances: 27,
                    },
                },
                {
                    "NAG-NAG": {
                        instances: 18,
                    },
                },
            ],
        },
        {
            title: [
                "PanDDA analysis group deposition -- Crystal Structure of SARS-CoV-2 Nsp3 macrodomain in complex with EN300-321461",
            ],
            entity: ["P0DTD1"],
            pdb: {
                id: "5s18",
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/5s18",
                    "https://www.rcsb.org/structure/5s18",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=5s18"],
                validation: {},
            },
            emdb: null,
            organism: ["2697049"],
            compModel: null,
            ligand: [
                {
                    WOY: {
                        instances: 1,
                    },
                },
                {
                    DMS: {
                        instances: 2,
                    },
                },
            ],
        },
        {
            title: [
                "PanDDA analysis group deposition -- Crystal Structure of SARS-CoV-2 Nsp3 macrodomain in complex with EN300-43406",
            ],
            entity: ["P0DTD1"],
            pdb: {
                id: "5s1a",
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/5s1a",
                    "https://www.rcsb.org/structure/5s1a",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=5s1a"],
                validation: {},
            },
            emdb: null,
            organism: ["2697049"],
            compModel: null,
            ligand: [
                {
                    WPS: {
                        instances: 1,
                    },
                },
            ],
        },
        {
            title: [
                "PanDDA analysis group deposition -- Crystal Structure of SARS-CoV-2 Nsp3 macrodomain in complex with Z3034471507",
            ],
            entity: ["P0DTD1"],
            pdb: {
                id: "5s1c",
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/5s1c",
                    "https://www.rcsb.org/structure/5s1c",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=5s1c"],
                validation: {},
            },
            emdb: null,
            organism: ["2697049"],
            compModel: null,
            ligand: [
                {
                    WPV: {
                        instances: 1,
                    },
                },
                {
                    DMS: {
                        instances: 2,
                    },
                },
            ],
        },
        {
            entity: ["P0DTC2"],
            pdb: null,
            emdb: null,
            organism: ["2697049"],
            compModel: {
                source: "SWISS-MODEL",
                project: "7dVLxC",
                model: "01",
                imageLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/01.png"],
                externalLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/01.pdb"],
                queryLink: ["https://3dbionotes.cnb.csic.es/models/P0DTC2/swiss-model/7dVLxC-01"],
            },
        },
        {
            entity: ["P0DTC2"],
            pdb: null,
            emdb: null,
            organism: ["2697049"],
            compModel: {
                source: "SWISS-MODEL",
                project: "7dVLxC",
                model: "02",
                imageLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/02.png"],
                externalLink: ["https://swissmodel.expasy.org/interactive/7dVLxC/models/02.pdb"],
                queryLink: ["https://3dbionotes.cnb.csic.es/models/P0DTC2/swiss-model/7dVLxC-02"],
            },
        },
        {
            entity: ["P0DTC2"],
            pdb: null,
            emdb: null,
            organism: ["2697049"],
            compModel: {
                source: "BSM-Arc",
                model: "YP_009724390_v03_1",
                externalLink: ["https://bsma.pdbj.org/entry/15"],
                queryLink: [
                    "https://3dbionotes.cnb.csic.es/models/P0DTC2/BSM-Arc/YP_009724390_v03_1",
                ],
            },
        },
        {
            entity: ["P0DTC2"],
            pdb: null,
            emdb: null,
            organism: ["2697049"],
            compModel: {
                source: "BSM-Arc",
                model: "YP_009724390_v03_2",
                externalLink: ["https://bsma.pdbj.org/entry/15"],
                queryLink: [
                    "https://3dbionotes.cnb.csic.es/models/P0DTC2/BSM-Arc/YP_009724390_v03_2",
                ],
            },
        },
        {
            title: [
                "Rabbit 80S ribosome colliding in another ribosome stalled by the SARS-CoV-2 pseudoknot",
            ],
            entity: [
                "P0DTC2",
                "G1TIB4",
                "G1SK22",
                "G1T8A2",
                "eS26-Fragment",
                "G1SJB4",
                "G1U7M4",
                "EDF1",
                "G1TLT8",
                "G1SS70",
                "uS5",
                "G1TNM3",
            ],
            pdb: {
                id: "7o81",
                method: "Electron Microscopy",
                resolution: "3.1",
                imageLink: [
                    "https://www.ebi.ac.uk/pdbe/static/entry/7o81_deposited_chain_front_image-200x200.png",
                    "https://cdn.rcsb.org/images/structures/vw/7o81/7o81_model-1.jpeg",
                    "https://cdn.rcsb.org/images/structures/vw/7o81/7o81_assembly-1.jpeg",
                ],
                externalLink: [
                    "https://www.ebi.ac.uk/pdbe/entry/pdb/7o81",
                    "https://www.rcsb.org/structure/7o81",
                ],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=7o81"],
            },
            emdb: {
                id: "EMD-12759",
                method: "Single particle reconstruction",
                resolution: "3.1",
                imageLink: ["https://www.ebi.ac.uk/pdbe/static/entry/EMD-12759/400_12759.gif"],
                externalLink: ["https://www.ebi.ac.uk/pdbe/entry/emdb/EMD-12759"],
                queryLink: ["http://3dbionotes.cnb.csic.es/?queryId=EMD-12759"],
            },
            organism: ["2697049", "9986"],
            compModel: null,
            ligand: [
                {
                    SPD: {
                        instances: 1,
                    },
                },
                {
                    A2M: {
                        instances: 33,
                    },
                },
                {
                    PSU: {
                        instances: 98,
                    },
                },
                {
                    OMU: {
                        instances: 17,
                    },
                },
                {
                    OMC: {
                        instances: 20,
                    },
                },
                {
                    OMG: {
                        instances: 30,
                    },
                },
                {
                    G7M: {
                        instances: 1,
                    },
                },
                {
                    "6Mz": {
                        instances: 2,
                    },
                },
                {
                    MA6: {
                        instances: 2,
                    },
                },
                {
                    "5MU": {
                        instances: 2,
                    },
                },
                {
                    SAC: {
                        instances: 3,
                    },
                },
                {
                    NMM: {
                        instances: 1,
                    },
                },
                {
                    HY3: {
                        instances: 1,
                    },
                },
                {
                    "1MA": {
                        instances: 1,
                    },
                },
                {
                    "5MC": {
                        instances: 2,
                    },
                },
                {
                    UR3: {
                        instances: 1,
                    },
                },
                {
                    GTP: {
                        instances: 1,
                    },
                },
                {
                    HIC: {
                        instances: 1,
                    },
                },
                {
                    AYA: {
                        instances: 1,
                    },
                },
                {
                    MLZ: {
                        instances: 2,
                    },
                },
                {
                    M3L: {
                        instances: 1,
                    },
                },
            ],
        },
    ],
};
