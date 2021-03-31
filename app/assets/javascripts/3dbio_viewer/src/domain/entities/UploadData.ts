export interface UploadData {
    dataUrl: string;
    chains: Chains;
}

export interface Chains {
    A: ChainObject[];
    B: ChainObject[];
    C: ChainObject[];
}

export interface ChainObject {
    acc: string;
    title: Title;
    evalue: string;
    cov: string;
    start: string;
    end: string;
    db: string;
}

export interface Title {
    name: ShortLongName;
    org: ShortLongName;
    gene: string;
}

export interface ShortLongName {
    short: string;
    long: string;
}

export const uploadMockData = {
    "dataUrl": "http://rinchen-dos.cnb.csic.es:8882/upload/UKLIJFJFWOCPUYUIGMVA/",
    "chains": {
        "A": [
            {
                "acc": "Q64FG1",
                "title": {
                    "name": { "short": "S2 protein ( ...", "long": "S2 protein (Fragment)" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GD322" },
                    "gene": "S2"
                },
                "evalue": "0.0",
                "cov": "88.971",
                "start": "1",
                "end": "408",
                "db": "trembl"
            },
            {
                "acc": "Q5GDJ5",
                "title": {
                    "name": { "short": "Spike glycop ...", "long": "Spike glycoprotein" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GZ0403" },
                    "gene": "N/A"
                },
                "evalue": "0.0",
                "cov": "82.371",
                "start": "489",
                "end": "1129",
                "db": "trembl"
            }
        ],
        "B": [
            {
                "acc": "Q64FG1",
                "title": {
                    "name": { "short": "S2 protein ( ...", "long": "S2 protein (Fragment)" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GD322" },
                    "gene": "S2"
                },
                "evalue": "0.0",
                "cov": "88.971",
                "start": "1",
                "end": "408",
                "db": "trembl"
            },
            {
                "acc": "Q5GDJ5",
                "title": {
                    "name": { "short": "Spike glycop ...", "long": "Spike glycoprotein" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GZ0403" },
                    "gene": "N/A"
                },
                "evalue": "0.0",
                "cov": "82.371",
                "start": "489",
                "end": "1129",
                "db": "trembl"
            }
        ],
        "C": [
            {
                "acc": "Q64FG1",
                "title": {
                    "name": { "short": "S2 protein ( ...", "long": "S2 protein (Fragment)" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GD322" },
                    "gene": "S2"
                },
                "evalue": "0.0",
                "cov": "88.971",
                "start": "1",
                "end": "408",
                "db": "trembl"
            },
            {
                "acc": "Q5GDJ5",
                "title": {
                    "name": { "short": "Spike glycop ...", "long": "Spike glycoprotein" },
                    "org": { "short": "SARS coronav ...", "long": "SARS coronavirus GZ0403" },
                    "gene": "N/A"
                },
                "evalue": "0.0",
                "cov": "82.371",
                "start": "489",
                "end": "1129",
                "db": "trembl"
            }
        ]
    }
};
