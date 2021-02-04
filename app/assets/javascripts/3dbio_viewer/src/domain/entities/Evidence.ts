export interface Evidence {
    title: string;
    source?: Source;
    alternativeSource?: Source;
}

interface Source {
    id: string;
    name: string;
    url: string;
}
