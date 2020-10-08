"use strict";

var add_smart = function(data){
  var n = 1;
  var _smart = [];
  
  data.forEach(function(i){
  	var k = i['domain'].replace("_"," ");
  	k = k[0].toUpperCase() + k.slice(1);
  	var _description = '<b>'+k+'</b>';
  	var _ext = '<b style="color:grey;">Type</b>: '+i['type'][0]+i['type'].slice(1).toLowerCase();
  
  	if( _ext.length > 0 ) _description += '<br/>'+_ext;
  	var _f = {begin:i['start'],end:i['end'],description:_description,internalId:'smart_'+n,type:'SMART_DOMAIN',evidences:
  		{
  			"Imported information":[{url:'http://smart.embl.de/smart/batch.pl?INCLUDE_SIGNALP=1&IDS='+__accession,id:__accession,name:'Imported from SMART'}]
  		}
  	}
  	_smart.push(_f);
  	n++;
  });
  return _smart;
};

module.exports = add_smart;
