export interface Covid19Data {
    proteins: Protein[];
}

export interface Protein {
    description: string;
    name: string;
    names: string[];
    polyproteins: string[];
    sections: ProteinSection[];
}

interface ProteinSection {
    experiments?: string[] | {};
    name: string;
    pockets?: Record<string, number> | never[] | {};
    subsections: ProteinSection[];
    items: ProteinItems[];
}

export interface ProteinItems {
    api?: string;
    description?: string | null;
    experiment?: string;
    external: ProteinItemExternal;
    image_url?: string;
    links: ProteinItemLink[];
    name: string;
    pockets?: Record<string, number> | never[] | {};
    query_url: string;
    pdb_redo?: ProteinItemLink;
    isolde?: ProteinItemLink;
    refmac?: ProteinItemLink;
    related?: string[];
    type?: string;
    interaction?: string;
    relatedType?: string;
    computationalModel?: string;
}

interface ProteinItemExternal {
    text: string;
    url: string;
}

export interface ProteinItemLink {
    check?: string;
    external_url?: string;
    name: string;
    query_url: string;
    style: string;
    title: string;
}

export interface RowUpload {
    api?: string;
    title?: string;
    id?: number;
    details?: ItemDetails;
    links?: ProteinItemLink[];
    name?: string;
    pdb?: string;
    emdb?: string;
    type?: string;
    experiment?: string;
    pockets?: Record<string, number> | never[] | {};
    image_url?: string;
    external?: ProteinItemExternal;
}

export interface ItemDetails {
    description?: string;
    authors?: string | unknown;
    released?: string;
}

export interface PdbApiResponse {
    assemblies?: Assemblies[]; //new object
    deposition_date?: string;
    deposition_site?: string;
    entry_authors?: unknown[];
    experimental_method?: unknown[];
    experimental_method_class?: unknown[];
    number_of_entities?: Record<string, number>; //new object
    processing_site?: string;
    related_structure?: RelatedStructures[];
    release_date?: string;
    revision_date?: string;
    split_entry?: never[];
    title?: string;
}

interface Assemblies {
    assembly_id: string;
    form: string;
    name: string;
    preferred: boolean;
}

interface RelatedStructures {
    accession: string;
    relationship: string;
    resource: string;
}

export interface EmdbApiResponse {
    admin?: Admin; //new object
    deposition?: Deposition;
}
interface Admin {
    last_modification_date: string;
}
interface Deposition {
    authors: string;
    deposition_date: string;
    deposition_site: string;
    header_release_date: string;
    map_release_date: string;
    primary_publication: PrimaryPublication;
    processing_site: string;
    status: Status;
    title: string;
}
interface Status {
    value: string;
}
interface PrimaryPublication {
    journal_article: JournalArticle;
    published: boolean;
}
interface JournalArticle {
    journal: string;
    authors: string;
    title: string;
    year: string;
    external_reference: ExternalReference[];
}
interface ExternalReference {
    reference_type: string;
    value: string;
}
