"use strict";

var add_dbptm  =  function(d){
	var n = 1;
	if(__external_data['dbptm']){
		var __ptm = ["PTM",[]];
		var __ptm_flag = 1;
		d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
				__ptm_flag = 0;
			}
		});
		__external_data['dbptm'].forEach(function(i){
			var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
			if( __aux.length > 0 ){
				var __flag = null;
				__aux.forEach(function(j){
					var i_t = i['type'].toLowerCase();
					var j_t = j['description'].toLowerCase();
					if( 	
						( i_t == j_t ) || 
						( i_t.indexOf("phospho")>-1 && j_t.indexOf("phospho")>-1 ) || 
						( i_t.indexOf("nitros")>-1 && j_t.indexOf("nitros")>-1 ) ||
						( i_t.indexOf("palmi")>-1 && j_t.indexOf("palmi")>-1 ) ||
						( i_t.indexOf("methyl")>-1 && j_t.indexOf("methyl")>-1 ) ||
						( i_t.indexOf("ubiquit")>-1 && j_t.indexOf("ubiquit")>-1 ) ||
						( i_t.indexOf("acetyl")>-1 && j_t.indexOf("acetyl")>-1 ) ||
                                                ( i_t.indexOf("glyco")>-1 && j_t.indexOf("glcnac")>-1 ) ||
                                                ( i_t.indexOf("sumo")>-1 && j_t.indexOf("sumo")>-1 )||
						( (i_t.indexOf("prenyl")>-1 || i_t.indexOf("farnesyl")>-1) && (j_t.indexOf("prenyl")>-1 || j_t.indexOf("farnesyl")>-1) )
					){
						__flag = j;
					}
				});
				if(__flag){
					var __aux = jQuery.grep(__ptm[1],function(e){ return (e.begin == i['start'] && e.end == i['end']); });
                                        if( ! __flag['evidences'] ) __flag['evidences']={};
					if( ! __flag['evidences']['ECO:0000269'] ) __flag['evidences']['ECO:0000269']=[];
					var __evs = __flag['evidences']['ECO:0000269'];
					var pubmed_ids = i['evidences'].split(";");
					pubmed_ids.forEach(function(ii){
						var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
						if(__ids.length == 0) __evs.push({
							id:ii,
							name:'PubMed',
							url:'http://www.ncbi.nlm.nih.gov/pubmed/'+ii,
							alternativeUrl:'http://europepmc.org/abstract/MED/'+ii
						});
					});
				}else{
					var __d = {
						begin:i['start'],
						end:i['end'],
						description:i['type'],
						internalId:'dbptm_'+n,
						type:'MOD_RES',
						evidences:{
							'ECO:0000269':[]
						}
					};
					var __evs = __d['evidences']['ECO:0000269'];
					var pubmed_ids = i['evidences'].split(";");
					pubmed_ids.forEach(function(ii){
						var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
						if(__ids.length == 0) {
                                                  __d['evidences']['ECO:0000269'].push({
								id:i['evidences'],
								name:'PubMed',
								url:'http://www.ncbi.nlm.nih.gov/pubmed/'+i['evidences'],
								alternativeUrl:'http://europepmc.org/abstract/MED/'+i['evidences']
						  });
                                                }
					});
					__ptm[1].push(
						__d
					);
					n++;
				}
			}else{
				var __d = {
					begin:i['start'],
					end:i['end'],
					description:i['type'],
					internalId:'dbptm_'+n,
					type:'MOD_RES',
					evidences:{
						'ECO:0000269':[]
					}
				};
				var __evs = __d['evidences']['ECO:0000269'];
				var pubmed_ids = i['evidences'].split(";");
				pubmed_ids.forEach(function(ii){
					var __ids =  jQuery.grep(__evs,function(e){ return ( ii == e['id'] ); });
					if(__ids.length == 0) __d['evidences']['ECO:0000269'].push({
							id:i['evidences'],
							name:'PubMed',
							url:'http://www.ncbi.nlm.nih.gov/pubmed/'+i['evidences'],
							alternativeUrl:'http://europepmc.org/abstract/MED/'+i['evidences']
					});
				});
				__ptm[1].push(
					__d
				);
				n++;
			}
		});
		if(__ptm_flag)d.push( __ptm );
	}
};

module.exports = add_dbptm;

