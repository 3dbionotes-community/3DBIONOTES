"use strict";
const emResColors = ["#ff98e9", "#c143ed", "#0000FF", "#00FFFF",
  "#00FF00", "#FFFF00", "#FF8800", "#FF0000",
  "#c5c5c5"];
const emMaxQColor =["#FF0000", "#00FF00"];
const emFscqColors = ["#FF0000", "#00FF00", "#0000FF"];
const MAXQ_COLOR_UPPPER_THRESHOLD = 0.8;

var add_em_res = function (data){
  // Adds em resolution. "data" coming from @asyncURL  or @allURL at frames_annotations_controller
  // Coming data should be at __external_data['emlr']
  // It should be like:
    // [ {"data":[{"begin": 1, "value":2.234], "algorithm":"monores", "chain":"V", "minVal":2, "maxVal":5, "algType":"localResolution"},...]
  if(__external_data['emlr']){
    let __lr = ["EM_VALIDATION",[]];
    let n = 1;
    // For each typ os validation data: monores, deepRes, MaxQ,...
    __external_data['emlr'].forEach(function(annotGroup){

      const type = annotGroup.algorithm + " (" + annotGroup.minVal + " -> " + annotGroup.maxVal + ")";

      annotGroup.data.forEach(function (annot) {

        if(annotGroup.algoType === "localResolution") {
          annot.color = getColorFromResolution(Math.round(annot.value * 100) / 100);
          annot.description = "Local resolution by " + annotGroup.algorithm + ": " + annot.value;
          annot.legend = getResolutionLegend;

        } else if(annotGroup.algorithm === "fscq"){
          annot.color = getColorFromFscq(annot.value);
          annot.description = annotGroup.algorithm +": " + annot.value;
          annot.legend = getFscqLegend;

        } else {
          annot.color = getMaxQColor(annot.value);
          annot.description = annotGroup.algorithm +": " + annot.value;
          annot.legend = getMaxQLegend;
        }
        annot.type = type;
        annot.internalId= 'emvalidation_' + n;

        // Translate alignement
        annot.end=annot.begin;
        annot = top.translate_to_uniprot(annot,__alignment.pdb+":"+__alignment.chain)
        __lr[1].push(annot);
        n++;

      })

    });

    data.push(__lr);
  }
};

function getMaxQColor(maxQValue){
  /* Return the color that corresponds to a maxQ value. Range: -1 to 1*/
  // get the
  // Bellow 0 all red
  let colorValue = Math.max(maxQValue, 0);
  // Make 0.8 full green.
  colorValue = colorValue/MAXQ_COLOR_UPPPER_THRESHOLD;
  colorValue = Math.min(colorValue, MAXQ_COLOR_UPPPER_THRESHOLD);

  return getColorBetween(emMaxQColor[0], emMaxQColor[1], colorValue);

};
function getMaxQLegend() {

  return [[emMaxQColor[0], " 0 (low resolvability)"], [emMaxQColor[1], MAXQ_COLOR_UPPPER_THRESHOLD + " or above (high resolvability)"]];
}

function getFscqLegend() {
  let legend = [];
  legend.push([emFscqColors[0], "-2 or lower (overfitting)"]);
  legend.push([emFscqColors[1], " 0 (good fit)"]);
  legend.push([emFscqColors[2], " 3 or higher (poor fit)"]);

  return legend;
}

function getColorFromFscq(fscq){
  /* Return the color that corresponds to fscq value
  * We want:
  *  red   --> -3 or bellow.
  *  green --> 0
  *  blue  --> +3 or higher*/

  let lowColor = emFscqColors[1];
  let highColor = emFscqColors[2];
  let colorValue = Math.min(1, fscq/3);
  if (fscq < 0){
    lowColor = emFscqColors[0];
    highColor = emFscqColors[1];
    colorValue = (fscq+2)/2;
    colorValue = Math.max(0, colorValue);
  }
  // get the color from the range
  return getColorBetween(lowColor, highColor, colorValue)

};


function getResolutionLegend() {
  let legend = [];
  let n = 0;
  emResColors.forEach(function (color) {
    legend.push([color, n]);
    n++;
  });

  return legend;
}

function getColorFromResolution(resolution){
  /* Return the color that corresponds to resolution value*/

  // Get resolution integer boundaries
  let highRes = Math.floor(resolution);
  let lowRes = highRes +1;

  const highResColor = emResColors.length <= highRes ? emResColors[emResColors.length-1] : emResColors[highRes];
  const lowResColor = emResColors.length <= lowRes ? emResColors[emResColors.length-1] : emResColors[lowRes];

  // get the
  return getColorBetween(highResColor, lowResColor, resolution-highRes)

};

function getColorBetween(bottomColor, topColor, distanceFromBottom){
  // Returns the color between the 2 passed color at a certain distance (decimal value)
  let c = "#";
  if (distanceFromBottom < 0) return bottomColor
  for(let i = 0; i<3; i++) {
    const subb = bottomColor.substring(1 + 2 * i, 3 + 2 * i);
    const subt = topColor.substring(1 + 2 * i, 3 + 2 * i);
    const vb = parseInt(subb, 16);
    const vt = parseInt(subt, 16);
    const v = vb + Math.floor((vt - vb) * distanceFromBottom);
    const sub = v.toString(16).toUpperCase();
    const padsub = ('0' + sub).slice(-2);
    c += padsub;
  }
  return c
}

module.exports = add_em_res;