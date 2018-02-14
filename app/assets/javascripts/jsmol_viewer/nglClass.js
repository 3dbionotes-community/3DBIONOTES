var self;

function __init_local(i,v_c,v_t,local_flag){
	var __name = i.name.substring(0, 4).toLowerCase();
	if(local_flag)__name=i.name;
        self.model = 0;
	self.Structures[ __name ] = { obj:i, representations:{'selection':{},'keep_selection':{}} };
        if(Object.keys(top.no_aa_ch).length > 0){
          var no_aa = ":"+Object.keys(top.no_aa_ch).join(" or :")
          self.Structures[ __name ]['representations']['hetero'] = i.addRepresentation("ball+stick",{sele:"/0 and ( hetero or ("+no_aa+")  ) and not water and not (dna or rna) and ",visible:true});
        }else{
	  self.Structures[ __name ]['representations']['hetero'] = i.addRepresentation("ball+stick",{sele:"/0 and hetero and not water",visible:true});
        }
	self.Structures[ __name ]['representations']['nucleic'] = i.addRepresentation("trace",{sele:"/0 and dna or rna",visible:true,color:"orange"});
        self.Structures[ __name ]['representations']['cartoon']  = i.addRepresentation("cartoon",{visible:v_c,color:"#B9B9B9",sele:"/0 and protein"});
        self.Structures[ __name ]['representations']['trace'] = i.addRepresentation("cartoon",{visible:v_t,color:"#F3F3F3",sele:"/0 and protein", opacity:0.2});
        self.Structures[ __name ]['representations']['selection']['cartoon'] = i.addRepresentation("cartoon",{visible:false,sele:"/0 and protein",color:"#FFE999"});
	self.Structures[ __name ]['representations']['selection']['spacefill'] = i.addRepresentation("spacefill",{visible:false,sele:"/0 and protein",color:"#FFE999"});
	self.Structures[ __name ]['representations']['selection']['ball+stick'] = i.addRepresentation("ball+stick",{visible:false,sele:"/0 and protein",color:"#FFE999"});

	//self.Structures[ __name ]['representations']['keep_selection']['spacefill'] = i.addRepresentation("spacefill",{visible:false,sele:"/0 and protein",color:"#E9FF99"});
        self.Structures[ __name ]['representations']['keep_selection'] = [];

        self.stage.autoView();
}

function __init(i,v_c,v_t,local_flag){
	var __name = i.name.substring(0, 4).toLowerCase();
	if(local_flag)__name=i.name;
	self.Structures[ __name ] = { obj:i, representations:{'selection':{},'keep_selection':{}} };
	self.Structures[ __name ]['representations']['hetero'] = i.addRepresentation("ball+stick",{sele:"hetero and not water",visible:true});
	self.Structures[ __name ]['representations']['nucleic'] = i.addRepresentation("trace",{sele:"dna or rna",visible:true,color:"orange"});
        self.Structures[ __name ]['representations']['cartoon']  = i.addRepresentation("cartoon",{visible:v_c,color:"#B9B9B9",sele:"protein"});
        //self.Structures[ __name ]['representations']['assembly'] = i.addRepresentation("trace",{visible:v_t,color:"#B9B9B9",sele:"protein", opacity:0.3 ,assembly:'BU1'});
        self.Structures[ __name ]['representations']['trace'] = i.addRepresentation("cartoon",{visible:v_t,color:"#F3F3F3",sele:"protein", opacity:0.2});/*assembly:'BU1'*/
        self.Structures[ __name ]['representations']['selection']['cartoon'] = i.addRepresentation("cartoon",{visible:false,sele:"protein",color:"#FFE999"});
	self.Structures[ __name ]['representations']['selection']['spacefill'] = i.addRepresentation("spacefill",{visible:false,sele:"protein",color:"#FFE999"});
	self.Structures[ __name ]['representations']['selection']['ball+stick'] = i.addRepresentation("ball+stick",{visible:false,sele:"protein",color:"#FFE999"});

	//self.Structures[ __name ]['representations']['keep_selection']['spacefill'] = i.addRepresentation("spacefill",{visible:false,sele:"/0 and protein",color:"#E9FF99"});
        self.Structures[ __name ]['representations']['keep_selection'] = [];

        self.stage.autoView();
}

function initLocalStructure(i){
	__init_local(i,true,false,true);
	__trigger_alignment();
	__clear_message();
}

