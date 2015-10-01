function chimeraClass( __args ) {

	//this.start = function( args ){
		//var this.__frames = [];
		//var __this = this;
		/*Ext.Ajax.request({
			url: '/DIMERO/USERS/'+DIMERO.app.globals.user_id+'/structure/chimera_alignment.json',
			method:'GET',
			success: function(response){
				DIMERO.app.globals.alignment = Ext.JSON.decode(response.responseText);
				__this.__success_start( args );
			},   
			failure: function(e){ 	
				console.log('Connection Error');
				console.log(e);
			}
		});*/
	//};

	this.start = function( args ){
		this.__init_script = args['init_script'];
		this.__init_script_args = args['init_script_args'];
		this.__frames = [];
		var __script = "background solid #FFFFFF;~display #*;";
		/*if( this[ this.__init_script ] ){
			__script += this[ this.__init_script ](this.__init_script_args,1);
		}else{
			__script += this.__init_script;
		}*/
		this.__run_script( __script );
	};

	this.color_by_chain = function( CH_list, non_exec ){
		var __script = "~display #*;ribbon #*;~ribinsidecolor #*;ribcolor grey #*;";
		Ext.Array.each(CH_list,function(ch){
			var models = DIMERO.app.globals.alignment[ ch['name'] ]['regions']
			models.forEach(function(m){
				m['chains'].forEach(function(__ch){
					__script += "ribcolor "+ch['color']+" "+m['model_id']+":*."+__ch+";";
				});
			});
		});
		if(non_exec) return __script;
		this.__run_script( __script );
	};

	this.highlight_chain = function( pdb, chain, non_exec){
		var __frame = this.__frames.indexOf(pdb);
		var __script = "~display #*;~ribbon #*;show @CA,P;color grey;color orange nucleic acid;ribbon #"+__frame+":*."+chain+";window #*;";
		if(non_exec) return __script;
		this.__run_script( __script );
	};
	
	this.color_chain_by_region = function( REGION_list, non_exec ){
		//var __window = [];
		var __script = "~display #*;ribbon #*;~ribinsidecolor #*;ribcolor grey #*;";
		console.log(REGION_list);
		 Ext.Array.each(REGION_list,function(reg){
			var __res_start = DIMERO.app.globals.alignment[reg['chain']]['residues'][reg['start']]
			var model_start = __res_start['model_id'];
			var chain_start = __res_start['chain_id'];
			var start = __res_start['res_id'];

			var __res_end = DIMERO.app.globals.alignment[reg['chain']]['residues'][reg['end']]
			var model_end = __res_end['model_id'];
			var chain_end = __res_end['chain_id'];
			var end = __res_end['res_id'];

			if( model_start == model_end && chain_start == chain_end ){
				//__window.push( model_start+":"+start+"-"+end+"."+chain_start )
				__script += "ribcolor "+reg['color']+" "+model_start+":"+start+"-"+end+"."+chain_start+";";
			}
		});
		//__script += "window "+__window.join(' & ')+";"
		if(non_exec) return __script;
		this.__run_script( __script );
	};

	this.highlight_residues = function( RES_list, non_exec ){
		//var __window = [];
		var __script = "~display #*;ribbon #*;~ribinsidecolor #*;ribcolor grey #*;";
		Ext.Array.each(RES_list,function(res){
			var __res = DIMERO.app.globals.alignment[res['chain']]['residues'][res['id']]
			var model = __res['model_id'];
			var chain = __res['chain_id'];
			var res_i = __res['res_id'];
			__script += "display "+model+":"+res_i+"."+chain+";";
			__script += "color "+res['color']+",a,b "+model+":"+res_i+"."+chain+";";
			__script += "ribcolor "+res['color']+" "+model+":"+res_i+"."+chain+";";
		});
		//__script += "window "+__window.join(' & ')+";"
		if(non_exec) return __script;
		this.__run_script( __script );
	};

	this.reset_view = function( non_exec ){
		var __script = "close #*;";
		if(non_exec) return __script;
		this.__run_script( __script );
	};
	
	this.display_chains = function( non_exec ){
		var __script = "DISPLAY ALL;";
		if(non_exec) return __script;
		this.__run_script( __script );
	};

	this.open_url = function( pdb, append_flag, chain, non_exec ){
		/*var url = "http://dimero-dev.cnb.csic.es/cgi-bin/DIMERO/Extensions/pdb/pdb_handler.py/handler?command=extract_pdb&pdb=";*/
		var url = "http://cantor.cnb.csic.es/cgi-bin/PDB/extract_pdb.cgi?viewer_type=chimera&pdb=";
		var __script;
		this.__frames.push(pdb);
		if(chain){
			__script = "open "+url+pdb+"&chain="+chain+"";
		}else{
			__script = "open "+url+pdb+"";
		}
		__script+="&file_type=.cif;";
		__script+="~ribbon #*;show @CA,P;color grey;color orange nucleic acid;window #*;";
		console.log(__script);
		if(non_exec) return __script;
		this.__run_script( __script );
	};

	this.resize = function(){
	};

	this.__run_script = function(script){
		console.log(script);
		$j.ajax({
			type: 'POST',
			url: '/run',
			dataType: 'json',
			data:{
				'command':script
			},
			success: function( result ){
				console.log('operation complete');
			},
			error: function(xhr, textStatus, error){
				console.log('server-side failure with status code ' + error);
				console.log('server-side failure with status code ' + xhr.responseText);
			}
		});
	}
}
