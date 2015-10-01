function bionotes_jsmol (){
	var Info = {
	  use: "HTML5",         // "HTML5" or "Java"
          disableJ2SLoadMonitor: true,
          diableInitialConsole: true,
          debug: false,
	  color: "#FFFFFF",
	  height: 375,
	  width: 375,
          coverCommand: null,
          coverImage: null,
          defaultModel: null,
          coverTitle: "Loading ... Please wait.",
          deferApplet: false,
          deferUncover: false,
	  j2sPath: "/jsmol/j2s",           // only used in the HTML5 modality
	  jarPath: "/jsmol/java",          // only used in the Java modality
	  jarFile: "JmolApplet0.jar",   // only used in the Java modality
	  isSigned: false,              // only used in the Java modality
	  memoryLimit: 512,             // only used in the Java modality
	  serverURL: "/jsmol/php/jsmol.php", // needed only for some features, but should 
	                              // be in your server for full functionality
	  //defaultModel: "localhost/DIMERO/USERS/000000000000/sara_purged_complex.pdb",
	  //script: 'load '+initial_model+';SELECT ALL;CARTOON ONLY;',
          //coverImage:"/images/loading.jpg",
	  src: null,
	  readyFunction: null,
	  addSelectionOptions: false,
          script: "set echo off; set echo loading 50% 50%; set echo loading center; font echo 18 sanserif;color echo black;echo LOADING, PLEASE WAIT ...;refresh;",
	  debug: false
	};	 
	Jmol.getApplet("bionotes_jsmol", Info);
	Jmol._alertNoBinary = false;
        
	/*$.ajax({
		url:initial_model,
		dataType: "json",
		success:function(data){
			fecth_button_data = data;
			var pdb_url = 'http://'+$(location).attr('hostname')+':'+$(location).attr('port')+data['pdb_url']
			//var __script = 'load INLINE "'+data.structure+'";SELECT ALL;CARTOON ONLY;';
			var __script = 'load "'+pdb_url+'";SELECT ALL;CARTOON ONLY;';
			__script += 'SELECT '+data.interacting_res[1].join(':'+data.ch_d+',')+':'+data.ch_d+';wireframe 0.3;COLOR RED;';
			__script += 'SELECT '+data.partner_interacting_res[1].join(':'+data.ch_p+',')+':'+data.ch_p+';wireframe 0.3;';
			if('dom_node_2' in data) __script += 'COLOR [0,255,0];';
			Jmol.script( dianaJmol , __script);

			window.top.diana_frame.load_alignment( data );

			var res = [];
			for( var r of window.top.diana_frame.sequence_panel.get_interacting_res_mv() ){
				res.push({
					'chain':window.top.diana_frame.dom_data.p_chain,
					'id':r,
					'color':'red'
				});
			}
			if('dom_node_2' in data){
				for( var r of window.top.diana_frame.sequence_panel_2.get_interacting_res_mv() ){
					res.push({
						'chain':window.top.diana_frame.dom_data_2.p_chain,
						'id':r,
						'color':'#00FF00'
					});
				}
			}

			window.top.DIMERO.app.globals.viewer.highlight_residues(res);
			$('.select_pdb').css('visibility','visible');
		},
		error:function(a,b,c){
			console.log(a);
			console.log(b);
			console.log(c);
			$('.select_pdb').css('visibility','visible');
		}

	});*/
	//var $win = window.top.Ext.getCmp('window:jmol_window');
	//var new_size = $win.getSize();
	//Jmol.resizeApplet(myJmol, [ new_size['width']-40, new_size['height']-60 ]);
}
