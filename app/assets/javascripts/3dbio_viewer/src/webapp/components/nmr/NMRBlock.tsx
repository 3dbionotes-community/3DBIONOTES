import _ from "lodash";
import React from "react";
import { BlockComponentProps } from "../protvista/Protvista.types";
import { recordOfStyles } from "../../../utils/ts-utils";
import {
    Dialog,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import { NMRFragment, NSPTarget } from "../../../domain/entities/Protein";
import { Close as CloseIcon } from "@material-ui/icons";
import i18n from "../../utils/i18n";

const svgProps = {
    //calculated lineHeight is 16px (fontSize 1rem)
    barHeight: 50,
    columnGap: 7.5,
    rowGap: 15,
    topSpace: 24,
    topBarMargin: 100,
    leftSpace: 24,
    bottomSpace: 24,
};

export const NMRBlock: React.FC<BlockComponentProps> = React.memo(
    ({ pdb, block, setBlockVisibility }) => {
        const { barHeight, topSpace, leftSpace, bottomSpace, topBarMargin } = svgProps;
        const [svgWidth, setSvgWidth] = React.useState(100);
        const [open, setOpen] = React.useState(false);
        const [index, setIndex] = React.useState(0);

        const closeDialog = React.useCallback(() => setOpen(false), []);

        const openDialog = React.useCallback((idx: number) => {
            setOpen(true);
            console.log("here");
            setIndex(idx);
        }, []);

        const targets = React.useMemo(
            () =>
                pdb.protein.nspTargets
                    ?.map(target => {
                        const total = target.bindingCount + target.notBindingCount;
                        return {
                            ...target,
                            ratio: target.bindingCount / total,
                            total,
                        };
                    })
                    .sort((a, b) => {
                        const getNspIndex = (target: NMRRatioTarget) =>
                            Number.parseInt(
                                (target.name.match(/NSP\d+/) ?? [])[0]?.replace("NSP", "") ?? "1"
                            );

                        return getNspIndex(a) - getNspIndex(b);
                    }) ?? [],
            [pdb.protein.nspTargets]
        );

        const title = React.useMemo(
            () => i18n.t("Ligand interaction NMR: {{target}}", { target: targets[index]?.name }),
            [targets, index]
        );

        const measuredWidth = React.useCallback((el: HTMLDivElement) => {
            if (el !== null) setSvgWidth(el.getBoundingClientRect().width);
        }, []);

        const height = React.useMemo(
            () => targets.length * (barHeight + 15) + topSpace + bottomSpace + topBarMargin,
            [targets, barHeight, topSpace, bottomSpace, topBarMargin]
        );

        const borders = React.useMemo(
            () => `M${leftSpace},${topSpace}V${height}M0,${height - bottomSpace}H${svgWidth}`,
            [leftSpace, topSpace, height, svgWidth, bottomSpace]
        );

        React.useEffect(() => {
            if (setBlockVisibility) {
                setBlockVisibility({ block, visible: !_.isEmpty(pdb.protein.nspTargets) });
            }
        }, [setBlockVisibility, block, pdb.protein.nspTargets]);

        return (
            <>
                {true && (
                    <div style={styles.container}>
                        <div
                            ref={measuredWidth}
                            style={styles.svgContainer}
                            onMouseLeave={closeDialog}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox={`0 0 ${svgWidth + 1} ${height}`} //svgWidth + 1 because right stroke is on the middle of the pixel
                                width={svgWidth + 1}
                                height={height}
                            >
                                <text x="0" y="16" fontWeight={700}>
                                    {i18n.t("Target")}
                                </text>
                                <text
                                    x={svgWidth / 2}
                                    y={height}
                                    fontWeight={700}
                                    textAnchor="middle"
                                >
                                    {i18n.t("Number of Ligands")}
                                </text>
                                {targets.map((target, idx) => {
                                    return (
                                        <RatioBar
                                            key={idx}
                                            idx={idx}
                                            ratio={target.ratio}
                                            total={target.total}
                                            width={svgWidth}
                                            title={target.name}
                                            showDialog={() => openDialog(idx)}
                                        />
                                    );
                                })}
                                <path d={borders} stroke="#000" strokeWidth={1} />
                            </svg>
                        </div>
                        <p style={styles.p}>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores rem,
                            at sapiente eius accusamus ab, fuga repudiandae recusandae nihil libero
                            laborum nostrum delectus fugit dignissimos! Quos, sed? Nihil,
                            perspiciatis soluta?
                        </p>
                        <Dialog
                            open={open}
                            onClose={closeDialog}
                            maxWidth="xl"
                            fullWidth
                            className="model-search"
                        >
                            <DialogTitle>
                                {title}
                                <IconButton onClick={closeDialog}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent targets={targets} selectedIndex={index} />
                        </Dialog>
                    </div>
                )}
            </>
        );
    }
);

interface RatioBarProps {
    idx: number;
    ratio: number;
    total: number;
    width: number;
    title: string;
    showDialog: () => void;
}

const RatioBar = React.forwardRef<SVGGElement | null, RatioBarProps>((props, ref) => {
    const { idx, ratio, total, width, title, showDialog } = props;
    const { barHeight, columnGap, rowGap, leftSpace, topSpace, topBarMargin } = svgProps;

    const availableWidth = React.useMemo(() => width - leftSpace, [width, leftSpace]);

    const leftBar = React.useMemo(
        () => ({
            x: leftSpace, // absolute from left line,
            y: topBarMargin + topSpace + idx * (barHeight + rowGap),
            width: Math.max(availableWidth * ratio, 24),
            height: barHeight,
            fill: "#92e000",
        }),
        [availableWidth, ratio, idx, rowGap, barHeight, topSpace, leftSpace, topBarMargin]
    );

    // https://stackoverflow.com/questions/75321458/vertically-centering-a-text-element-inside-a-rect-element
    const leftBarText = React.useMemo(
        () => ({
            x: leftBar.width / 2 + leftBar.x,
            y: leftBar.height / 2 + leftBar.y,
            value: Math.round(ratio * total).toString(),
        }),
        [leftBar, ratio, total]
    );

    const rightBar = React.useMemo(
        () => ({
            x: leftBar.x + leftBar.width + columnGap,
            y: leftBar.y,
            width: availableWidth * (1 - ratio) - columnGap,
            height: barHeight,
            fill: "#b7121f",
        }),
        [leftBar, ratio, columnGap, availableWidth, barHeight]
    );

    const rightBarText = React.useMemo(
        () => ({
            x: rightBar.width / 2 + rightBar.x,
            y: rightBar.height / 2 + rightBar.y,
            value: Math.round((1 - ratio) * total).toString(),
        }),
        [rightBar, ratio, total]
    );

    return (
        <g ref={ref} onClick={showDialog}>
            {ratio !== 0 && <Bar bar={leftBar} text={leftBarText} />}
            {ratio !== 1 && <Bar bar={rightBar} text={rightBarText} />}
            <text
                textAnchor="middle"
                transform={`translate(16,${leftBarText.y}) rotate(-90)`} // is a must for rotation purposes. Rotate attr does it for each glyph individually
            >
                <title>{title}</title>
                {title.substring(0, 6)}
            </text>
        </g>
    );
});

interface BarProps {
    bar: {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
    };
    text: {
        x: number;
        y: number;
        value: string;
    };
}

const Bar: React.FC<BarProps> = React.memo(({ bar, text: { x, y, value } }) => (
    <g>
        <rect {...bar} stroke="#000" strokeWidth={1} />
        <text {...{ x, y }} textAnchor="middle" alignmentBaseline="central">
            {value}
        </text>
    </g>
));

interface DialogContentProps {
    targets: NSPTarget[];
    selectedIndex: number;
}

const DialogContent: React.FC<DialogContentProps> = React.memo(({ targets, selectedIndex }) => {
    const target = React.useMemo(() => targets[selectedIndex], [targets, selectedIndex]);

    return (
        <TableContainer>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">{i18n.t("Name")}</TableCell>
                        <TableCell align="right">{i18n.t("SMILES")}</TableCell>
                        <TableCell align="right">{i18n.t("InchiKey")}</TableCell>
                        <TableCell align="right">{i18n.t("Formula")}</TableCell>
                        <TableCell align="right">{i18n.t("PubChem_ID")}</TableCell>
                        <TableCell align="right">{i18n.t("Target")}</TableCell>
                        <TableCell align="right">{i18n.t("Result")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {target?.fragments.map(
                        (
                            {
                                binding,
                                ligand: { name: ligandName, smiles, inChI, formula, pubchemId },
                            },
                            idx
                        ) => (
                            <TableRow key={idx}>
                                <TableCell>{idx}</TableCell>
                                <TableCell>{ligandName}</TableCell>
                                <TableCell align="right">{smiles}</TableCell>
                                <TableCell align="right">{inChI}</TableCell>
                                <TableCell align="right">{formula}</TableCell>
                                <TableCell align="right">{pubchemId}</TableCell>
                                <TableCell align="right">{target.name}</TableCell>
                                <TableCell align="right">
                                    {binding ? i18n.t("Binding") : i18n.t("Not binding")}
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

interface NMRRatioTarget {
    ratio: number;
    total: number;
    name: string;
    fragments: NMRFragment[];
    bindingCount: number;
    notBindingCount: number;
}

const styles = recordOfStyles({
    container: {
        display: "flex",
        columnGap: "2em",
        marginTop: "1em",
        alignItems: "center",
        // maxHeight: 700,
        // overflowY: "auto",
    },
    svgContainer: {
        flexGrow: 1,
    },
    p: { flex: "0 1 300px" },
});