function initChain(i){
	__init(i,true,false);
	__clear_message();
}

function initStructure(i){
	__init(i,false,true);
	if( self.__load_ready ){
		__trigger_alignment();
		__clear_message();
	}
	
}

function initMap(i){
        self.Structures[ 'density' ] = { obj:i, surface:{} };
        //self.Structures[ 'density' ]['obj'].signals.representationAdded.add( function( representation ){ console.log(representation); } );
        if(self.pdb_flag){
          self.Structures[ 'density' ]['surface'] = i.addRepresentation( "surface", {
                opacity: 0.1,
                color:"#33ABF9",
                flatShaded:false,
                background:false,
                opaqueBack:false,
                depthWrite:true,
	  	isolevel:5
          });
        }else{
          self.Structures[ 'density' ]['surface'] = i.addRepresentation( "surface", {
                color:"#33ABF9",
                depthWrite:true,
	  	isolevel:5
          });
          i.autoView();
        }
        __clear_em_message();       
}

function __show_message(id){
	$j(".ngl_loading").css('display','block');
	$j(".ngl_loading").html("LOADING <b style=\"color:black;\">"+id+"</b>" );
}

function __clear_message(){
	$j(".ngl_loading").css('display','none');
	$j(".ngl_loading").empty();
}

function __show_em_message(id){
	$j(".ngl_em_loading").css('display','block');
	$j(".ngl_em_loading").html( "LOADING <b style=\"color:black;margin-right:10px;\">"+id+"</b><img src=\"/images/loading_em.gif\" />" );
}

function __clear_em_message(){
	$j(".ngl_em_loading").css('display','none');
	$j(".ngl_em_loading").empty();
}


function __trigger_alignment(){
	setTimeout(function(){
		var __d = JSON.parse( window.top.$j('#alignment > option:nth-child(2)').val() );
		if( 'uniprot' in __d ){
			window.top.$j('#alignment > option:nth-child(2)').prop('selected', true);
			window.top.$j('#alignment').trigger('change');
		}else{
                  console.log("No SIFT alignment available");
                }
	},1000);
}

