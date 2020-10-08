"use strict";

var add_interpro = function (data){
  var n = 1;
  var _interpro = [];
  
  data.forEach(function(i){
  	var k = i['description']['name'];
  	var _description = '<b>'+k+'</b>';
  	var _ext = '';
  	if( i['description']['go'] ){
  		_ext = '<b style="color:grey;">GO terms</b><br/>'
  		i['description']['go'].forEach(function(j){
  			var r = j.split(' ; ');
  			var go = r[0].replace("GO:","");
  			go = go[0].toUpperCase() + go.slice(1);
  			_ext += "<a href=\"http://amigo.geneontology.org/amigo/term/"+r[1]+"\" target=\"_blank\">"+go+"</a><br/>";
  		});
  	}
  	if( _ext.length > 0 ) _description += '<br/>'+_ext;
  	var _f = {begin:i['start'],end:i['end'],description:_description,internalId:'interpro_'+n,type:'INTERPRO_DOMAIN',evidences:
  		{
  			"Imported information":[{url:'https://www.ebi.ac.uk/interpro/protein/'+__accession,id:__accession,name:'Imported from InterPro'}]
  		}
  	}
  	_interpro.push(_f);
  	n++;
  });
  return _interpro;
};


module.exports = add_interpro;
