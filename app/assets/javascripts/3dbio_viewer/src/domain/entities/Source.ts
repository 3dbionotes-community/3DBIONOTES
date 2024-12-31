import { Maybe } from "../../utils/ts-utils";

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

export function getSource(sources: Source[], source: SourceName): Maybe<Source> {
    return sources.find(s => s.name === source);
}
