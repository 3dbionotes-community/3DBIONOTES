"use strict";

var add_iedb = function(d){
	var n = 1;
	var m = 0;
	if(__external_data['iedb']){
	  var count = {}
		var __epitopes = ["EPITOPES",[]];
	  var type = "LINEAR_EPITOPE";
	  var tag = 0;
		__external_data['iedb'].forEach(function(i){
      for(var j=i['start'];j<=i['end'];j++){
        if(j in count){
          count[j]++;
        }else{
          count[j]=1;
        }
        if(count[j]>m)m=count[j];
      }
			__epitopes[1].push({color:'#83BE00',type:type,begin:i['start'],end:i['end'],description:'Linear epitope',internalId:'iedb_'+n,evidences:
				{
					"Imported information":[{url:'http://www.iedb.org/epitope/'+i['evidence'],id:i['evidence'],name:'Imported from IEDB'}]
				}
			});
			n++;
        if(m>3){
          m = 0;
          count = {};
          tag++;
          type = "LINEAR_EPITOPE_"+tag;
        }
		});
		d.push( __epitopes );
	}
};

module.exports =  add_iedb;

