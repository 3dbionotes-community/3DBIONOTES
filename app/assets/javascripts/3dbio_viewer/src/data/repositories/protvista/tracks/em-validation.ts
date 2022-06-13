import _ from "lodash";
import { FragmentResult, Fragments, getFragmentsList } from "../../../../domain/entities/Fragment2";
import { Legend } from "../../../../domain/entities/Legend";
import { ChainId } from "../../../../domain/entities/Protein";
import { SubtrackDefinition } from "../../../../domain/entities/TrackDefinition";
import { getKeys, isElementOfUnion } from "../../../../utils/ts-utils";
import { subtracks } from "../definitions";

/* Examples:

    - deepres, mapq, fscq:
        http://3dbionotes.cnb.csic.es/ws/lrs/pdbAnnotFromMap/all/6zow/A/?format=json

    - mapq, monores:
        http://3dbionotes.cnb.csic.es/ws/lrs/pdbAnnotFromMap/all/7bv1/A/
*/

export type PdbAnnotations = PdbAnnotation[];

export interface PdbAnnotation {
    chain: string;
    minVal: number;
    maxVal: number;
    algorithm: string;
    algoType: string;
    data: Array<{ begin: string; value: number }>;
}

type KnownAlgorithm = "deepres" | "monores" | "blocres" | "mapq" | "fscq";

const subtrackByAlgorithm: Record<KnownAlgorithm, SubtrackDefinition> = {
    deepres: subtracks.deepRes,
    monores: subtracks.monoRes,
    blocres: subtracks.blocRes,
    mapq: subtracks.mapQ,
    fscq: subtracks.fscQ,
};

const MAXQ_COLOR_UPPPER_THRESHOLD = 0.8;

const config = {
    localResolution: {
        descriptionPrefix: "Local resolution by ",
        getColor: getColorFromResolution,
        legend: [
            { color: "#ff98e9", text: "0" },
            { color: "#c143ed", text: "1" },
            { color: "#0000FF", text: "2" },
            { color: "#00FFFF", text: "3" },
            { color: "#00FF00", text: "4" },
            { color: "#FFFF00", text: "5" },
            { color: "#FF8800", text: "6" },
            { color: "#FF0000", text: "7" },
            { color: "#c5c5c5", text: "8" },
        ],
    },
    fscq: {
        descriptionPrefix: "",
        getColor: getColorFromFscq,
        legend: [
            { text: "-1.5 or lower (overfitting)", color: "#FF0000" },
            { text: "0 (good fit)", color: "#00FF00" },
            { text: "+1.5 or higher (poor fit)", color: "#0000FF" },
        ],
    },
    default: {
        descriptionPrefix: "",
        getColor: getMaxQColor,
        legend: [
            { text: "0 (low resolvability)", color: "#FF0000" },
            {
                text: `${MAXQ_COLOR_UPPPER_THRESHOLD} or above (high resolvability)`,
                color: "#00FF00",
            },
        ],
    },
};

export function getEmValidationFragments(
    pdbAnnotations: PdbAnnotations,
    chainId: ChainId
): Fragments {
    return getFragmentsList(pdbAnnotations, (annotation): FragmentResult[] => {
        if (!isElementOfUnion(annotation.algorithm, getKeys(subtrackByAlgorithm))) return [];

        const { descriptionPrefix, legend, getColor } = getEmResolution(annotation);
        const interval = [annotation.minVal, " -> ", annotation.maxVal].join("");
        const subtrack = subtrackByAlgorithm[annotation.algorithm];
        const subtrackWithCustomName = { ...subtrack, name: `${subtrack.name} (${interval})` };

        return annotation.data.map(
            (fragment): FragmentResult => {
                return {
                    subtrack: subtrackWithCustomName,
                    start: fragment.begin,
                    end: fragment.begin,
                    description: `${descriptionPrefix}${annotation.algorithm}: ${fragment.value}`,
                    legend: legend,
                    color: getColor(fragment.value),
                    chainId,
                };
            }
        );
    });
}

function getEmResolution(pdbAnnotation: PdbAnnotation): EmResolution {
    let item: typeof config[keyof typeof config];

    if (pdbAnnotation.algoType === "localResolution") {
        item = config.localResolution;
    } else if (pdbAnnotation.algorithm === "fscq") {
        item = config.fscq;
    } else {
        item = config.default;
    }

    const colors = item.legend.map(legendItem => legendItem.color);

    return {
        ...item,
        getColor: (value: number) => item.getColor(value, colors),
    };
}

type Color = string;

interface EmResolution {
    legend: Legend;
    descriptionPrefix: string;
    getColor(value: number): Color;
}

/* Color functions from extendProtVista/add_em_res.js */

function getColorFromResolution(resolution: number, emResColors: Color[]) {
    /* Return the color that corresponds to resolution value*/

    // Get resolution integer boundaries
    const highRes = Math.floor(resolution);
    const lowRes = highRes + 1;

    const highResColor =
        emResColors.length <= highRes ? emResColors[emResColors.length - 1] : emResColors[highRes];
    const lowResColor =
        emResColors.length <= lowRes ? emResColors[emResColors.length - 1] : emResColors[lowRes];

    // get the
    return getColorBetween(highResColor, lowResColor, resolution - highRes);
}

function getColorFromFscq(fscq: number, emFscqColors: Color[]) {
    /* Return the color that corresponds to fscq value
     * We want:
     *  red   --> -1.5 or bellow.
     *  green --> 0
     *  blue  --> +1.5 or higher*/

    let lowColor = emFscqColors[1];
    let highColor = emFscqColors[2];
    let colorValue = Math.min(1, fscq / 1.5);
    if (fscq < 0) {
        lowColor = emFscqColors[0];
        highColor = emFscqColors[1];
        colorValue = (fscq + 2) / 2;
        colorValue = Math.max(0, colorValue);
    }
    // get the color from the range
    return getColorBetween(lowColor, highColor, colorValue);
}

function getMaxQColor(maxQValue: number, emMaxQColor: Color[]) {
    /* Return the color that corresponds to a maxQ value. Range: -1 to 1*/
    // get the
    // Bellow 0 all red
    let colorValue = Math.max(maxQValue, 0);
    // Make 0.8 full green.
    colorValue = colorValue / MAXQ_COLOR_UPPPER_THRESHOLD;
    colorValue = Math.min(colorValue, MAXQ_COLOR_UPPPER_THRESHOLD);

    return getColorBetween(emMaxQColor[0], emMaxQColor[1], colorValue);
}

function getColorBetween(
    bottomColor: string | undefined,
    topColor: string | undefined,
    distanceFromBottom: number
): string {
    if (!bottomColor || !topColor) return "#777";

    // Returns the color between the 2 passed color at a certain distance (decimal value)
    let c = "#";
    if (distanceFromBottom < 0) return bottomColor;
    for (let i = 0; i < 3; i++) {
        const subb = bottomColor.substring(1 + 2 * i, 3 + 2 * i);
        const subt = topColor.substring(1 + 2 * i, 3 + 2 * i);
        const vb = parseInt(subb, 16);
        const vt = parseInt(subt, 16);
        const v = vb + Math.floor((vt - vb) * distanceFromBottom);
        const sub = v.toString(16).toUpperCase();
        const padsub = ("0" + sub).slice(-2);
        c += padsub;
    }
    return c;
}
