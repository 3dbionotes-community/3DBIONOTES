import _ from "lodash";
import { Selector } from "@3dbionotes/pdbe-molstar/lib";
import { Ligand } from "../../domain/entities/Ligand";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { Maybe } from "../../utils/ts-utils";
import { UploadedParams } from "../components/viewer-selector/viewer-selector.hooks";

/* Selection object from/to string.

Example: 6w9c:A:NAG-701+EMD-8650|6lzg+!EMD-23150+EMD-15311|6w9c-pdbRedo+6w9c-cstf

Main: PDB = 6w9c (chain A, ligand NAG-701) , EMDB = EMD-8650
Overlay: 6lzg, EMD-23150 (! -> invisible), EMD-15311.
RefinedModelsOverlay: Add PDB-Redo of 6w9c if exist (! -> invisible)
*/

const mainSeparator = "+";
const overlaySeparator = "|";
const chainSeparator = ":";

export type RefinedModelType = "pdbRedo" | "cstf";
export type MainType = "pdb" | "emdb";

export type Type = MainType | RefinedModelType;

export type ActionType = "select" | "append";

export interface BaseSelection {
    chainId: Maybe<string>;
    ligandId: Maybe<string>;
}

export interface FreeSelection extends BaseSelection {
    type: "free";
    main: { pdb: Maybe<DbItem<MainType>>; emdb: Maybe<DbItem<MainType>> };
    overlay: Array<DbItem<MainType>>;
    refinedModels: Array<DbItem<RefinedModelType>>;
}

export type AllowedExtension = "pdb" | "cif" | "ent";

export function getAllowedFileExtension(fileName: string) {
    return fileName.replace(/^.*\.(pdb|cif|ent)$/gi, "$1") as AllowedExtension;
}

export interface UploadDataSelection extends BaseSelection {
    type: "uploadData";
    token: string;
    extension: AllowedExtension;
}

export interface NetworkSelection extends BaseSelection {
    type: "network";
    token: string;
}

export type Selection = FreeSelection | UploadDataSelection | NetworkSelection;

// main: { pdb?: DbItem; emdb?: DbItem; token?: string; networkId?: string };

export const emptySelection: FreeSelection = {
    type: "free",
    main: {
        pdb: undefined,
        emdb: undefined,
    },
    overlay: [],
    refinedModels: [],
    chainId: undefined,
    ligandId: undefined,
};

export interface DbItem<K = Type> {
    type: K;
    id: string;
    visible?: boolean;
}

export function getItemSelector(item: DbItem): Selector {
    switch (item.type) {
        case "pdb": // Example: label = "6w9c"
            return { label: new RegExp(`^${item.id}$`, "i") };
        case "pdbRedo": // Example: label = "6w9c-pdbRedo"
            return { label: new RegExp(`^${item.id}$`, "i") };
        case "cstf": // Example: label = "6w9c-cstf"
            return { label: new RegExp(`^${item.id}$`, "i") };
        case "emdb":
            // Example: with provider = "RCSB PDB EMD Density Server: EMD-8650"
            // Example: with URL "https://maps.rcsb.org/em/EMD-21375/cell?detail=3"
            return { label: new RegExp(`/${item.id}/`, "i") };
        default:
            return {};
    }
}

export function getMainItem(selection: Selection, modelType: MainType): Maybe<string> {
    return selection.type === "free" ? selection.main[modelType]?.id : undefined;
}

export function getChainId(selection: Selection): Maybe<string> {
    return selection.chainId;
}

/* toString, fromString */

function splitPdbIdb(main: string): Array<Maybe<string>> {
    if (main.includes(mainSeparator)) {
        return main.split(mainSeparator, 2);
    } else if (main.toUpperCase().startsWith("EMD")) {
        return [undefined, main];
    } else {
        return [main, undefined];
    }
}

function buildRefinedModels(items: string[]): DbItem<RefinedModelType>[] {
    return items
        .map(m => m.split("-"))
        .flatMap(([id, type]) => {
            if (
                id &&
                id.match(/^!{0,1}\d[\d\w]{3}$/) && //pdb regex
                (type === "pdbRedo" || type === "cstf")
            )
                return [
                    {
                        id: `${id.replaceAll("!", "").toLowerCase()}-${type}`, //6zow-pdbRedo
                        type,
                        visible: id[0] !== "!",
                    },
                ];
            else return [];
        });
}

