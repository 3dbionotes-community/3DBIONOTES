import { Selector } from "@3dbionotes/pdbe-molstar/lib";
import _ from "lodash";
import { Ligand } from "../../domain/entities/Ligand";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { Maybe } from "../../utils/ts-utils";

/* Selection object from/to string.

Example: 6w9c:A:NAG-701+EMD-8650&pdbRedo|6lzg+!EMD-23150+EMD-15311

Main: PDB = 6w9c (chain A, ligand NAG-701) , EMDB = EMD-8650
Overlay: 6lzg, EMD-23150 (! -> invisible), EMD-15311.
Add PDB-Redo of 6w9c if exist (! -> invisible)
*/

const mainSeparator = "+";
const overlaySeparator = "|";
const chainSeparator = ":";
const andSeparator = "&";

type RefinedModelTypes = "pdbRedo" | "cstf" | "ceres";
export type Type = "pdb" | "emdb" | RefinedModelTypes;

export type ActionType = "select" | "append";

export interface BaseSelection {
    chainId: Maybe<string>;
    ligandId: Maybe<string>;
}

export interface FreeSelection extends BaseSelection {
    type: "free";
    main: Record<Type, Maybe<DbItem>>;
    overlay: Array<DbItem>;
}

export interface UploadDataSelection extends BaseSelection {
    type: "uploadData";
    token: string;
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
        pdbRedo: undefined,
        cstf: undefined,
        ceres: undefined,
    },
    overlay: [],
    chainId: undefined,
    ligandId: undefined,
};

export interface DbItem {
    type: Type;
    id: string;
    visible?: boolean;
}

export function getItemSelector(item: DbItem): Selector {
    switch (item.type) {
        case "pdb": // Example: label = "6w9c"
            return { label: new RegExp(`^${item.id}$`, "i") };
        case "emdb":
            // Example: with provider = "RCSB PDB EMD Density Server: EMD-8650"
            // Example: with URL "https://maps.rcsb.org/em/EMD-21375/cell?detail=3"
            return { label: new RegExp(`/${item.id}/`, "i") };
        default:
            return {};
    }
}

export function getMainItem(selection: Selection, modelType: Type): Maybe<string> {
    return selection.type === "free" ? selection.main[modelType]?.id : undefined;
}

export function getChainId(selection: Selection): Maybe<string> {
    return selection.chainId;
}

/* toString, fromString */

function splitPdbIdb(main: string): Array<Maybe<string>> {
    if (main.includes(mainSeparator)) {
        return main.split(mainSeparator, 2);
    } else if (main.startsWith("EMD")) {
        return [undefined, main];
    } else {
        return [main, undefined];
    }
}

function getRichRefinedModel(item: string) {
    const getRefinedModel = (refinedModelType: RefinedModelTypes) => {
        const isPresent = new RegExp(andSeparator + "!{0,1}" + refinedModelType).test(item);
        if (!isPresent) return;
        else
            return {
                type: refinedModelType,
                visible: new RegExp(andSeparator + refinedModelType).test(item),
            };
    };

    return {
        pdbRedo: getRefinedModel("pdbRedo"),
        cstf: getRefinedModel("cstf"),
        ceres: getRefinedModel("ceres"),
    };
}

export function getSelectionFromString(items: Maybe<string>): Selection {
    const [main = "", overlay = ""] = (items || "").split(overlaySeparator, 2);
    const { pdbRedo, cstf, ceres } = getRichRefinedModel(main);
    const [mainPdbRich = "", mainEmdbRichId] = splitPdbIdb(
        main.replace(
            new RegExp(`(${andSeparator}pdbRedo|${andSeparator}cstf|${andSeparator}ceres)`),
            ""
        )
    );
    const [mainPdbRichId, chainId, ligandId] = mainPdbRich.split(chainSeparator, 3);
    const overlayIds = overlay.split(mainSeparator);

    const selection: Selection = {
        type: "free",
        main: {
            pdb: buildDbItem(mainPdbRichId),
            emdb: buildDbItem(mainEmdbRichId),
            pdbRedo: buildRefinedModelDbItem(pdbRedo, mainPdbRichId),
            cstf: undefined, //also only pdbId
            ceres: undefined, //pdbId+emdbId
            // ceres: buildRefinedModelDbItem(ceres, `${mainPdbRichId}+${mainEmdbRichId}`),
        },
        overlay: _.compact(overlayIds.map(buildDbItem)),
        chainId: chainId,
        ligandId: ligandId,
    };

    return selection;
}

export function getSelectionFromUploadDataToken(token: string, chainId: Maybe<string>): Selection {
    return { ...emptySelection, type: "uploadData", token, chainId };
}

export function getSelectionFromNetworkToken(token: string, chainId: Maybe<string>): Selection {
    return { ...emptySelection, type: "network", token, chainId };
}

