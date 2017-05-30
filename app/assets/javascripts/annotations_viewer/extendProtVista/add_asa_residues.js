"use strict";

var add_asa_residues = function (d){
  if( top.asa_residues ){
    var n_model = top.n_model_main_frame-1;
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
        var r = parseInt(255/120*i[1]);
        if(r>255)r=255;
        var b = 255-r;
        if(b<0)b = 0;
        var color = 'rgb('+r+',0,'+b+')';
        asa_res[1][ parseInt(i[0]) ].variants = [{ color:color, 
                                                   alternativeSequence:'', 
                                                   type:'measure', 
                                                   begin: i[0], 
                                                   end: i[0], 
                                                   score:i[1], 
                                                   internalId:'asa_'+n, 
                                                   description:'<b style=\"color:grey;\">Accessible surface area</b><br/>Residue accesibility '+i[1]+'&#197<sup>2</sup>' 
        }];
        n++;
      });
      d.push( asa_res );
    }
  }
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
