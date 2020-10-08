"use strict;"

var add_elmdb = function(data){
  var n = 1;
  var _elm = [];
  data.forEach(function(i){
  	var _description = 'Short linear motif ('+i['description'][0]['Regex']+')';
  	var _ext_des = {};
  	i['interactions'].forEach(function(j){
  		var key = '<b>Interactor:</b> '+j['interactorDomain']+' <b>Domain:</b> '+j['Domain'];
  		if(j['StartDomain'] != 'None' && j['StopDomain'] != 'None'){
  			key += ' <b>Start:</b> '+j['StartDomain']+' <b>End:</b> '+j['StopDomain']+'<br/>';
  		}else{
  			key += '<br/>'
  		}
  		_ext_des[key] = true;
  	});
  	var _ext = Object.keys(_ext_des);
  	if(_ext.length>0)_description = _description+'<br/>'+_ext.join("");
  	
  	var _f = {begin:i['Start'],end:i['End'],description:_description,internalId:'elm_'+n,type:'region',evidences:
  		{
  			"Imported information":[{url:'http://elm.eu.org/elms/'+i['ELMIdentifier'],id:i['ELMIdentifier'],name:'Imported from ELM'}]
  		}
  	}
  	_f['evidences']['ECO:0000269'] = [];
  	i['References'].split(" ").forEach(function(j){
  		_f['evidences']['ECO:0000269'].push({
  			id:j,
  			name:'PubMed',url:'http://www.ncbi.nlm.nih.gov/pubmed/'+j,
  			alternativeUrl:'http://europepmc.org/abstract/MED/'+j
  		});
  	});
  	_f['type'] = 'LINEAR_MOTIF'
  	_elm.push(_f);
  	n++;
  });
  return _elm;
};

module.exports = add_elmdb;
