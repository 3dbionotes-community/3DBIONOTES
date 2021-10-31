import { FilterModelBodies } from "../../webapp/components/structures-table/CustomCheckboxFilter";

export interface Covid19Info {
    structures: Structure[];
}

export interface Organism {
    id: string;
    name: string;
    externalLink: Url;
}

export interface Entity {
    id: string;
    uniprotAcc: string | null;
    name: string;
    organism: string;
    details?: string;
    altNames: string;
    isAntibody: boolean;
    isNanobody: boolean;
    isSybody: boolean;
}

export interface Ligand {
    id: string;
    name: string;
    details: string;
    imageLink?: Url;
    externalLink?: Url;
    type?: string;
    InnChIKey?: string;
    components?: string[];
}

export interface LigandInstance {
    info: Ligand;
    instances: number;
}

export interface Structure {
    id: Id;
    title: string;
    entities: Entity[];
    pdb: Maybe<Pdb>;
    emdb: Maybe<Emdb>;
    organisms: Organism[];
    computationalModel: Maybe<ComputationalModel>;
    ligands: Ligand[];
    details: Maybe<string>;
    validations: {
        pdb: PdbValidation[];
        emdb: EmdbValidation[];
    };
}

export type ComputationalModel =
    | SwissComputationalModel
    | BSMArcComputationalModel
    | AlphaFoldComputationalModel;

export interface SwissComputationalModel {
    source: "SWISS-MODEL";
    name: string;
    project: string;
    model: string;
    externalLink: Url;
    queryLink: Url;
    imageLink?: Url;
}

export interface BSMArcComputationalModel {
    source: "BSM-Arc";
    name: string;
    model: string;
    externalLink: Url;
    queryLink: Url;
}

export interface AlphaFoldComputationalModel {
    source: "AlphaFold";
    name: string;
    model: string;
    externalLink: Url;
    queryLink: Url;
}

export interface DbItem {
    id: Id;
    method?: string;
    resolution?: string;
    imageUrl: Url;
    externalLinks: Link[];
    queryLink: Url;
}

export interface Link {
    text: string;
    url: string;
    tooltip?: string;
}

export interface PdbRedoValidation {
    type: "pdbRedo";
    externalLink: Url;
    queryLink?: Url;
    badgeColor: W3Color;
}

export interface IsoldeValidation {
    type: "isolde";
    queryLink?: Url;
    badgeColor: W3Color;
}

export type W3Color = "w3-cyan" | "w3-turq";

export type PdbValidation = PdbRedoValidation | IsoldeValidation;
export type EmdbValidation = string;

export interface Pdb extends DbItem {
    entities: Entity[];
}

export interface Emdb extends DbItem {}

export interface Validation {
    externalLink?: Url[];
    queryLink: Url[];
    badgeColor: string;
}

export type Id = string;

export type Dictionary<T> = Record<Id, T>;

export type Maybe<T> = T | undefined | null;

export type Url = string;

export type Ref = { id: Id };

export function searchAndFilterStructures(
    structures: Structure[],
    search: string,
    filterState: FilterModelBodies
): Structure[] {
    const text = search.trim().toLocaleLowerCase();
    if (!text && !filterState.antibody && !filterState.nanobody && !filterState.sybody)
        return structures;

    return structures.filter(
        structure =>
            (structure.title.toLocaleLowerCase().includes(text) ||
                structure.pdb?.id.toLocaleLowerCase().includes(text) ||
                structure.emdb?.id.toLocaleLowerCase().includes(text) ||
                searchOrganismSubStructures(structure.organisms, text) ||
                searchLigandSubStructures(structure.ligands, text) ||
                searchEntitySubStructures(structure.entities, text) ||
                structure.details?.toLocaleLowerCase().includes(text)) &&
            (filterEntities(structure.entities, filterState).length > 0 ||
                (structure.pdb && filterEntities(structure.pdb.entities, filterState).length > 0))
    );
}

export function filterEntities(entities: Entity[], filterState: FilterModelBodies): Entity[] {
    return entities.filter(
        entity =>
            entity.isAntibody === filterState.antibody &&
            entity.isNanobody === filterState.nanobody &&
            entity.isSybody === filterState.sybody
    );
}

function searchOrganismSubStructures(subStructure: Organism[], text: string): boolean {
    return (
        subStructure.filter(structure => structure.id.toLocaleLowerCase().includes(text)).length > 0
    );
}

function searchLigandSubStructures(subStructure: Ligand[], text: string): boolean {
    return (
        subStructure.filter(structure => {
            return (
                structure.id.toLocaleLowerCase().includes(text) ||
                structure.name.toLocaleLowerCase().includes(text) ||
                (structure.InnChIKey && structure.InnChIKey.toLocaleLowerCase().includes(text)) ||
                (structure.details && structure.details.toLocaleLowerCase().includes(text))
            );
        }).length > 0
    );
}

function searchEntitySubStructures(subStructure: Entity[], text: string): boolean {
    return (
        subStructure.filter(structure => {
            return (
                structure.id.toLocaleLowerCase().includes(text) ||
                structure.name.toLocaleLowerCase().includes(text) ||
                structure.altNames.toLocaleLowerCase().includes(text) ||
                (structure.details && structure.details.toLocaleLowerCase().includes(text)) ||
                structure.organism.toLocaleLowerCase().includes(text)
            );
        }).length > 0
    );
}
