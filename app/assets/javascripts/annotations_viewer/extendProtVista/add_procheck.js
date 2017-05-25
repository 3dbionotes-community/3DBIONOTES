"use strict";

var add_procheck = function(d){
  if( top.procheck ){
    var  procheck_scores = ["PROCHECK",[]]; 
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      procheck_scores[1].push(__f);
      n++;     
    }
    var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
    var n = 0;
    top.procheck[0][chain].forEach(function(i){
      if(i[1] && i[1].z_scores && i[1].z_scores.max){
        var z_score = i[1].z_scores.max;
        if(z_score > 5 )z_score=5;
        var color = 'rgb(0,255,0)';
        if(z_score<=1){
          color = 'rgb(0,255,0)';
        }else if( z_score<=2){
          color = 'rgb(255,255,0)';
        }else if( z_score<=3){
          color = 'rgb(255,165,0)';
        }else if( z_score<=4){
          color = 'rgb(255,69,0)';
        }else{
          color = 'rgb(255,0,0)';
        }
        procheck_scores[1][ parseInt(i[0]) ].variants = [{ color:color, alternativeSequence:'', type:'measure', begin: i[0], end: i[0], score:z_score, internalId:'procheck_'+n, description:'TODO'}];
        n++;
      }
    });
    d.push( procheck_scores );
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

module.exports = add_procheck;

