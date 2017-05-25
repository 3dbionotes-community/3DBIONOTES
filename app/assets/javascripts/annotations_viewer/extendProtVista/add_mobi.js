"use strict";

var add_mobi =  function(d){
	var n = 1;
	if( __external_data['mobi'] ){
		var __disorder = ["DISORDERED_REGIONS",[]];
                var __flag = false;
		for(var i in __external_data['mobi']){
			var __type = i.toUpperCase();
			__external_data['mobi'][i].forEach(function(j){
				__disorder[1].push({type:__type,begin:j['start'],end:j['end'],description:'Disordered region',internalId:'mobi_'+n,evidences:
					{
						"Imported information":[{url:'http://mobidb.bio.unipd.it/entries/'+__accession, id:__accession, name:'Imported from MobyDB'}]
					}
				});
				n++;
                                __flag = true;
			});
		}
		if(__flag) d.push( __disorder );
	}
};

module.exports = add_mobi;
