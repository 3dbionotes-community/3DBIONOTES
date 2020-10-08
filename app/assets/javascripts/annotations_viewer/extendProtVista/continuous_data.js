"use strict";

var n = 1;
var continuous_data = function (d){
    var out = [];
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      out.push(__f);
      n++;     
    }
    var n = 0;
    var max = -1000000000;
    var min = 1000000000;
    d.forEach(function(i){
      var x = parseFloat(i.value);
      if(x>max)max=x;
      if(x<min)min=x;
    });
    d.forEach(function(i){
      var x = parseFloat(i.value);
      var r = parseInt( 255*(x-min)/(max-min) );
      if(r>255)r=255;
      var b = 255-r;
      if(b<0)b = 0;
      var color = 'rgb('+r+',0,'+b+')';
      if(out[ i.begin ])out[ i.begin ].variants = [{color:color, alternativeSequence:'', type:'measure', begin: i.begin, end:i.begin, score:i.value, internalId:'measure_'+n, description:'' }];
      n++;
    });
    return out;
};

module.exports = continuous_data;
