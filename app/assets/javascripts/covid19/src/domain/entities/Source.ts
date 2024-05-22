/* Transition from JSON to API, co-existing with ValidationSource[] for now */

type Reference = {
    name: string;
    description: string;
    externalLink: string;
};

type Method = Reference;

export type Source = Reference & {
    name: SourceName;
    methods: Method[];
};

type SourceName = "CERES" | "CSTF" | "PDB-REDO" | "IDR" | "NMR";
