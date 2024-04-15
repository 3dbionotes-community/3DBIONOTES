type Reference<Name extends string> = {
    name: Name;
    description: string;
    externalLink: string;
};

type Method = Reference<MethodName>;

export interface Source extends Reference<SourceName> {
    methods: Method[];
}

type SourceName =
    | "CERES"
    | "CSTF"
    | "PDB-REDO"
    | "The Image Data Resource (IDR)" /* to update in BWS to just IDR and NMR*/
    | "The COVID19-NMR Consortium";

type MethodName =
    | "Isolde"
    | "PHENIX"
    | "PDB-Redo"
    | "Refmac"
    | "NMR-based fragment screening"
    | "High-Content Screening Assay";
