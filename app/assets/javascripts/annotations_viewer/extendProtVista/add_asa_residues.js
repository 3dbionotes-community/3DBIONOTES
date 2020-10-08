"use strict";

var add_asa_residues = function (_n){
  var asa_res = null;
  if( !imported_flag && top.asa_residues ){
    var n_model = top.n_model_main_frame-1;
    if(_n)n_model = _n-1;
    var asa_res = ["RESIDUE_ASA",[]]; 
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      asa_res[1].push(__f);
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    if(top.asa_residues[n_model][chain]){
      var n = 0;
      top.asa_residues[n_model][chain].forEach(function(i){
        var r = parseInt(i[1]*255);
        if(r>255)r=255;
        var b = 255-r;
        if(b<0)b = 0;
        var color = 'rgb('+r+',0,'+b+')';
        var rasa = parseFloat(i[1]*100).toFixed(2);
        if(asa_res[1][ parseInt(i[0]) ]){
          asa_res[1][ parseInt(i[0]) ].variants = [{ color:color, 
                                                     alternativeSequence:'', 
                                                     type:'measure', 
                                                     begin: i[0], 
                                                     end: i[0], 
                                                     score:i[1], 
                                                     internalId:'asa_'+n, 
                                                     description:'<b style=\"color:grey;\">Relative accessible surface area</b><br/>Residue accesibility '+rasa+'%'
          }];
        }
        n++;
      });
    }
  }
  return asa_res;
};

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = add_asa_residues;
