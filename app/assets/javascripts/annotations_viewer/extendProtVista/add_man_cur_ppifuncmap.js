"use strict";

var add_man_cur_ppifuncmap = function (data) {

  let resItems = [];
  let resCat = ["FUNCTIONAL_MAPPING_PPI", resItems];
  let accession = __alignment.uniprot;

  // chech if we can load annotations for this accession
  if (__cvData == null) return;

  if (__cvData.forEach) {
    __cvData.forEach(function (track) {
      if (track != null)
        if (track.track_name == "Functional_mapping_PPI") {
          var data = track.data;
          // console.log("->>> FUNCTIONAL_MAPPING_PPI reading .__cvData.track", track);
          if (track.data.forEach) {
            track.data.forEach(function (feat) {
              // console.log("->>> FUNCTIONAL_MAPPING_PPI reading .__cvData.track.data.feat");
              if (track.reference) {
                var icon_link = "";
                if (track.fav_icon) {
                  var icon_link = '&nbsp;&nbsp;<img src="' + track.fav_icon + '" width="16" height="16">'
                };
                feat.description = feat.description + '<br><br><b>Data source:</b>'
                  + icon_link
                  + '&nbsp;&nbsp;<a href="' + track.reference + '" target="_blank">' + track.reference + '</a>'
              };
              resItems.push(feat);
            });
          };
        };
    });
  };

  data.push(resCat);

};

module.exports = add_man_cur_ppifuncmap;