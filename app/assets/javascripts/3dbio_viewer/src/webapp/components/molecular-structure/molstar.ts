import _ from "lodash";
import { StructureProperties as Props } from "molstar/lib/mol-model/structure";
import { StateTransform } from "molstar/lib/mol-state/transform";
import { PDBeMolstarPlugin } from "@3dbionotes/pdbe-molstar/lib";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { getMainPdbId, Selection } from "../../view-models/Selection";
import { Maybe } from "../../../utils/ts-utils";
import { buildLigand, Ligand } from "../../../domain/entities/Ligand";
import { StateObjectCell } from "molstar/lib/mol-state/object";

function getCellsWithPath(molstarPlugin: PluginContext) {
    const cells = Array.from(molstarPlugin.state.data.cells.values());
    const cellsByRef = _.keyBy(cells, cell => cell.transform.ref);

    return cells.map(cell => {
        const parts = [];
        let currentCell: Maybe<typeof cell> = cell;

        do {
            parts.push(currentCell.transform.ref);
            currentCell = cellsByRef[currentCell.transform.parent];
        } while (
            currentCell &&
            currentCell.transform.ref !== StateTransform.RootRef &&
            currentCell.transform.ref !== currentCell.transform.parent
        );

        return { cell, path: _.reverse(parts) };
    });
}

export function getLigands(pdbePlugin: PDBeMolstarPlugin, newSelection: Selection) {
    const mainPdbId = getMainPdbId(newSelection)?.toLowerCase();
    if (!mainPdbId) return;

    const molstarPlugin = pdbePlugin.plugin as PluginContext;

    const cells = getCellsWithPath(molstarPlugin);

    const pdbCell = cells.find(({ cell }) => cell.obj?.label?.toLowerCase() === mainPdbId);
    if (!pdbCell) return;

    const cellsWithinPdb = _(cells)
        .map(({ cell, path }) => (path.includes(pdbCell.cell.transform.ref) ? cell : null))
        .compact()
        .value();

    const locations = cellsWithinPdb.flatMap(cell => {
        // TODO: don't use any
        const units = cell.obj?.data?.units || [];
        const structure = cell.obj?.data;
        const locationsForCell = _.flatMap(units, (unit: any) =>
            _.flatMap(Array.from(unit.elements), (element: any) => {
                const location = {
                    kind: "element-location" as const,
                    structure,
                    unit,
                    element,
                };
                const compIds = Props.residue.microheterogeneityCompIds(location);
                const type = Props.residue.group_PDB(location);
                const authSeqId = Props.residue.auth_seq_id(location);
                const chainId = Props.chain.auth_asym_id(location);

                return { type, compIds, authSeqId, chainId };
            })
        );
        return locationsForCell;
    });

    const ligands = _(locations)
        // Get only non-water hetero atoms locations
        .filter(location => location.type === "HETATM")
        .flatMap(location =>
            location.compIds
                .filter(compId => compId !== "HOH")
                .map(compId => ({ symbol: compId, location }))
        )
        .keyBy(({ symbol, location }) => [symbol, location.chainId, location.authSeqId].join("-"))
        .values()
        .map(
            (referenceObj): Ligand => {
                const symbol = referenceObj.symbol;
                const chainId = referenceObj.location.chainId;
                const position = referenceObj.location.authSeqId;
                return buildLigand({ chainId, component: symbol, position });
            }
        )
        .orderBy([obj => obj.component, obj => obj.component, obj => obj.position])
        .value();

    return ligands;
}

export async function loadEmdb(pdbePlugin: PDBeMolstarPlugin, emdbId: string) {
    await pdbePlugin.loadEmdbFromUrl({
        url: `https://maps.rcsb.org/em/${emdbId}/cell?detail=3`,
        isBinary: true,
        format: "dscif",
    });
}

interface CellNode {
    ref: string;
    cell: StateObjectCell;
    children: CellNode[];
}

function findNode(
    node: CellNode | undefined,
    predicate: (node: CellNode) => boolean
): CellNode | undefined {
    if (!node) {
        return;
    } else if (predicate(node)) {
        return node;
    } else {
        return _(node.children)
            .map(childNode => findNode(childNode, predicate))
            .compact()
            .first();
    }
}

function buildRootNode(plugin: PDBeMolstarPlugin): CellNode | undefined {
    const cells = Array.from(plugin.state.cells.values());
    const cellsByRef = _.keyBy(cells, cells => cells.transform.ref);
    const rootCell = cellsByRef[StateTransform.RootRef];
    if (!rootCell) return;

    const cellsGroupedByParentRef = _(cells)
        .reject(cell => cell.transform.ref === StateTransform.RootRef)
        .groupBy(cell => cell.transform.parent)
        .value();

    function buildNode(cell: StateObjectCell): CellNode {
        const childrenCells = cellsGroupedByParentRef[cell.transform.ref] || [];
        const children = childrenCells.map(cell => buildNode(cell));
        return { ref: cell.transform.ref, cell, children };
    }

    return buildNode(rootCell);
}

export function setEmdbOpacity(options: { plugin: PDBeMolstarPlugin; id: string; value: number }) {
    const { plugin, id, value } = options;

    const rootNode = buildRootNode(plugin);
    const emdb = findNode(rootNode, node => Boolean(node.cell.obj?.label.includes(id)));
    const surface = findNode(emdb, node => node.cell.params?.values.type?.name === "isosurface");
    const values = surface?.cell.params?.values;
    if (!values) return;

    const valuesUpdated = _.set(_.cloneDeep(values), "type.params.alpha", value);
    plugin.plugin.state.updateTransform(plugin.state, surface.ref, valuesUpdated);
}
