"use strict";

var add_binding_residues = function(d){
  if( top.binding_residues && top.binding_residues[0] > 0 ){
    var n_model = top.n_model_main_frame;
    var  b_res = ["INTERACTING_RESIDUES",[]]; 
    var n = 1;
    for(var i = 0;i<top.binding_residues[0];i++){
      var __f = {begin:(-100-1*i),end:(-100-1*i),internalId:'bs_'+n,type:'INTERACTING_RESIDUES',description:'<b style=\"color:grey;\">Binding Site</b><br/>Region that interacts with other proteins in the complex'};
      b_res[1].push(__f)
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    var n = 0;
    top.binding_residues[n_model][chain].forEach(function(i){
      b_res[1][n].begin = i.begin;
      b_res[1][n].end = i.end;
      n++;
    });
    d.push( b_res );
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

module.exports = add_binding_residues;
