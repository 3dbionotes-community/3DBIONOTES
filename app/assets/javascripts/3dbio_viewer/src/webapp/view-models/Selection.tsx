import { Selector } from "@3dbionotes/pdbe-molstar/lib";
import _ from "lodash";
import { Ligand } from "../../domain/entities/Ligand";
import { PdbId } from "../../domain/entities/Pdb";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { Maybe } from "../../utils/ts-utils";

/* Selection object from/to string.

Example: 6w9c:A:NAG-701+EMD-8650|6lzg+!EMD-23150+EMD-15311

Main: PDB = 6w9c (chain A, ligand NAG-701) , EMDB = EMD-8650
Overlay: 6lzg, EMD-23150 (! -> invisible), EMD-15311.
*/

const mainSeparator = "+";
const overlaySeparator = "|";
const chainSeparator = ":";

export type Type = "pdb" | "emdb";

export type ActionType = "select" | "append";

export interface Selection {
    main: { pdb?: DbItem; emdb?: DbItem };
    overlay: Array<DbItem>;
    chainId: Maybe<string>;
    ligandId: Maybe<string>;
}

export interface WithVisibility<T> {
    item: T;
    visible: boolean;
}

export interface DbItem {
    type: Type;
    id: string;
    visible: boolean;
}

export function getItemSelector(item: DbItem): Selector {
    switch (item.type) {
        case "pdb": // Example: label = "6w9c"
            return { label: new RegExp(`^${item.id}$`, "i") };
        case "emdb":
            // Example: with provider = "RCSB PDB EMD Density Server: EMD-8650"
            // Example: with URL "https://maps.rcsb.org/em/EMD-21375/cell?detail=3"
            return { label: new RegExp(`/${item.id}/`, "i") };
    }
}

export function getMainPdbId(selection: Selection): Maybe<string> {
    return selection.main.pdb?.id;
}

export function getMainEmdbId(selection: Selection): Maybe<string> {
    return selection.main.emdb?.id;
}

export function getChainId(selection: Selection): Maybe<string> {
    return selection.chainId;
}

/* toString, fromString */

export function getSelectionFromString(items: Maybe<string>): Selection {
    const [main = "", overlay = ""] = (items || "").split(overlaySeparator, 2);
    const [mainPdbRich = "", mainEmdbRichId] = main.split(mainSeparator, 2);
    const [mainPdbRichId, chainId, ligandId] = mainPdbRich.split(chainSeparator, 3);
    const overlayIds = overlay.split(mainSeparator);

    const selection: Selection = {
        main: { pdb: buildDbItem(mainPdbRichId), emdb: buildDbItem(mainEmdbRichId) },
        overlay: _.compact(overlayIds.map(buildDbItem)),
        chainId: chainId,
        ligandId: ligandId,
    };

    return selection;
}

export function getStringFromSelection(selection: Selection): string {
    const { main, overlay, chainId, ligandId } = selection;
    const pdb = getItemParam(main.pdb);
    const pdbWithChainAndLigand = _([pdb, chainId, ligandId])
        .dropRightWhile(_.isEmpty)
        .join(chainSeparator);
    const mainParts = main ? [pdbWithChainAndLigand, getItemParam(main.emdb)] : [];
    const parts = [
        _(mainParts).dropRightWhile(_.isEmpty).join(mainSeparator),
        overlay.map(getItemParam).join(mainSeparator),
    ];
    return _.compact(parts).join(overlaySeparator);
}

/* Updaters */

export function setMainPdb(selection: Selection, pdbId: Maybe<string>): Selection {
    if (!selection.main || selection.main?.pdb?.id === pdbId) return selection;

    return {
        ...selection,
        main: {
            ...selection.main,
            pdb: pdbId ? { type: "pdb", id: pdbId, visible: true } : undefined,
        },
    };
}

