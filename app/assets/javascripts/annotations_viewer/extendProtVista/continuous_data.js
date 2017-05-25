"use strict";

var continuous_data = function (d){
    var out = [];
    var n = 1;
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      out.push(__f);
      n++;     
    }
    var n = 0;
    d.forEach(function(i){
      var r = i.value;
      if(r>255)r=255;
      var b = 255-r;
      if(b<0)b = 0;
      var color = 'rgb('+r+',0,'+b+')';
      out[ i.begin ].variants = [{color:color, alternativeSequence:'', type:'measure', begin: i.begin, end:i.begin, score:i.value, internalId:'test_'+n, description:'' }];
      n++;
    });
    return out;
};

module.exports = continuous_data;
