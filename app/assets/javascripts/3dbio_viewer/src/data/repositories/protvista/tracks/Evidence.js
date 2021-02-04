/* Original myProtVista/src/Evidence.js */

/*jslint node: true */
/*jshint laxbreak: true */
/*jshint laxcomma: true */
"use strict";

var _ = require("underscore");

var Evidence = (function () {
    return {
        manual: [
            "ECO:0000269",
            "ECO:0000303",
            "ECO:0000305",
            "ECO:0000250",
            "ECO:0000255",
            "ECO:0000244",
            "ECO:0000312",
        ],
        automatic: ["ECO:0000256", "ECO:0000213", "ECO:0000313", "ECO:0000259"],
        acronym: {
            "ECO:0000269": "EXP",
            "ECO:0000303": "NAS",
            "ECO:0000305": "IC",
            "ECO:0000250": "ISS",
            "ECO:0000255": "ISM",
            "ECO:0000244": "MIXM",
            "ECO:0000312": "MI",
            "ECO:0000256": "AA",
            "ECO:0000213": "MIXA",
            "ECO:0000313": "AI",
            "ECO:0000259": "AA",
        },
        text: {
            "ECO:0000269": "Manual assertion based on experiment",
            "ECO:0000303": "Manual assertion based on opinion",
            "ECO:0000305": "Manual assertion inferred by curator",
            "ECO:0000250": "Manual assertion inferred from sequence similarity",
            "ECO:0000255": "Manual assertion according to rules",
            "ECO:0000244":
                "Manual assertion inferred from combination of experimental and computational evidence",
            "ECO:0000312": "Manual assertion inferred from database entries",
            "ECO:0000256": "Automatic assertion according to rules",
            "ECO:0000259": "Automatic assertion inferred from signature match",
            "ECO:0000213":
                "Automatic assertion inferred from combination of experimental and computational evidence",
            "ECO:0000313": "Automatic assertion inferred from database entries",
        },
        isLSS: function (evidences) {
            return _.some(evidences, function (evidence) {
                return _.contains(Evidence.automatic, evidence.code);
            });
        },
        variantSourceType: {
            uniprot: "uniprot",
            lss: "large_scale_study",
            mixed: "mixed",
        },
        existAssociation: function (association) {
            if (association) {
                if (association.length !== 0) {
                    if (
                        (association[0].moreInfo && association[0].moreInfo.length !== 0) ||
                        association[0].name ||
                        association[0].description
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    };
})();

// From ToltipFactory.js

// tooltip : { accession: string }
// code: string
// sources: SingletonArray<{ id: string, name: string, url: string} >
var getEvidenceText = function (tooltip, code, sources) {
    var acronym = Evidence.acronym[code];
    var publications = _.where(sources, { name: "PubMed" }).length;
    publications += _.where(sources, { name: "Citation" }).length;
    var evidenceText = "";
    if (acronym === "EXP" || acronym === "NAS") {
        publications += _.filter(sources, function (s) {
            if (s.id && s.id.indexOf("ref.") === 0) {
                s.name = "Citation";
                s.url =
                    "http://www.uniprot.org/uniprot/" + tooltip.accession + "#ref" + s.id.slice(4);
                return true;
            } else {
                return false;
            }
        }).length;
        evidenceText = publications + (publications > 1 ? " Publications" : " Publication");
    } else if (acronym === "IC") {
        evidenceText =
            publications === 0
                ? "Curated"
                : publications + (publications > 1 ? " Publications" : " Publication");
    } else if (acronym === "ISS") {
        evidenceText = "By similarity";
    } else if (acronym === "ISM") {
        evidenceText =
            !sources || sources.length === 0
                ? "Sequence Analysis"
                : sources[0].name + " annotation";
    } else if (acronym === "MIXM" || acronym === "MIXA") {
        evidenceText = "Combined sources";
    } else if (acronym === "MI" || acronym === "AI") {
        evidenceText = "Imported";
    } else if (acronym === "AA") {
        var unirule = sources
            ? _.find(sources, function (source) {
                  return source.url && source.url.indexOf("unirule") !== -1;
              })
            : false;
        var saas = sources
            ? _.find(sources, function (source) {
                  return source.url && source.url.indexOf("SAAS") !== -1;
              })
            : false;
        var interpro = sources
            ? _.find(sources, function (source) {
                  return source.name === "Pfam";
              })
            : false;
        evidenceText = unirule
            ? "UniRule annotation"
            : saas
            ? "SAAS annotation"
            : interpro
            ? "InterPro annotation"
            : sources
            ? sources[0].name + " annotation"
            : "Automatic annotation";
    } else {
        evidenceText = code;
    }
    return evidenceText + (Evidence.text[code] ? " (" + Evidence.text[code] + ")" : "");
};

module.exports = { getEvidenceText };