export function getSelectionFromString(items: Maybe<string>): Selection {
    const [main = "", overlay = ""] = (items || "").split(overlaySeparator, 2);
    const overlayIds = overlay.split(mainSeparator);
    const overlayRefined = overlayIds.filter(i => i.includes("pdbRedo") || i.includes("cstf"));
    const overlayNotRefined = overlayIds.filter(
        i => !(i.includes("pdbRedo") || i.includes("cstf"))
    );
    const refinedModels = buildRefinedModels(overlayRefined);
    const [mainPdbRich = "", mainEmdbRichId] = splitPdbIdb(main);
    const [mainPdbRichId, chainId, ligandId] = mainPdbRich.split(chainSeparator, 3);

    const selection: Selection = {
        type: "free",
        main: {
            pdb: buildDbItem(mainPdbRichId),
            emdb: buildDbItem(mainEmdbRichId),
        },
        overlay: _.compact(overlayNotRefined.map(buildDbItem)),
        refinedModels: refinedModels,
        chainId: chainId,
        ligandId: ligandId,
    };

    console.log(selection);

    return selection;
}

export function getSelectionFromUploadDataToken(selectionParams: UploadedParams): Selection {
    const { token, chain: chainId, type: extension } = selectionParams;
    return { ...emptySelection, type: "uploadData", token, chainId, extension };
}

export function getSelectionFromNetworkToken(token: string, chainId: Maybe<string>): Selection {
    return { ...emptySelection, type: "network", token, chainId };
}

export function getStringFromSelection(selection: Selection): string {
    if (selection.type !== "free") return "";

    const { main, overlay, chainId, refinedModels, ligandId } = selection;
    const pdb = getItemParam(main.pdb);
    const pdbWithChainAndLigand = _([pdb, chainId, ligandId])
        .dropRightWhile(_.isEmpty)
        .join(chainSeparator);
    const mainParts = main ? [pdbWithChainAndLigand, getItemParam(main.emdb)] : [];
    const parts = [
        _(mainParts).dropRightWhile(_.isEmpty).join(mainSeparator),
        [...overlay, ...refinedModels].map(getItemParam).join(mainSeparator),
    ];
    return _.compact(parts).join(overlaySeparator);
}

/* Updaters */

export function setMainItem(
    selection: Selection,
    itemId: Maybe<string>,
    mainType: MainType
): Selection {
    if (selection.type !== "free" || !selection.main || selection.main?.[mainType]?.id === itemId)
        return selection;

    return {
        ...selection,
        main: {
            ...selection.main,
            [mainType]: itemId ? { type: mainType, id: itemId, visible: true } : undefined,
        },
    };
}

export function removeOverlayItem(selection: Selection, id: string): Selection {
    if (selection.type !== "free") return selection;
    const overlay = selection.overlay.flatMap(item => (item.id === id ? [] : [item]));
    const refinedModels = selection.refinedModels.flatMap(item => (item.id === id ? [] : [item]));

    return {
        ...selection,
        overlay,
        refinedModels,
    };
}

export function setOverlayItemVisibility(
    selection: Selection,
    id: string,
    visible: boolean
): Selection {
    if (selection.type !== "free") return selection;
    const overlay = selection.overlay.map(item => (item.id === id ? { ...item, visible } : item));
    const refinedModels = selection.refinedModels.map(item =>
        item.id === id ? { ...item, visible } : item
    );

    return { ...selection, overlay, refinedModels };
}

export function setMainItemVisibility(
    selection: Selection,
    id: string,
    visible: boolean
): Selection {
    if (selection.type !== "free") return selection;
    const { main } = selection;
    if (!main) return selection;

    const getNewMainItem = (type: MainType): Maybe<DbItem<MainType>> => {
        const newMainItem = main[type];
        return newMainItem
            ? newMainItem.id === id
                ? { ...newMainItem, visible }
                : main[type]
            : undefined;
    };

    return {
        ...selection,
        main: {
            pdb: getNewMainItem("pdb"),
            emdb: getNewMainItem("emdb"),
        },
    };
}

export function setSelectionChain(selection: Selection, chainId: string): Selection {
    return { ...selection, chainId, ligandId: undefined };
}

