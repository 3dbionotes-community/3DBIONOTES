"use strict;"

var add_elmdb = function(d){
	var n = 1;
	if( __external_data['elmdb'] && __external_data['elmdb'].length >  0){
		var __elm = ["DOMAINS_AND_SITES",[]];
		var __elm_flag = 1;
		d.forEach(function(i){
			if(i[0]=="DOMAINS_AND_SITES"){
				__elm = i;
				__elm_flag = 0;
			}
		});
		__external_data['elmdb'].forEach(function(i){
			var __description = 'Short linear motif ('+i['description'][0]['Regex']+')';
			var __ext_des = {};
			i['interactions'].forEach(function(j){
				var key = '<b>Interactor:</b> '+j['interactorDomain']+' <b>Domain:</b> '+j['Domain'];
				if(j['StartDomain'] != 'None' && j['StopDomain'] != 'None'){
					key += ' <b>Start:</b> '+j['StartDomain']+' <b>End:</b> '+j['StopDomain']+'<br/>';
				}else{
					key += '<br/>'
				}
				__ext_des[key] = true;
			});
			var __ext = Object.keys(__ext_des);
			if(__ext.length>0)__description = __description+'<br/>'+__ext.join("");
			
			var __f = {begin:i['Start'],end:i['End'],description:__description,internalId:'elm_'+n,type:'region',evidences:
				{
					"Imported information":[{url:'http://elm.eu.org/elms/'+i['ELMIdentifier'],id:i['ELMIdentifier'],name:'Imported from ELM'}]
				}
			}
			__f['evidences']['ECO:0000269'] = [];
			i['References'].split(" ").forEach(function(j){
				__f['evidences']['ECO:0000269'].push({
					id:j,
					name:'PubMed',url:'http://www.ncbi.nlm.nih.gov/pubmed/'+j,
					alternativeUrl:'http://europepmc.org/abstract/MED/'+j
				});
			});
			__f['type'] = 'LINEAR_MOTIF'
			__elm[1].push(__f);
			n++;
		});
		if( __elm_flag ) d.push( __elm );
	}
};

module.exports = add_elmdb;
