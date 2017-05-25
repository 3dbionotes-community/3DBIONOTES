"use strict";

var rebuild_ptm = function(d){
	var __ptm = ["",[]];
	d.forEach(function(i){
			if(i[0]=="PTM"){
				__ptm = i;
			}

	});
	__ptm[1].forEach(function(i){
		var i_t = i['description'].toLowerCase();

		if( i_t.indexOf("methyl")>-1 ){
			i['type'] = 'MOD_RES_MET';

		}else if( i_t.indexOf("acetyl")>-1 ){
			i['type'] = 'MOD_RES_ACE';

		}else if( i_t.indexOf("crotonyl")>-1 ){
			i['type'] = 'MOD_RES_CRO';

		}else if( i_t.indexOf("citrul")>-1 ){
			i['type'] = 'MOD_RES_CIT';

		}else if( i_t.indexOf("phospho")>-1 ){
			i['type'] = 'MOD_RES_PHO';

		}else if( i_t.indexOf("ubiq")>-1 ){
			i['type'] = 'MOD_RES_UBI';

		}else if( i_t.indexOf("sumo")>-1 ){
			i['type'] = 'MOD_RES_SUM';
		}else if( i_t.indexOf("glcnac")>-1 ){
			i['type'] = 'CARBOHYD';
		}
	});
};

module.exports = rebuild_ptm;

