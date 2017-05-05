function bionotes_jsmol (){
	var Info = {
	  use: "HTML5",				// "WebGL" "HTML5" or "Java"
          disableJ2SLoadMonitor: true,
          disableInitialConsole: true,
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
	  j2sPath: "/jsmol/j2s",           	// only used in the HTML5 modality
	  serverURL: "/jsmol/php/jsmol.php", 	// needed only for some features, but should 
	                              		// be in your server for full functionality
	  //defaultModel: "<PATH>/default.pdb",
	  //script: 'load '+initial_model+';SELECT ALL;CARTOON ONLY;',
          //coverImage:"/images/loading.jpg",
	  src: null,
	  readyFunction:__init,
	  addSelectionOptions: false,
          script: "set echo off; set echo loading 50% 50%; set echo loading center; font echo 18 sanserif;color echo black;echo LOADING, PLEASE WAIT ...;refresh;"
	};	 
	Jmol.getApplet("bionotes_jsmol", Info);
	Jmol._alertNoBinary = false;
}

function __init(){
	setTimeout(function(){
		var __d = JSON.parse( window.top.$j('#alignment > option:nth-child(2)').val() );
		if( 'uniprot' in __d ){
			window.top.$j('#alignment > option:nth-child(2)').attr('selected', 'selected');
			window.top.$j('#alignment').trigger('change');
		}
	},1000);
}
