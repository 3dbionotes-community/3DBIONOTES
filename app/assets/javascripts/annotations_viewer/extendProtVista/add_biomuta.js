"use strict";

var add_biomuta  =  function(__d){
	var d = __d[0][1];
	var n = 1;
	if(__external_data['biomuta']){
		__external_data['biomuta'].forEach(function(i){
			if( !d[ i['start'] ] ) return;
			var __aux = jQuery.grep(d[ i['start'] ]['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
			var __mut = __aux[0];
			if( __mut ){
                                if(__mut.sourceType=="large_scale_study") __mut["color"] = "#FF0000";
				if(!__mut['association'])__mut['association']=[];
				var __src = __mut['association'];
				var __pubmed = i['evidence'][0]['references'][0].substr(7);
				var __name = i['disease'];
				if(i['disease'].indexOf("/")>-1){
					__name = i['disease'].substr(i['disease'].indexOf("/")+2).split(" \[")[0]
				}
				__name = __name.charAt(0).toUpperCase() + __name.slice(1);

				var __polyphen = " - Polyphen: "+i['polyphen'].replace("possibly","probably");

				var __aux = jQuery.grep(__src,function(k){return(k['name']==__name)});
				if(__aux.length==0 && __pubmed.indexOf(';')<0 ) __src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__pubmed,name:'BioMuta DB'+__polyphen,url:'http://www.ncbi.nlm.nih.gov/pubmed/'+__pubmed}]
				});
				if(__mut['association'].length == 0) __mut['association'] = null;
			}else{
                                variants_extended = true;
				var __new_mut = {
					internalId:"bm_"+n,
					type: "VARIANT",
					sourceType:"large_scale_study",
					wildType: i['original'],
					alternativeSequence:i['variation'],
					begin:i['start'],
					end:i['start'],
					association:[],
                                        color:"#FF0000"
				};

				var __src = __new_mut['association'];
				var __pubmed = i['evidence'][0]['references'][0].substr(7);
				var __name = i['disease'];

				if(i['disease'].indexOf("/")>-1){
					__name = i['disease'].substr(i['disease'].indexOf("/")+2).split(" \[")[0]
				}
				__name = __name.charAt(0).toUpperCase() + __name.slice(1);

				var __polyphen = " - Polyphen: "+i['polyphen'].replace("possibly","probably");

				var __aux = jQuery.grep(__src,function(k){return(k['name']==__name)});
				if(__aux.length==0 && __pubmed.indexOf(';')<0 ) __src.push({
					disease:true,
					name:__name,
					xrefs:[{id:__pubmed,name:'BioMuta DB'+__polyphen,url:'http://www.ncbi.nlm.nih.gov/pubmed/'+__pubmed}]
				});
				if( __pubmed.indexOf(';')<0 ) d[ i['start'] ]['variants'].push( __new_mut );
				n++;
			}
		});
	}
};

module.exports = add_biomuta;
