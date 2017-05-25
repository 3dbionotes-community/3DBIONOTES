"use strict";

var add_pfam = function(d){
	var n = 1;
	if( __external_data['Pfam'] && __external_data['Pfam'].length >  0){
		var __pfam = ["DOMAIN_FAMILIES",[]];

		__external_data['Pfam'].forEach(function(i){
			var __description = '<b>'+i['info']['description']+'</b>';
			var __ext = '';
			for(var k in i['info']['go']){
				__ext += '<b style="color:grey;">'+k[0].toUpperCase() + k.slice(1)+'</b>: ';
				i['info']['go'][k].forEach(function(j){
					__ext += j+', '; 
				});
				__ext = __ext.slice(0, -2)+'<br/>';
			}
			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'pfam_'+n,type:'PFAM_DOMAIN',evidences:
				{
					"Imported information":[{url:'http://pfam.xfam.org/protein/'+__accession,id:__accession,name:'Imported from Pfam'}]
				}
			}
			__pfam[1].push(__f);
			n++;
		});
		d.push( __pfam );
	}
};

module.exports = add_pfam;
