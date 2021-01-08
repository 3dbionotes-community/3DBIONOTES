import _ from "lodash";
import { Fragment } from "../../domain/entities/Fragment";
import { Legend } from "../../domain/entities/Legend";
import { Track } from "../../domain/entities/Track";
import { PdbAnnotations, PdbAnnotation } from "./PdbRepositoryNetwork.types";
import { getName } from "./utils";

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

export function getEmValidationTrack(pdbAnnotations: PdbAnnotations): Track {
    const data: Track["data"] = pdbAnnotations.map((pdbAnnotation: PdbAnnotation) => {
        const label = `${pdbAnnotation.algorithm} (${pdbAnnotation.minVal} -> ${pdbAnnotation.maxVal})`;
        const { descriptionPrefix, legend, getColor } = getEmResolution(pdbAnnotation);

        return {
            accession: pdbAnnotation.algorithm,
            type: _.capitalize(label),
            label: getName(label),
            labelTooltip: label,
            overlapping: false,
            shape: "rectangle",
            locations: [
                {
                    fragments: pdbAnnotation.data.map(
                        (fragment): Fragment => ({
                            start: parseInt(fragment.begin),
                            end: parseInt(fragment.begin),
                            description: `${descriptionPrefix}${pdbAnnotation.algorithm}: ${fragment.value}`,
                            legend: legend,
                            color: getColor(fragment.value),
                        })
                    ),
                },
            ],
        };
    });

    return {
        label: "em validation",
        labelType: "text",
        overlapping: false,
        data,
    };
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
    let highRes = Math.floor(resolution);
    let lowRes = highRes + 1;

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

function getColorBetween(bottomColor: string, topColor: string, distanceFromBottom: number) {
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
