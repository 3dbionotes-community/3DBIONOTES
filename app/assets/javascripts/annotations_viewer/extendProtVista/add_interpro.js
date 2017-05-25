"use strict";

var add_interpro = function (d){
	var n = 1;
	if( __external_data['interpro'] && __external_data['interpro'].length >  0){
		var __interpro = ["DOMAIN_FAMILIES",[]];
		var __interpro_flag = 1;
		d.forEach(function(i){
			if(i[0]=="Domain families"){
				__interpro = i;
				__interpro_flag = 0;
			}
		});

		__external_data['interpro'].forEach(function(i){
			var k = i['description']['name'];
			var __description = '<b>'+k+'</b>';
			var __ext = '';
			if( i['description']['go'] ){
				__ext = '<b style="color:grey;">GO terms</b><br/>'
				i['description']['go'].forEach(function(j){
					var r = j.split(' ; ');
					var go = r[0].replace("GO:","");
					go = go[0].toUpperCase() + go.slice(1);
					__ext += "<a href=\"http://amigo.geneontology.org/amigo/term/"+r[1]+"\" target=\"_blank\">"+go+"</a><br/>";
				});
			}
			if( __ext.length > 0 ) __description += '<br/>'+__ext;
			var __f = {begin:i['start'],end:i['end'],description:__description,internalId:'interpro_'+n,type:'INTERPRO_DOMAIN',evidences:
				{
					"Imported information":[{url:'https://www.ebi.ac.uk/interpro/protein/'+__accession,id:__accession,name:'Imported from InterPro'}]
				}
			}
			__interpro[1].push(__f);
			n++;
		});
		if( __interpro_flag ) d.push( __interpro );
	}
};


module.exports = add_interpro;
