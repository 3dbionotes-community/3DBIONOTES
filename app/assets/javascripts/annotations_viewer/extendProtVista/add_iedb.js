"use strict";

var add_iedb = function(d){
	var n = 1;
	if(__external_data['iedb']){
		var __epitopes = ["EPITOPES",[]];
		__external_data['iedb'].forEach(function(i){
			__epitopes[1].push({type:'LINEAR_EPITOPE',begin:i['start'],end:i['end'],description:'Linear epitope',internalId:'iedb_'+n,evidences:
				{
					"Imported information":[{url:'http://www.iedb.org/epitope/'+i['evidence'],id:i['evidence'],name:'Imported from IEDB'}]
				}
			});
			n++;
		});
		d.push( __epitopes );
	}
};

module.exports =  add_iedb;

