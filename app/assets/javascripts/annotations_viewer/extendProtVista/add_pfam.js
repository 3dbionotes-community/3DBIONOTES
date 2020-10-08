"use strict";

var add_pfam = function(data){
  var n = 1;
  var _pfam = [];
  
  data.forEach(function(i){
  	var _description = '<b>'+i['info']['description']+'</b>';
         _description += '<br/><b style="color:grey;">Family</b>: '+i['acc']
  	var _ext = '';
  	for(var k in i['info']['go']){
  		_ext += '<b style="color:grey;">'+k[0].toUpperCase() + k.slice(1)+'</b>: ';
  		i['info']['go'][k].forEach(function(j){
  			_ext += j+', '; 
  		});
  		_ext = _ext.slice(0, -2)+'<br/>';
  	}
  	if( _ext.length > 0 ) _description += '<br/>'+_ext;
  	var _f = {begin:i['start'],end:i['end'],description:_description,internalId:'pfam_'+n,type:'PFAM_DOMAIN',evidences:
  		{
  			"Imported information":[{url:'http://pfam.xfam.org/protein/'+__accession,id:__accession,name:'Imported from Pfam'}]
  		}
  	}
  	_pfam.push(_f);
  	n++;
  });
  return _pfam;
};

module.exports = add_pfam;
