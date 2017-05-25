"use strict";

var add_smart = function(d){
	var n = 1;
	if( __external_data['smart'] && __external_data['smart'].length >  0){
		var __smart = ["DOMAIN_FAMILIES",[]];
		var __smart_flag = 1;
		d.forEach(function(i){
			if(i[0]=="Domain families"){
				__smart = i;
				__smart_flag = 0;
			}
		});

		__external_data['smart'].forEach(function(i){
			var k = i['domain'].replace("_"," ");
			k = k[0].toUpperCase() + k.slice(1);
			var __description = '<b>'+k+'</b>';
			var __ext = '<b style="color:grey;">Type</b>: '+i['type'][0]+i['type'].slice(1).toLowerCase();

			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'smart_'+n,type:'SMART_DOMAIN',evidences:
				{
					"Imported information":[{url:'http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS='+__accession,id:__accession,name:'Imported from SMART'}]
				}
			}
			__smart[1].push(__f);
			n++;
		});
		if( __smart_flag ) d.push( __smart );
	}
};

module.exports = add_smart;