export function setMainEmdb(selection: Selection, emdbId: Maybe<string>): Selection {
    if (!selection.main || selection.main?.emdb?.id === emdbId) return selection;

    return {
        ...selection,
        main: {
            ...selection.main,
            emdb: emdbId ? { type: "emdb", id: emdbId, visible: true } : undefined,
        },
    };
}

export function removeOverlayItem(selection: Selection, id: string): Selection {
    const newOverlay = selection.overlay.map(item => (item.id === id ? null : item));
    return { ...selection, overlay: _.compact(newOverlay) };
}

export function setOverlayItemVisibility(
    selection: Selection,
    id: string,
    visible: boolean
): Selection {
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
    const { main } = selection;
    if (!main) return selection;
    const newMainPdb = main.pdb?.id === id ? { ...main.pdb, visible } : main.pdb;
    const newMainEmdb = main.emdb?.id === id ? { ...main.emdb, visible } : main.emdb;
    return { ...selection, main: { pdb: newMainPdb, emdb: newMainEmdb } };
}

export function setSelectionChain(selection: Selection, chainId: string): Selection {
    return { ...selection, chainId, ligandId: undefined };
}

export function setSelectionLigand(selection: Selection, ligand: Ligand): Selection {
    const chainId = ligand.shortChainId;
    return { ...selection, chainId, ligandId: ligand.shortId };
}

function getId(item: DbItem) {
    return item.id;
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

export function getItems(selection: Selection | undefined): DbItem[] {
    return selection
        ? _.concat(
              selection.main ? _.compact([selection.main.pdb, selection.main.emdb]) : [],
              selection.overlay
          )
        : [];
}

export function buildDbItem(richId: string | undefined): DbItem | undefined {
    if (!richId) return;

    const [visible, id] = richId[0] === "!" ? [false, richId.slice(1)] : [true, richId];

    let type: DbItem["type"];
    if (id.match(/^\d[\d\w]{3}$/)) {
        type = "pdb";
    } else if (id.match(/^EMD-\d+$/)) {
        type = "emdb";
    } else {
        return;
    }

    return { type, id, visible };
}

export function getItemParam(item: DbItem | undefined): string | undefined {
    return item ? [item.visible ? "" : "!", item.id].join("") : undefined;
}

export function runAction(selection: Selection, action: ActionType, item: DbItem): Selection {
    switch (action) {
        case "select": {
            const newMain: Selection["main"] =
                item.type === "pdb"
                    ? { ...selection.main, pdb: { type: "pdb", id: item.id, visible: true } }
                    : { ...selection.main, emdb: { type: "emdb", id: item.id, visible: true } };

            return { main: newMain, overlay: [], chainId: undefined, ligandId: undefined };
        }
        case "append": {
            const newOverlay: Selection["overlay"] = _.uniqBy(
                [...selection.overlay, { type: "pdb", id: item.id, visible: true }],
                getDbItemUid
            );

            return { ...selection, overlay: newOverlay };
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
    const newPdbId = getMainPdbId(newSelection);
    const newEmdbId = getMainEmdbId(newSelection);

    return {
        pdbId: newPdbId != getMainPdbId(prevSelection) ? newPdbId : undefined,
        emdbId: newEmdbId != getMainEmdbId(prevSelection) ? newEmdbId : undefined,
    };
}

export function getPdbOptions(
    pdbId: Maybe<PdbId>,
    chainId: Maybe<string>,
    chains: Maybe<PdbInfo["chains"]>
) {
    if (!pdbId || !chains) return;

    const defaultChain = chains[0];
    const chain = chainId
        ? _(chains)
              .keyBy(chain => chain.chainId)
              .get(chainId, defaultChain)
        : defaultChain;

    return chain ? { pdbId, proteinId: chain.protein.id, chainId: chain.chainId } : undefined;
}

export function getSelectedLigand(selection: Selection, pdbInfo: Maybe<PdbInfo>) {
    return pdbInfo?.ligands.find(ligand => ligand.shortId === selection.ligandId);
}
