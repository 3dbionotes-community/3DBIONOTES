"use strict";

var add_dsysmap = function (__d){
	var d = __d[0][1];
	var n = 1;
	if(__external_data['dsysmap']){
		__external_data['dsysmap'].forEach(function(i){
			if( !d[ i['start'] ] ) return;
			var __aux = jQuery.grep(d[ i['start']] ['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
			var __mut = __aux[0];
			if( __mut ){
                                if(__mut.sourceType=="large_scale_study") __mut["color"] = "#FF0000";
				if(!__mut['association'])__mut['association']=[];
				var __src = __mut['association'];
				var __name = i['disease']['text'];
				__src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__accession,name:'dSysMap DB',url:'http://dsysmap.irbbarcelona.org/results.php?type=proteins&neigh=0&value='+__accession}]
				});
			}
		});
	}
};

module.exports = add_dsysmap;
