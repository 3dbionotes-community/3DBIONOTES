"use strict";

var add_dsysmap = function (data,d){
  data.forEach(function(i){
  	if( !d[ i['start'] ] ) return;
  	var _aux = jQuery.grep(d[ i['start']] ['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
  	var _mut = _aux[0];
  	if( _mut ){
                  if(_mut.sourceType=="large_scale_study") _mut["color"] = "#FF0000";
  		if(!_mut['association'])_mut['association']=[];
  		var _src = _mut['association'];
  		var _name = i['disease']['text'];
  		_src.push({
  			disease:true,
  			name:_name,
  			xrefs:[{id:__accession,name:'dSysMap DB',url:'http://dsysmap.irbbarcelona.org/results.php?type=proteins&neigh=0&value='+__accession}]
  		});
  	}
  });
};

module.exports = add_dsysmap;
