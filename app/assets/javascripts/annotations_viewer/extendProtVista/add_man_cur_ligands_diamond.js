"use strict";

var add_man_cur_ligands_diamond = function (data) {

  let resItems = [];
  let resCat = ["PANDDA_DRUG_SCREENING_DIAMOND", resItems];
  let accession = __alignment.uniprot;

  // chech if we can load annotations for this accession
  console.log("->>> DRUG_SCREENING reading .__cvData");
  if (__cvData == null) return;

  if (__cvData.forEach) {
    __cvData.forEach(function (track) {
      if (track != null)
        if (track.track_name == "Diamond_drug_screening") {
          var data = track.data;
          // console.log("->>> DRUG_SCREENING reading .__cvData.track");
          if (track.data.forEach) {
            track.data.forEach(function (feat) {
              // console.log("->>> DRUG_SCREENING reading .__cvData.track.data.feat", feat);
              if (track.reference) {
                var icon_link = "";
                if (track.fav_icon) {
                  var icon_link = '&nbsp;&nbsp;<img src="' + track.fav_icon + '" width="16" height="16">'
                };
                feat.description = feat.description + '<br><br><b>Data source:</b>'
                  + icon_link
                  + '&nbsp;&nbsp;<a href="' + track.reference + '" target="_blank">' + track.reference + '</a>'
              };

              // Change color if PDB matches the drug
              if (feat.info){
                if(feat.info["PDB ID"]){
                  let featPDB = feat.info["PDB ID"].toLowerCase();
                  if (featPDB === __alignment.pdb){
                    feat.color = "red"
                  };
                };
              };

              resItems.push(feat);
            });
          };
        };
    });
  };

  data.push(resCat);

};

module.exports = add_man_cur_ligands_diamond;
