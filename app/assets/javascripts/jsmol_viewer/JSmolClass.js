function JSmolClass( __args ) {
		
	this.start = function( args ){
		this.__id = args['viewer_id'];
		this.__init_script = args['init_script'];
		this.__init_script_args = args['init_script_args'];
		this.__file;
		this.__frames = [ ];
		this.__surface;
		this.__flag = false;	//Balls and sticks are drawn
		this.__flag_b = false;	//Sphere is drawn
		this.__flag_c = false;	//Sphere visibility
		this.__flag_d = false;	//Neighbours visibility
		this.__selection = "";
		this.__maxVolSize = "";
		this.__default_color = "\"#B9B9C9\"";//"GREY";
		this.__select_color = "\"#FFE999\"";//"\"#FFFF00\"";//
		this.__sphere_color = "\"#FFE999\"";//"\"#FFFF00\"";//
		this.__neighbour_ch_color = "\"#F0F0F0\"";//"\"#FFFF00\"";//
		var __script = "COLOR background '#FFFFFF';DISPLAY ALL;SET PLATFORMSPEED 5;";//set diffusePercent 100;set ambientPercent 0;set specularPercent 100;set specularPower 100;";
		if( this.__file ) __script += this.__load_file( this.__file );
		if( this.__surface ) __script += this.__load_surface( this.__surface['file'], this.__surface['threshold'] );
		if( this[ this.__init_script ] ){
			__script += this[ this.__init_script ](this.__init_script_args,1);
		}else{
		//	__script += this.__init_script;
		}
		this.__run_script(__script);
	};

	this.resize = function( new_size ){
		Jmol.resizeApplet(bionotes_jsmol, [ new_size['width']-20, new_size['height']-20 ]);
	};

	this.color_by_chain = function( CH_list, non_exec ){
		var __script = "DISPLAY ALL;SELECT ALL;COLOR "+this.__default_color+";CARTOON ONLY;";
		CH_list.each(function(ch){
			__script += "SELECT *:"+ch['name']+";COLOR '"+ch['color']+"';";
		});
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};

	this.display_message = function(message,non_exec){
		var __script = "hide all;set echo off; set echo loading 50% 50%; set echo loading center; font echo 22 sanserif;color echo black;echo "+message+";refresh;";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};

	this.color_by_chain_simple = function( list, pdb, chain, non_exec ){
		this.delete_more_atoms();
		this.__flag_d = false;
		var __frame = this.__frames.indexOf( pdb.toUpperCase() )+1;
		var __script = "DISPLAY ALL;SELECT ALL;COLOR "+this.__default_color+";BACKBONE ONLY;SELECT *:'"+chain+"'/"+__frame+";COLOR "+this.__default_color+";CARTOON ONLY;SELECT NUCLEIC;COLOR ORANGE;";
		this.__run_script(__script,this.__id);
		/*list.forEach(function(ch){
			__script += "SELECT "+ch+":"+chain+"/"+__frame+";COLOR lime;";
		});*/
                __script += "SELECT "+list[0]+"-"+list[list.length-1]+":'"+chain+"'/"+__frame+";COLOR "+this.__select_color+";CENTER SELECTED;";
		this.__selection = list[0]+"-"+list[list.length-1]+":'"+chain+"'/"+__frame; 
		if(this.__maxVolSize!="") __script+= "set rotationRadius "+this.__maxVolSize+";"
		/*__script += "select within(10,selected) and not selected and not hetero;cartoon;color yellow;";*/
		__script += "select hetero;color cpk; wireframe only; wireframe 0.15; spacefill 23%;";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};

	this.load_more_atoms = function(pdb,chain,non_exec){
		if(this.__flag==false){
			var __mySelection = this.__selection.split("'/")[0];
			var __myStart = __mySelection.split("-")[0];
			var __myEnd = __mySelection.split("-")[1].split(":'")[0];
			var __frame = this.__frames.length+1;
			var __script = "LOAD APPEND ASYNC http://cantor.cnb.csic.es/cgi-bin/PDB/extract_pdb.cgi?pdb="+pdb+"&file_type=.cif&chain="+chain+"&start="+__myStart+"&end="+__myEnd+";SELECT */"+__frame+";COLOR bonds "+this.__select_color+";FRAME *;";//dots VANDERWAALS;
			if(non_exec) return __script;
			this.__run_script(__script,this.__id);
			this.__flag = true;
		}else{
			var __script = "FRAME LAST;ZAP VISIBLE;FRAME*;";
			this.__flag = false;
			Jmol.script( eval(this.__id), __script );
		}
	}

	this.draw_sphere = function( radius, non_exec ){
		if(this.__flag_b==false){
			var __r = 3*radius;
			if(radius == 1) __r = 4;
			if(radius == 2) __r = 5;
			if(radius == 3) __r = 6;
			if(radius == 4) __r = 7;
			var __script = "isosurface sphere1 center {"+this.__selection+"} sphere "+__r+" translucent "+this.__sphere_color+";";
			this.__flag_b = true;
			this.__flag_c = true;
			Jmol.script( eval(this.__id), __script );
		}
	}

	this.delete_sphere = function( non_exec ){
		if(this.__flag_b==true){
			var __script = "isosurface sphere1 DELETE;";
			this.__flag_b = false;
			this.__flag_c = false;
			Jmol.script( eval(this.__id), __script );
		}
	}
	
	this.change_sphere_visibility = function(non_exec){
		var __script = "isosurface sphere1 ";
		if(this.__flag_b==true && this.__flag_c == true){
			__script += "OFF;";
			this.__flag_c = false;
		}else if( this.__flag_b==true && this.__flag_c == false ){
			__script += "ON;";
			this.__flag_c = true;
		}
		Jmol.script( eval(this.__id), __script );
	}

	this.delete_more_atoms = function(non_exec){
		if(this.__flag_b==true){
			this.delete_sphere();
		}
		if(this.__flag == true){
			//var __script = "FRAME LAST;DELETE VISIBLE;FRAME*;";
			var __script = "FRAME LAST;ZAP VISIBLE;FRAME*;";
			this.__flag = false;
			this.__flag_d = false;
			Jmol.script( eval(this.__id), __script );
		}
	}

	this.hide_hetero = function(non_exec){
		var __script = "hide hetero;"
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.show_hetero = function(non_exec){
		var __script = "display all;"
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}
	
	this.show_volume = function(non_exec){
		var __script = "isosurface emdb on;"
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}
	
	this.hide_volume = function(non_exec){
		var __script = "isosurface emdb off;"
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.highlight_neightbours = function(non_exec){
		//this.delete_more_atoms();
		var __script = "";
		var __mySelection = this.__selection.split("'/")[0];
		var __myModel = this.__selection.split("'/")[1];
		var __myChain = __mySelection.split("-")[1].split(":'")[1];
		if(this.__selection!="" && this.__flag_d == false){
			this.__flag_d = true;
			__script+= "SELECT "+this.__selection+"; select within(10,selected) and *:"+__myChain+"/"+__myModel+" and not selected and not hetero and not nucleic;cartoon;color lime;";
			//__script+= "SELECT "+this.__selection+"; y=script(\"select within(10,selected) and not *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;show chain;\").trim().lines;for(var i in y) { select chain=@i;color \"#EEEEEE\";cartoon only; }";
			__script+= "SELECT "+this.__selection+"; select within(10,selected) and not *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;"+';b = {SELECTED}.getProperty("[select chain,model");K={};for(var i in b){ K["*:"+i["chain"]+"/"+i["model"]]=1 };for(var i in K.keys){select @i;color '+this.__neighbour_ch_color+';cartoon only;}';
			__script+= "SELECT "+this.__selection+"; select within(10,selected) and not *:"+__myChain+"/"+__myModel+" and not selected and not hetero and not nucleic; color \"#00FFFF\";";
		}else if(this.__selection!="" && this.__flag_d == true){
			this.__flag_d = false;
			__script+= "SELECT "+this.__selection+"; select within(10,selected) and not selected and *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;cartoon only;color "+this.__default_color+";";
			__script+= "SELECT "+this.__selection+"; select not *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;backbone only;color "+this.__default_color+";";
		}
		if(this.__flag == true){
			var __frame = this.__frames.length+1;
			 __script += "select */"+__frame+";color cpk; wireframe only; wireframe 0.15; spacefill 23%;";
		}
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.clear_neightbours = function(non_exec){
		var __script = "";
		var __mySelection = this.__selection.split("'/")[0];
		var __myModel = this.__selection.split("'/")[1];
		var __myChain = __mySelection.split("-")[1].split(":'")[1];
		this.__flag_d = false;
		__script+= "SELECT "+this.__selection+"; select not selected and *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;cartoon only;color "+this.__default_color+";";
		__script+= "SELECT "+this.__selection+"; select not *:"+__myChain+"/"+__myModel+" and not hetero and not nucleic;backbone only;color "+this.__default_color+";";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.highlight_chain = function( pdb, chain, non_exec ){
		this.delete_more_atoms();
		this.__flag_d = false;
		this.selection="";
		var __frame = this.__frames.indexOf(pdb.toUpperCase())+1;
		var __script = "DISPLAY ALL;SELECT ALL;CENTER SELECTED;COLOR "+this.__default_color+";BACKBONE ONLY;SELECT NUCLEIC;COLOR ORANGE;";
		if(this.__maxVolSize!="") __script+= "set rotationRadius "+this.__maxVolSize+";"
		__script += "SELECT *:'"+chain+"'/"+__frame+";CARTOON ONLY;";
		__script +="select hetero;color cpk; wireframe only; wireframe 0.15; spacefill 23%;";
		/*CH_list.each(function(ch){
			__script += "SELECT *:"+ch['name']+";COLOR '"+ch['color']+"';";
		});*/
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};
	
	this.color_chain_by_region = function( REGION_list, non_exec ){
		var __script = "DISPLAY ALL;SELECT ALL;COLOR "+this.__default_color+";CARTOON ONLY;";
		REGION_list.each(function(reg){
			__script += "SELECT "+reg['start']+"-"+reg['end']+":"+reg['chain']+";COLOR '"+reg['color']+"';";
		});
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};

	this.highlight_residues = function( RES_list, non_exec ){
		//var __window = [];
		var __script = "DISPLAY ALL;SELECT ALL;COLOR "+this.__default_color+";CARTOON ONLY;";
		Ext.Array.each(RES_list,function(res){
			var chain = res['chain'];
			var res_id = res['id'];
			__script += "SELECT  "+res_id+":'"+chain+"';";
			__script += "COLOR '"+res['color']+"';";
			__script += "wireframe 0.15; spacefill 23%;";
			//__script += "ribcolor "+res['color']+" "+model+":"+res_i+"."+chain+";";
		});
		//__script += "window "+__window.join(' & ')+";"
		if(non_exec) return __script;
		//console.log( __script );
		this.__run_script( __script );
	};
	
	this.display_chains = function( non_exec ){
		var __script = "DISPLAY ALL;";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	};

	this.reset_view = function( non_exec ){
		this.delete_more_atoms();
		this.__flag_d = false;
		var __script = "display all;FRAME *;SELECT *;CENTER SELECTED;BACKBONE ONLY; COLOR "+this.__default_color+"; SELECT NUCLEIC; COLOR ORANGE;select hetero;color cpk; wireframe only; wireframe 0.15; spacefill 23%;isosurface emdb on;zoom 0;";
		if(this.__maxVolSize!="") __script+= "set rotationRadius "+this.__maxVolSize+";"
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
		this.selection="";
	};

	this.zoom_in = function( non_exec ){
		//var __script = "zoom IN";
		var __script = "x=getProperty(\"orientationInfo.zoom\")*1.25;zoom @x;";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.zoom_out = function( non_exec ){
		//var __script = "zoom OUT";
		var __script = "x=getProperty(\"orientationInfo.zoom\")/1.25;zoom @x;";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}
	
	this.clear_selected = function ( non_exec ){
		this.delete_more_atoms();
		this.clear_neightbours();
		var __script = " SELECT "+this.__selection+";COLOR "+this.__default_color+";";
		this.__selection = "";
		if(non_exec) return __script;
		this.__run_script(__script,this.__id);
	}

	this.load_surface = function( emd, threshold, maxVolSize, non_exec){
		this.display_message("LOADING VOLUME "+emd+", PLEASE WAIT ...");
		var url = "http://cantor.cnb.csic.es/EMDB/structures/";
		var parsEMD = emd.split("-")[1];
		this.__maxVolSize = maxVolSize;
		var __script = "isosurface emdb off;refresh;isosurface emdb cutoff " + threshold + " color [100,100,100] FILE " + url +"emd_"+ parsEMD + ".mrc FRONTONLY TRANSLUCENT 0.8;set echo off;set rotationRadius "+this.__maxVolSize+";display all;"
		//var __script = "isosurface cutoff 2.5 color [100,100,100] FILE " + url +"emd_"+ parsEMD + ".mrc DOTS NOFILL FRONTONLY;"
		//var __script = "isosurface cutoff 2.5 color [0,0,0] contour FILE " + url +"emd_"+ parsEMD + ".mrc NOFILL FRONTONLY TRANSLUCENT 0.5;"
		if(non_exec) return __script;
		//console.log(__script);
		this.__run_script(__script,this.__id);
	}

	this.open_url = function( pdb, append_flag, chain, non_exec){
                /*var url = "http://dimero-dev.cnb.csic.es/cgi-bin/DIMERO/Extensions/pdb/pdb_handler.py/handler?command=extract_pdb&pdb=";*/
		if (pdb==undefined){
			if(!append_flag){
				__script = "set echo off; set echo loading 50% 50%; set echo loading center; font echo 22 sanserif;color echo black;echo PDB not found;refresh;";
				this.__run_script( __script );
			}
		}else{
			//__script = ";";
			//this.__run_script( __script );
			var url = "http://cantor.cnb.csic.es/cgi-bin/PDB/extract_pdb.cgi?pdb=";
			var __append_flag="";
			if(append_flag)__append_flag = "APPEND";
			if(chain){
				this.display_message("LOADING PDB "+pdb+" CHAIN "+chain+", PLEASE WAIT ...");
				var __script = "load "+__append_flag+" '"+url+pdb+"&chain="+chain+"&file_type=.cif';";
			}else{
				this.display_message("LOADING PDB "+pdb+", PLEASE WAIT ...");
				var __script = "load "+__append_flag+" '"+url+pdb+"&file_type=.cif';";
			}
			if(append_flag){
				this.__frames.push(pdb.toUpperCase());
				__script += "FRAME *;SELECT *;BACKBONE ONLY;COLOR "+this.__default_color+";SELECT NUCLEIC;COLOR ORANGE;select hetero;color cpk; wireframe only; wireframe 0.15; spacefill 23%;hide all;refresh;";
			}else{
				this.__frames = [];
				this.__frames.push(pdb.toUpperCase());
				__script += "SELECT NUCLEIC;COLOR ORANGE;select hetero;color cpk; wireframe only; wireframe 0.15; spacefill 23%;hide all;refresh;";
			}
			if(non_exec) return __script;
			this.__run_script( __script );
		}
	};

	this.write_image = function( non_exec ){
		//var __script = "WRITE IMAGE 1500 1500 GIFT \"3dbionotes.gif\"";
		var __script = "WRITE IMAGE GIFT \"3dbionotes.gif\"";
		if(non_exec) return __script;
		this.__run_script( __script );
	}
	
	this.__load_file = function( www_file ){
		var __script = "load "+www_file+";";
		return __script;
	};
	
	/*this.__load_surface = function( file, threshold ){
		var __script = "isosurface cutoff "+threshold+" color [200,200,200] FILE \""+file+"\" mesh nofill;";
		console.log( __script );
		return __script;
	};*/

	this.__run_script = function(script){
                //console.log(script);
		Jmol.script( eval(this.__id), script );
	};
}