export function setSelectionLigand(selection: Selection, ligand: Maybe<Ligand>): Selection {
    if (!ligand) return { ...selection, ligandId: undefined };
    const chainId = ligand.shortChainId;
    return { ...selection, chainId, ligandId: ligand.shortId };
}

function getId(item: DbItem) {
    return item.id;
}

export function getRefinedModelId(item: DbItem<RefinedModelType>) {
    return item.id.replaceAll("-" + item.type, "");
}

export function diffDbItems(newItems: DbItem[], oldItems: DbItem[]) {
    const added = _.differenceBy(newItems, oldItems, getId);
    const removed = _.differenceBy(oldItems, newItems, getId);
    const commonIds = _.intersectionBy(oldItems, newItems, getId).map(getId);
    const oldItemsById = _.keyBy(oldItems, getId);
    const newItemsById = _.keyBy(newItems, getId);
    const updated = _(commonIds)
        .filter(id => !_.isEqual(oldItemsById[id], newItemsById[id]))
        .map(id => newItemsById[id])
        .compact()
        .value();

    return { added, removed, updated };
}

export function getItems(selection: Maybe<Selection>): DbItem[] {
    return selection && selection.type === "free"
        ? [
              ..._.compact([selection.main.pdb, selection.main.emdb]),
              ...selection.overlay,
              ...selection.refinedModels,
          ]
        : [];
}

export function buildDbItem(richId?: string): Maybe<DbItem<MainType>> {
    if (!richId) return;

    const [visible, id] = richId[0] === "!" ? [false, richId.slice(1)] : [true, richId];

    if (id.match(/^\d[\d\w]{3}$/)) {
        return { type: "pdb", id: id.toLowerCase(), visible };
    } else if (id.match(/^EMD-\d+$/i)) {
        return { type: "emdb", id: id.toUpperCase(), visible };
    } else {
        return;
    }
}

export function getItemParam(item: DbItem | undefined): string | undefined {
    return item ? [item.visible ? "" : "!", item.id].join("") : undefined;
}

export function runAction(
    selection: Selection,
    action: ActionType,
    item: DbItem<MainType>
): Selection {
    const hasMain = Boolean(selection.type === "free" && selection.main[item.type]);
    const action2 = action === "append" && !hasMain ? "select" : action;
    const baseMain = selection.type === "free" ? selection.main : emptySelection.main;
    const baseOverlay = selection.type === "free" ? selection.overlay : emptySelection.overlay;
    const baseRefinedModels =
        selection.type === "free" ? selection.refinedModels : emptySelection.refinedModels;

    switch (action2) {
        case "select": {
            const newMain: FreeSelection["main"] =
                item.type === "pdb"
                    ? {
                          emdb: baseMain.emdb,
                          pdb: { type: "pdb", id: item.id, visible: true },
                      }
                    : {
                          ...baseMain,
                          emdb: { type: "emdb", id: item.id, visible: true },
                      };

            return {
                type: "free",
                main: newMain,
                overlay: [],
                refinedModels: [],
                chainId: undefined,
                ligandId: undefined,
            };
        }
        case "append": {
            const newOverlay: FreeSelection["overlay"] = _.uniqBy(
                [...baseOverlay, { type: item.type, id: item.id, visible: true }],
                getDbItemUid
            );

            return {
                ...selection,
                type: "free",
                overlay: newOverlay,
                main: baseMain,
                refinedModels: baseRefinedModels,
            };
        }
    }
}

function getDbItemUid(item: DbItem<MainType>): string {
    return [item.type, item.id].join("-");
}

export function getMainChanges(
    prevSelection: Selection,
    newSelection: Selection
): { pdbId?: string; emdbId?: string } {
    const newPdbId = getMainItem(newSelection, "pdb");
    const newEmdbId = getMainItem(newSelection, "emdb");

    return {
        pdbId: newPdbId != getMainItem(prevSelection, "pdb") ? newPdbId : undefined,
        emdbId: newEmdbId != getMainItem(prevSelection, "emdb") ? newEmdbId : undefined,
    };
}

export function getSelectedLigand(selection: Selection, pdbInfo: Maybe<PdbInfo>) {
    const chainId = selection.chainId || pdbInfo?.chains[0]?.chainId;

    return pdbInfo?.ligands.find(ligand => {
        return ligand.shortChainId === chainId && ligand.shortId == selection.ligandId;
    });
}
