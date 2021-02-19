import _ from "lodash";

export type Type = "pdb" | "emdb";

export interface SelectionState {
    main: { pdb: DbItem; emdb?: DbItem } | undefined;
    overlay: Array<DbItem>;
}

export interface DbItem {
    type: Type;
    id: string;
    visible: boolean;
}

export function removeOverlayItem(selection: SelectionState, id: string): SelectionState {
    const newOverlay = selection.overlay.map(item => (item.id === id ? null : item));
    return { ...selection, overlay: _.compact(newOverlay) };
}

export function setOverlayItemVisibility(
    selection: SelectionState,
    id: string,
    visible: boolean
): SelectionState {
    const newOverlay = selection.overlay.map(item =>
        item.id === id ? { ...item, visible } : item
    );
    return { ...selection, overlay: newOverlay };
}

export function updateMainItemVisibility(
    selection: SelectionState,
    id: string,
    visible: boolean
): SelectionState {
    const { main } = selection;
    if (!main) return selection;
    const newMainPdb = main.pdb.id === id ? { ...main.pdb, visible } : main.pdb;
    const newMainEmdb = main.emdb?.id === id ? { ...main.emdb, visible } : main.emdb;
    return { ...selection, main: { pdb: newMainPdb, emdb: newMainEmdb } };
}

export function diffDbItems(newItems: DbItem[], oldItems: DbItem[]) {
    const added = _.differenceBy(newItems, oldItems, item => item.id);
    const removed = _.differenceBy(oldItems, newItems, item => item.id);
    const commonIds = _.intersectionBy(oldItems, newItems, item => item.id).map(item => item.id);
    const oldItemsById = _.keyBy(oldItems, item => item.id);
    const newItemsById = _.keyBy(newItems, item => item.id);
    const updated = _(commonIds)
        .filter(id => !_.isEqual(oldItemsById[id], newItemsById[id]))
        .map(id => newItemsById[id])
        .compact()
        .value();
    return { added, removed, updated };
}

export function getItems(selection: SelectionState | undefined): DbItem[] {
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
