"use strict";

var add_phosphosite = function(d){
	var n = 1;
	if(__external_data['phosphosite']){
		var __ptm = ["PTM",[]];
		var __sites = ["DOMAINS_AND_SITES",[]];
		var __ptm_flag = 1;
		var __sites_flag = 1;
		d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
				__ptm_flag = 0;
			}
			if(i[0]=="DOMAINS_AND_SITES"){
				__sites = i;
				__sites_flag = 0;
			}
		});
		__external_data['phosphosite'].forEach(function(i){
			if( i['subtype'] == "Regulatory site" || i['subtype'] == "Sustrate-Kinase interaction" || i['subtype'] == "Diseases-associated site" ){
				var __aux = i['description'].split(";;");
				var __description = "<b style=\"color:grey;\">"+i['subtype']+"</b> <br>";
				__aux.forEach(function(k){
					var __r = k.split(":");
					if( __r[1] && __r[1].length>1 )__description += "<b style=\"color:grey;\">"+ __r[0]+"</b>: "+__r[1].replace("("," (")+". <br>";
				});
				__description.substring(0, __description.length - 4);
				var __label = 'site';
				if(i['subtype'] == "Sustrate-Kinase interaction"){
					__label = 'BINDING';
				}
				__sites[1].push({begin:i['start'],end:i['end'],description:__description,internalId:'ppsp_'+n,type:__label,evidences:
					{
						"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
					}
				});
				n++;
			}else{
				var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
				if( __aux.length > 0 ){
					var __flag = null;
					__aux.forEach(function(j){
					        var i_t = i['subtype'].toLowerCase();
					        var j_t = j['description'].toLowerCase();

						if( (i_t == j_t) ||
                                                    (i_t.indexOf("phospho")>-1 && j_t.indexOf("phospho")>-1)||
                                                    (i_t.indexOf("glcnac")>-1 && j_t.indexOf("glcnac")>-1)||
						    (i_t.indexOf("nitros")>-1 && j_t.indexOf("nitros")>-1)||
						    (i_t.indexOf("palmi")>-1 && j_t.indexOf("palmi")>-1)||
						    (i_t.indexOf("methyl")>-1 && j_t.indexOf("methyl")>-1)||
						    (i_t.indexOf("ubiquit")>-1 && j_t.indexOf("ubiquit")>-1)||
						    (i_t.indexOf("acetyl")>-1 && j_t.indexOf("acetyl")>-1)||
                                                    (i_t.indexOf("glyco")>-1 && j_t.indexOf("glcnac")>-1)||
						    ((i_t.indexOf("prenyl")>-1 || i_t.indexOf("farnesyl")>-1) && (j_t.indexOf("prenyl")>-1 || j_t.indexOf("farnesyl")>-1))

                                                  ){
							__flag = j;
						}
					});
					if(__flag){
						var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
                                                if( ! __flag['evidences']) __flag['evidences'] = {};
						if( ! __flag['evidences']["Imported information"] ) __flag['evidences']["Imported information"]=[];
						__flag['evidences']["Imported information"].push(
								{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}
							);
					}else{
						__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
							{
								"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
							}
						});
						n++;
					}
				}else{
					__ptm[1].push({begin:i['start'],end:i['end'],description:i['subtype'],internalId:'ppsp_'+n,type:'MOD_RES',evidences:
						{
							"Imported information":[{url:'http://www.phosphosite.org/uniprotAccAction.do?id='+__accession,id:__accession,name:'Imported from PhosphoSitePlus'}]
						}
					});
					n++;
				}
			}
		});
		if(__ptm_flag)d.push( __ptm );
		if(__sites_flag)d.push( __sites );
	}
};

module.exports = add_phosphosite;