export function getStringFromSelection(selection: Selection): string {
    if (selection.type !== "free") return "";

    const { main, overlay, chainId, ligandId } = selection;
    const pdb = getItemParam(main.pdb);
    const pdbWithChainAndLigand = _([pdb, chainId, ligandId])
        .dropRightWhile(_.isEmpty)
        .join(chainSeparator);
    const mainParts = main ? [pdbWithChainAndLigand, getItemParam(main.emdb)] : [];
    const refinedModels = _.compact([
        getModelItemParam(main.pdbRedo),
        getModelItemParam(main.cstf),
        getModelItemParam(main.ceres),
    ]).map(s => s && andSeparator + s);
    const parts = [
        _(mainParts).dropRightWhile(_.isEmpty).join(mainSeparator) + refinedModels.join(""),
        overlay.map(getItemParam).join(mainSeparator),
    ];

    return _.compact(parts).join(overlaySeparator);
}

/* Updaters */

export function setMainItem(
    selection: Selection,
    itemId: Maybe<string>,
    modelType: Type
): Selection {
    if (selection.type !== "free" || !selection.main || selection.main?.[modelType]?.id === itemId)
        return selection;

    return {
        ...selection,
        main: {
            ...selection.main,
            [modelType]: itemId ? { type: modelType, id: itemId, visible: true } : undefined,
        },
    };
}

export function removeOverlayItem(selection: Selection, id: string): Selection {
    if (selection.type !== "free") return selection;
    const newOverlay = selection.overlay.map(item => (item.id === id ? null : item));
    return { ...selection, overlay: _.compact(newOverlay) };
}

export function setOverlayItemVisibility(
    selection: Selection,
    id: string,
    visible: boolean
): Selection {
    if (selection.type !== "free") return selection;
    const newOverlay = selection.overlay.map(item =>
        item.id === id ? { ...item, visible } : item
    );
    return { ...selection, overlay: newOverlay };
}

export function setMainItemVisibility(
    selection: Selection,
    id: string,
    visible: boolean
): Selection {
    if (selection.type !== "free") return selection;
    const { main } = selection;
    if (!main) return selection;

    const getNewMainItem = (type: Type): Maybe<DbItem> => {
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
            pdbRedo: getNewMainItem("pdbRedo"),
            cstf: getNewMainItem("cstf"),
            ceres: getNewMainItem("ceres"),
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

function getTypeId(item: DbItem) {
    return item.type + "-" + item.id;
}

export function diffDbItems(newItems: DbItem[], oldItems: DbItem[]) {
    const added = _.differenceBy(newItems, oldItems, getTypeId);
    const removed = _.differenceBy(oldItems, newItems, getTypeId);
    const commonIds = _.intersectionBy(oldItems, newItems, getTypeId).map(getTypeId);
    const oldItemsById = _.keyBy(oldItems, getTypeId);
    const newItemsById = _.keyBy(newItems, getTypeId);
    const updated = _(commonIds)
        .filter(id => !_.isEqual(oldItemsById[id], newItemsById[id]))
        .map(id => newItemsById[id])
        .compact()
        .value();

    return { added, removed, updated };
}

export function getItems(selection: Maybe<Selection>): DbItem[] {
    return selection && selection.type === "free"
        ? _.concat(
              selection.main
                  ? _.compact([
                        selection.main.pdb,
                        selection.main.emdb,
                        selection.main.pdbRedo,
                        selection.main.cstf,
                        selection.main.ceres,
                    ])
                  : [],
              selection.overlay
          )
        : [];
}

export function buildDbItem(richId?: string): Maybe<DbItem> {
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

export function buildRefinedModelDbItem(
    richRefinedModel?: Omit<DbItem, "id">,
    richId?: string
): Maybe<DbItem> {
    if (!richId || !richRefinedModel) return;

    return {
        ...richRefinedModel,
        id: richId.replace("!", ""),
    };
}

export function getItemParam(item: DbItem | undefined): string | undefined {
    return item ? [item.visible ? "" : "!", item.id].join("") : undefined;
}

export function getModelItemParam(item: DbItem | undefined): string | undefined {
    return item ? [item.visible ? "" : "!", item.type].join("") : undefined;
}

export function runAction(selection: Selection, action: ActionType, item: DbItem): Selection {
    const hasMain = Boolean(selection.type === "free" && selection.main[item.type]);
    const action2 = action === "append" && !hasMain ? "select" : action;
    const baseMain = selection.type === "free" ? selection.main : emptySelection.main;
    const baseOverlay = selection.type === "free" ? selection.overlay : emptySelection.overlay;

    switch (action2) {
        case "select": {
            const newMain: FreeSelection["main"] =
                item.type === "pdb"
                    ? {
                          emdb: baseMain.emdb,
                          pdb: { type: "pdb", id: item.id, visible: true },
                          pdbRedo: undefined,
                          cstf: undefined,
                          ceres: undefined,
                      }
                    : {
                          ...baseMain,
                          emdb: { type: "emdb", id: item.id, visible: true },
                          ceres: undefined,
                      };

            return {
                type: "free",
                main: newMain,
                overlay: [],
                chainId: undefined,
                ligandId: undefined,
            };
        }
        case "append": {
            const newOverlay: FreeSelection["overlay"] = _.uniqBy(
                [...baseOverlay, { type: item.type, id: item.id, visible: true }],
                getDbItemUid
            );

            return { ...selection, type: "free", overlay: newOverlay, main: baseMain };
        }
    }
}

function getDbItemUid(item: DbItem): string {
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