function nglClass( args ) {
	self = this;
	self.stage = null;
	self.Structures = {};
	self.selected = {pdb:'',chain:'',residues:[]};
	self.args = args;
        self.model = -1;
	self.__load_ready = false;
        self.keep_selected = [];
        self.pdb_flag = false
	self.start = function(){
           	document.addEventListener( "DOMContentLoaded", function(){
                	self.stage = new NGL.Stage( "viewport" );
                        //self.stage.signals.componentAdded.add( function( component ){ console.log(component); } );
                        window.addEventListener( "resize", function( event ){
                          self.stage.handleResize();
                        }, false );
                	self.stage.setParameters( {backgroundColor: "white",quality: "low"} );
			var __n = 1;
			if(self.args.origin == "local"){
                                __show_message( "FILE" );
                                var ext = "pdb";
                                if( self.args.pdb_list[1].includes("cif") ){
                                  ext = "cif";
                                }
				self.stage.loadFile( "/upload/"+self.args.pdb_list[0]+"/"+self.args.pdb_list[1], {ext:ext} ).then( initLocalStructure ).catch( function(e){
                                  console.error(e);
                                  swal({
                                    title: "ERROR LOADING "+self.args.pdb_list[1]+" FILE",
                                    text: "FILE FORMAT ERROR",
                                    timer: 5000,
                                    type: "error",
                                    showConfirmButton: true
                                  });
                                });
			}else{
				self.args.pdb_list.forEach(function(pdb_code){
                                        self.pdb_flag = true;
					if( __n == self.args.pdb_list.length ) self.__load_ready = true;
                                        __show_message( pdb_code.toUpperCase() );
                                        
                                        //var url_file = "http://mmtf.rcsb.org/v1.0/full/"+pdb_code.toUpperCase();
                                        //var url_file = "rcsb://"+pdb_code.toUpperCase()+".mmtf";
                                        var url_file = location.protocol+"//mmtf.rcsb.org/v1.0/full/"+pdb_code.toUpperCase();
                                        console.log( "LOADING "+url_file );

                                        self.stage.loadFile(  url_file, {ext:"mmtf", firstModelOnly:true} ).then( initStructure ).catch( function(e){
                                          console.error(e);
                                          var url_file = "rcsb://"+pdb_code.toUpperCase()+".cif";
                                          console.log( "LOADING "+url_file );
                                          self.stage.loadFile(  url_file, {ext:"cif", firstModelOnly:true} ).then( initStructure );
                                        });
                                        
					__n++;
				});
			}
			if( self.args.emdb ){
				var __emdb = self.args.emdb.replace("EMD-", "emd_");
                                __show_em_message( self.args.emdb );
                                var __map = location.protocol+"//www.ebi.ac.uk/pdbe/static/files/em/maps/"+__emdb+".map.gz"
				self.stage.loadFile( __map, {useWorker: true} ).then( initMap );
			}
                	self.stage.viewer.container.addEventListener( "dblclick", function(){
                    		self.stage.toggleFullscreen();
                	});
			if(self.args.pdb_list.length == 0)__trigger_alignment();

                        self.stage.signals.clicked.add( function( pickingProxy ){
                          if( pickingProxy && pickingProxy.atom && pickingProxy.shiftKey ){
                              var atom = pickingProxy.atom;
                              var cp = pickingProxy.canvasPosition;
                              var pdb = top.global_infoAlignment.pdb;
                              var chain = top.global_infoAlignment.chain;
                              var uniprot = top.global_infoAlignment.uniprot;
                              var seq_index = top.$ALIGNMENTS[pdb][chain][uniprot]["inverse"][atom.resno]
                              if(atom.chainname != chain){
                                swal({
                                  title: "UNKNOWN RESIDUE",
                                  text: "THE RESIDUE IS NOT LOCATED IN THE CURRENT CHAIN",
                                  timer: 5000,
                                  type: "error",
                                  showConfirmButton: true
                                });
                                console.log( atom );
                                console.log( "atom.chainid = "+atom.chainid );
                                console.log( "top.global_infoAlignment.chain = "+top.global_infoAlignment.chain );
                                return;
                              }
                              if(seq_index){
                                var selection = {begin:seq_index, end:seq_index, frame:"null"};
                                trigger_aa_selection(selection);
                              }else{
                                swal({
                                  title: "SELECTION ERROR",
                                  text: "SEQUENCE ALIGNMENT OUT OF RANGE",
                                  timer: 5000,
                                  type: "error",
                                  showConfirmButton: true
                                });
                              }
                          }else if( pickingProxy && pickingProxy.shiftKey ){
                              console.log("No residue selected");
                          }
                        });
            	});
	};

        self.multiple_highlight = function(pdb,  chain, list){
          var selection = {};
          var color;
          list.forEach(function(i){
              color = i.color;
              var pdbPosList = top.getRangesFromTranslation(i.begin, i.end, top.alignmentTranslation);
              pdbPosList.forEach(function(j){
                selection[j]=true;
              });
          });
          selection = Object.keys(selection);
          self.selected.residues = selection;
          if(selection.length == 0) return;

          var model_flag = '';
          if(self.model>=0) model_flag = 'and /'+self.model.toString()+' ';

          self.Structures[ pdb ]['representations']['cartoon'].setSelection( "protein "+model_flag+"and :"+chain );

	  self.Structures[ pdb ]['representations']['selection']['cartoon'].setSelection( "" );
	  self.Structures[ pdb ]['representations']['selection']['spacefill'].setSelection( "protein "+model_flag+"and :"+chain+" and ("+selection.join(" or ")+")" );
	  self.Structures[ pdb ]['representations']['selection']['ball+stick'].setSelection( "" );

          self.Structures[ pdb ]['representations']['selection']['spacefill'].setColor(color);

	  self.Structures[ pdb ]['representations']['selection']['cartoon'].setVisibility(false);
	  self.Structures[ pdb ]['representations']['selection']['ball+stick'].setVisibility(false);
	  self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(true);

        };

	self.resize = function( new_size ){
	};

	self.color_by_chain = function( CH_list, non_exec ){
	};

	self.display_message = function(message,non_exec){
	};

        self.keep_selection = function(){
		var pdb = self.selected.pdb;
		var chain =  self.selected.chain;
		var list = self.selected.residues;

		if(!pdb in self.Structures) return;
                if(!list || list.length == 0){ 
                  swal({
                    title: "UNKNOWN RESIDUES",
                    text: "STRUTURE RESIDUES OUT OF RANGE",
                    timer: 5000,
                    type: "error",
                    showConfirmButton: true
                  });
                  return;
                }

                var frame = top.document.getElementById("upRightBottomFrame").contentWindow.document;
                var instance = top.document.getElementById("upRightBottomFrame").contentWindow.instance;
                var frame_window = top.document.getElementById("upRightBottomFrame").contentWindow;
                
                var color;
                if( frame.getElementsByName( instance.selectedFeature.internalId ).lentgh>0 ){
                  color = frame.getElementsByName( instance.selectedFeature.internalId )[0].style.fill;
                }else{
                  color = frame_window.$j("[name="+instance.selectedFeature.internalId+"]").css("fill");
                }

                var label_selection = "( :"+chain+" and "+list[ parseInt(list.length/2) ]+" and .CA )";
                var description;
                if(instance.selectedFeature.description && instance.selectedFeature.description.length > 15){
                  description = instance.selectedFeature.type;//+". "+instance.selectedFeature.description.split("<br")[0];
                }else{
                  description = instance.selectedFeature.type;
                }
                description = description.replace("<b>","");
                description = description.replace("</b>","");
                description = description.replace("<b style=\"color:grey;\">","");
                if( description.length > 25 ) description = description.substring(0,25)
                var label_text = description+" "+instance.selectedFeature.begin+"-"+instance.selectedFeature.end+":"+chain;
                if(instance.selectedFeature.begin==instance.selectedFeature.end){
                  label_text = description+" "+instance.selectedFeature.begin+":"+chain;
                }

                var selection = "( :"+chain+" and ("+list.join(" or ")+"))";
                var id_ = instance.selectedFeature.internalId;
                if (id_ == "fake_0"){
                  id_=id_+"_"+Math.floor(Math.random()*9999)+ 1;
                  color = "#FFE999";
                }
                var label_obj = { id:id_,
                                  selection:selection,
                                  color:color, 
                                  label_selection:label_selection, 
                                  label_text:label_text, 
                                  label_visible:true, 
                                  text_visible:true }
                var result = $j.grep( self.keep_selected, function(e){ return e.id == id_; });
                if( result.length == 0 ){
                  self.keep_selected.push(label_obj);
                  add_to_label_display(label_obj);
                }
                self.__keep_selection();
        }
        self.__keep_selection = function(){
        	var pdb = self.selected.pdb;        
                if( self.keep_selected.length==0 )return;
                self.Structures[ pdb ]['representations']['keep_selection'].forEach(function(i){
                  i.spacefill.setVisibility(false);
                  i.label.setVisibility(false);
                  self.Structures[ pdb ]['obj'].removeRepresentation(i.spacefill);
                  self.Structures[ pdb ]['obj'].removeRepresentation(i.label);
                });
                self.Structures[ pdb ]['representations']['keep_selection']=[];
                self.keep_selected.forEach(function(i){
                  var model_flag = '';
                  if(self.model>=0) model_flag = 'and /'+self.model.toString()+' ';
                  var selection = "protein "+model_flag+'and '+i.selection;
                  var label_selection = "protein "+model_flag+'and '+i.label_selection;
                  var color = i.color;
                  var representation = self.Structures[ pdb ]['obj'].addRepresentation("spacefill",{visible:i.label_visible,sele:selection,color:color});

                  //label
                  var selectionObject = new NGL.Selection( label_selection );
                  var labelText = {};
                  var pdb_component = self.stage.getComponentsByName(pdb);
                  if( pdb_component.list.length == 0 ) pdb_component = self.stage.getComponentsByName( pdb.toUpperCase() );
                  if( pdb_component.list.length == 0 ) pdb_component = self.stage.getComponentsByName( pdb.toLowerCase()+"_final.pdb" );
                  if( pdb_component.list.length == 0 ) {
                    console.log("getComponentsByName failed -  args => "+pdb);
                    return;
                  }
                  pdb_component.list[0].structure.eachAtom(function(atomProxy) {
                    labelText[atomProxy.index] = i.label_text;
                  }, selectionObject);

                  var label = self.Structures[ pdb ]['obj'].addRepresentation("label",{
                                                                                        visible:i.text_visible,
                                                                                        showBackground:true,
                                                                                        labelType:'text',
                                                                                        labelText:labelText,
                                                                                        fontFamily:"monospace",
                                                                                        fontWeight:"bold",
                                                                                        scale:2,
                                                                                        sdf:true,
                                                                                        showBackground:true,
                                                                                        backgroundColor:"#FFFFFF",
                                                                                        backgroundMargin:2.5,
                                                                                        backgroundOpacity:0.5,
                                                                                        showBorder:true,
                                                                                        borderWidth:0.1,
                                                                                        borderColor:"#000000",
                                                                                        zOffset:25,
                                                                                        color:color,
                                                                                        sele:label_selection});
                  self.Structures[ pdb ]['representations']['keep_selection'].push({spacefill:representation,label:label});
                });
        }
        self.remove_selection = function( index ){
        	var pdb = self.selected.pdb;        
                var i = self.Structures[ pdb ]['representations']['keep_selection'][index];
                i.spacefill.setVisibility(false);
                i.label.setVisibility(false);
                self.Structures[ pdb ]['obj'].removeRepresentation(i.spacefill);
                self.Structures[ pdb ]['obj'].removeRepresentation(i.label);
                self.Structures[ pdb ]['representations']['keep_selection'].splice(index,1);
                self.keep_selected.splice(index,1);
                self.__keep_selection();
        }

        self.play = function(){
          var x = self.model;
          var intervalID = setInterval(function () {
            self.change_model(1);
            if (++x === 2*self.args.n_models) {
              window.clearInterval(intervalID);
            }
          }, 100);
        }

	self.change_model = function(flag){
                var aux = self.model+flag;
                if(aux<0) {
                  aux = self.args.n_models-1;
                }
                if(aux == self.args.n_models){
                  aux = 0;
                }
                if( aux >=0 && aux < self.args.n_models){
		  self.model = aux;
                  self.highlight_chain( self.selected.pdb, self.selected.chain );
                  self.__keep_selection();
                  var evt = document.createEvent("CustomEvent");
                  evt.initCustomEvent("modelChange",true,true,[aux+1]);
                  window.top.document.dispatchEvent(evt);
                  top.document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evt);
                }else{
                  self.__keep_selection();
                }
	}

	self.color_by_chain_simple = function( list, __pdb, chain, __color, non_exec ){
		var pdb = __pdb.toLowerCase();
                var color = "#FFE999";
                if(__color)  color = __color;

		if(list.length < 1){
			self.reset_view();
			return;
		}
		if(!pdb in self.Structures) return;

		self.selected.pdb = pdb;
		self.selected.chain = chain;
		self.selected.residues = list;

                var model_flag = '';
                if(self.model>=0) model_flag = 'and /'+self.model.toString()+' '; 

                var shft = 1;
                var L = list.slice(shft,list.length-shft);
		if(L.length >0){ 
                  self.Structures[ pdb ]['representations']['cartoon'].setSelection( "protein "+model_flag+"and :"+chain+" and not ("+L.join(" or ")+")" );
                }else{
                  self.Structures[ pdb ]['representations']['cartoon'].setSelection( "protein "+model_flag+"and :"+chain );
                }
		self.Structures[ pdb ]['representations']['selection']['cartoon'].setSelection( "protein "+model_flag+"and :"+chain+" and ("+list.join(" or ")+")" );
		self.Structures[ pdb ]['representations']['selection']['spacefill'].setSelection( "protein "+model_flag+"and :"+chain+" and ("+list.join(" or ")+")" );
		self.Structures[ pdb ]['representations']['selection']['ball+stick'].setSelection( "protein "+model_flag+"and :"+chain+" and ("+list.join(" or ")+")" );

                self.Structures[ pdb ]['representations']['selection']['cartoon'].setColor(color);
		self.Structures[ pdb ]['representations']['selection']['spacefill'].setColor(color);
		self.Structures[ pdb ]['representations']['selection']['ball+stick'].setColor(color);

		if(list.length>3){
			self.Structures[ pdb ]['representations']['selection']['cartoon'].setVisibility(true);
			self.Structures[ pdb ]['representations']['selection']['ball+stick'].setVisibility(false);
		}else{
			self.Structures[ pdb ]['representations']['selection']['ball+stick'].setVisibility(true);
		}

		if(list.length<13){
			self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(true);
		}else{
 			self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(false);
		}
	};

	self.load_more_atoms = function(pdb,chain,non_exec){
		if(!self.selected.pdb) return;
		if( self.Structures[ pdb ]['representations']['selection']['spacefill'].visible ){	
			self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(false);
		}else{
			self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(true);
		}
	}

	self.draw_sphere = function( radius, non_exec ){
	}

	self.delete_sphere = function( non_exec ){

	}
	
	self.change_sphere_visibility = function(non_exec){

	}

	self.delete_more_atoms = function(non_exec){

	}

	self.hide_hetero = function(non_exec){
		self.show_hetero();
	}

	self.show_hetero = function(non_exec){
		for(__name in self.Structures){
			if( self.Structures[ __name ]['representations'] ){
				if( self.Structures[ __name ]['representations']['hetero'].visible ){
					self.Structures[ __name ]['representations']['hetero'].setVisibility(false);
					self.Structures[ __name ]['representations']['nucleic'].setVisibility(false);
				}else{
					self.Structures[ __name ]['representations']['hetero'].setVisibility(true);
					self.Structures[ __name ]['representations']['nucleic'].setVisibility(true);
				}
			}
		}

	}
	
	self.show_volume = function(non_exec){
		self.Structures[ 'density' ]['surface'].setVisibility(true);
	}
	
	self.hide_volume = function(non_exec){
		self.Structures[ 'density' ]['surface'].setVisibility(false);
	}

	self.highlight_neightbours = function(non_exec){

	}

	self.clear_neightbours = function(non_exec){

	};

	self.highlight_chain = function( pdb, chain, non_exec){
                if(!self.Structures[pdb]) return;
                if(self.selected.residues.length > 0){
		  for (type in self.Structures[ self.selected.pdb ]['representations']['selection']){
		    self.Structures[ self.selected.pdb ]['representations']['selection'][type].setVisibility(false);
		  }
                }
                var model_flag = '';
                if(self.model>=0) model_flag = 'and /'+self.model.toString()+' '; 
		for(__pdb in self.Structures){
			if(__pdb != self.selected.pdb && __pdb != 'density'){
				self.Structures[ __pdb ]['representations']['trace'].setVisibility(true);
				self.Structures[ __pdb ]['representations']['cartoon'].setVisibility(false);
			}
		}
		self.Structures[ pdb ]['representations']['trace'].setSelection("protein "+model_flag+"and not :"+chain);
		self.Structures[ pdb ]['representations']['cartoon'].setSelection("protein "+model_flag+"and :"+chain);
		self.Structures[ pdb ]['representations']['cartoon'].setVisibility(true);

		self.selected.pdb = pdb;
		self.selected.chain = chain;
		self.selected.residues = [];
	};
	
	self.color_chain_by_region = function( REGION_list, non_exec ){

	};

	self.highlight_residues = function( RES_list, non_exec ){

	};
	
	self.display_chains = function( non_exec ){

	};

	self.reset_view = function( non_exec ){
                var pdb = self.selected.pdb;
                var chain = self.selected.chain;
                self.highlight_chain(pdb,chain);
	};

        self.center_view  = function( non_exec  ){
                if(self.stage) self.stage.autoView();
        }

	self.zoom_in = function( non_exec ){

	}

	self.zoom_out = function( non_exec ){

	}
	
	self.clear_selected = function ( non_exec ){
		self.reset_view();
	}

	self.load_surface = function( emd, threshold, maxVolSize, non_exec){
		self.Structures[ 'density' ]['surface'].setParameters( {isolevel:threshold} );
	}

	self.open_url = function( pdb, append_flag, chain, non_exec){
		self.stage.removeAllComponents();
		self.p_chain = chain;
                var pdb_code = pdb;
                __show_message( pdb_code.toUpperCase() );
                //var url_file = "http://mmtf.rcsb.org/v1.0/full/"+pdb_code.toUpperCase();
                var url_file = "rcsb://"+pdb_code.toUpperCase()+".mmtf";
                self.stage.loadFile(  url_file, {ext:"mmtf", firstModelOnly:true, sele:":"+chain} ).then( initChain );
		//self.stage.loadFile( "rcsb://"+pdb , {firstModelOnly:true,sele:":"+chain} ).then( initChain );
	};

	self.write_image = function(){
          self.stage.makeImage( {
                factor: 1,
                antialias: true,
                trim: false,
                transparent: true 
            } ).then( function( blob ){
                NGL.download( blob, "screenshot.png" );
            } );
        };
	
	self.__load_file = function( www_file ){

	};
	
	self.__load_surface = function( file, threshold ){

	};
}
