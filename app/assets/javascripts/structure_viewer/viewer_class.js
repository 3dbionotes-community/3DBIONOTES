"use strict";

const message_class = require("./message_class");
const loader_class = require("./loader_class");
const selector_class = require("./selector_class");

class viewer_class {

  constructor( args ){
    var self = this;
    self.stage = null;
    self.Structures = {};
    self.Density = {};
    self.ImportedStructures = {};
    self.selected = {pdb:'',chain:'',residues:[]};
    self.args = args;
    self.model = -1;
    self.load_ready = false;
    self.keep_selected = [];
    self.pdb_flag = false;
    self.default_color = "#CFCFFF";
    self.default_color_c = "#CFFFCF";

    self.message_manager = new message_class();
    self.loader_manager = new loader_class(self);
    self.selector_manager = new selector_class(self);

    document.addEventListener( "DOMContentLoaded", function(){
      self.init_viewer();
    }); 

  }

  init_viewer(){
    var self = this;
    self.stage = new NGL.Stage( "viewport" );
    window.addEventListener( "resize", function( event ){
      self.stage.handleResize();
    }, false );
    self.stage.setParameters( {backgroundColor: "white",quality: "low"} );
    self.loader_manager.load();
    self.add_mouse_click();
  }

  display_message(){
    var self = this;
  }
 
  resize(){
    var self = this;
  }

  add_mouse_click(){
    var self = this;
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
            console.log( "atom.chainname = "+atom.chainname );
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
  }

  keep_selection(){
    var self = this;
    self.selector_manager.keep_selection();
  }

  display_selection() {
    var self = this;
    self.selector_manager.display_selection();
  }

  remove_selection( index ){
    var self = this;
    self.selector_manager.remove_selection( index );
  }

  multiple_highlight(pdb, chain, list){
    var self = this;
    self.remove_multiple_selection();
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

    self.Structures[ pdb ]['representations']['chains'][chain]['cartoon'].setSelection( "protein "+model_flag+"and :"+chain );

    self.Structures[ pdb ]['representations']['selection']['cartoon'].setSelection( "" );
    self.Structures[ pdb ]['representations']['selection']['spacefill'].setSelection( "protein "+model_flag+"and :"+chain+" and ("+selection.join(" or ")+")" );
    self.Structures[ pdb ]['representations']['selection']['ball+stick'].setSelection( "" );

    self.Structures[ pdb ]['representations']['selection']['spacefill'].setColor(color);

    self.Structures[ pdb ]['representations']['selection']['cartoon'].setVisibility(false);
    self.Structures[ pdb ]['representations']['selection']['ball+stick'].setVisibility(false);
    self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(true);
  }

  global_highlight(pdb, list){
    var self = this;
    if(!pdb)return;
    if(!self.Structures[ pdb ])return;
    self.remove_multiple_selection();
    self.reset_chain_view();

    var global_selection = {};
    var global_cartoon = [];
    var color;


    for(var ch in list){
      global_cartoon.push( ch );
      var selection = {};
      list[ch].forEach(function(i){
          color = i.color;
          var uniprot = Object.keys( top.$ALIGNMENTS[  pdb ][ch] )[0];
          var ch_alignmentTranslation = top.$ALIGNMENTS[  pdb ][ch][uniprot].mapping;
          var pdbPosList = top.getRangesFromTranslation(i.begin, i.end, ch_alignmentTranslation);
          if(!(color in selection))selection[color]={};
          pdbPosList.forEach(function(j){
            selection[color][j]=true;
          });
      });
      var keys = Object.keys(selection);
      keys.sort(function(a, b) {
        return (Object.keys(selection[b]).length - Object.keys(selection[a]).length);
      });
      keys.forEach(function(color){
        var res = Object.keys(selection[color]);
        if(res.length > 0){
          if(!(color in global_selection))global_selection[color]=[]
          global_selection[color].push( ":"+ch+" and ("+res.join(" or ")+")" ); 
        }
      });
    }

    var model_flag = '';
    if(self.model>=0) model_flag = 'and /'+self.model.toString()+' ';

    var _cols = [self.default_color,self.default_color_c];
    if(global_cartoon.length == 1) _cols = [  ];
    global_cartoon.forEach(function(sel,i){
      self.Structures[ pdb ]['representations']['chains'][sel]['trace'].setVisibility(false);
      self.Structures[ pdb ]['representations']['chains'][sel]['cartoon'].setVisibility(true);
      self.Structures[ pdb ]['representations']['chains'][sel]['cartoon'].setColor(_cols[i]);
    });

    self.Structures[ pdb ]['representations']['selection']['cartoon'].setVisibility(false); 
    self.Structures[ pdb ]['representations']['selection']['ball+stick'].setVisibility(false);
    self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(false);


    
    for(var color in global_selection){
      if(global_selection[color].length >0){
        var selection_string = "protein "+model_flag+"and (("+global_selection[color].join(") or (")+"))";
        self.Structures[ pdb ]['representations']['multiple_selection'].push(
          self.Structures[ pdb ].obj.addRepresentation("spacefill",{visible:true,sele:selection_string,color:color})
        );
      }
    }
  }

  remove_multiple_selection(){
    var self = this;
    for(var pdb in self.Structures){
      if('representations' in self.Structures[ pdb ] && 'multiple_selection' in self.Structures[ pdb ]['representations']){
        self.Structures[ pdb ]['representations']['multiple_selection'].forEach(function(i){
          i.setVisibility(false);
          self.stage.removeComponent(i.uuid)
        });
        self.Structures[ pdb ]['representations']['multiple_selection']=[];
      }
      if('representations' in self.Structures[ pdb ] && 'multiple_cartoon' in self.Structures[ pdb ]['representations']){
        self.Structures[ pdb ]['representations']['multiple_cartoon'].forEach(function(i){
          i.setVisibility(false);
          self.stage.removeComponent(i.uuid)
        });
        self.Structures[ pdb ]['representations']['multiple_cartoon']=[];
      }
    }
  }

  play(){
    var self = this;
    var x = self.model;
    var intervalID = setInterval(function () {
      self.change_model(1);
      if (++x === 2*self.args.n_models) {
        window.clearInterval(intervalID);
      }
    }, 100);
  }

  change_model(flag){
    var self = this;
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
      self.display_selection();
      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent("modelChange",true,true,[aux+1]);
      window.top.document.dispatchEvent(evt);
      top.document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evt);
    }else{
      self.display_selection();
    }
  }

  color_by_chain_simple( list, _pdb, chain, _color, non_exec ){
    var self = this;
    var pdb = _pdb;

    self.highlight_chain( pdb, chain );
    
    var color = "#FFE999";
    if(_color)  color = _color;
    
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
      self.Structures[ pdb ]['representations']['chains'][chain]['cartoon'].setSelection( "protein "+model_flag+"and :"+chain+" and not ("+L.join(" or ")+")" );
    }else{
      self.Structures[ pdb ]['representations']['chains'][chain]['cartoon'].setSelection( "protein "+model_flag+"and :"+chain );
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
  }

  load_more_atoms(pdb,chain,non_exec){
    var self = this;
    if(!self.selected.pdb) return;
    if( self.Structures[ pdb ]['representations']['selection']['spacefill'].visible ){	
    	self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(false);
    }else{
    	self.Structures[ pdb ]['representations']['selection']['spacefill'].setVisibility(true);
    }
  }

  show_hetero(non_exec){
    var self = this;
    for(var __name in self.Structures){
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
	
  show_volume(non_exec){
    var self = this;
    self.Density['surface'].setVisibility(true);
  }
	
  hide_volume(non_exec){
    var self = this;
    self.Density['surface'].setVisibility(false);
  }

  highlight_chain( pdb, chain, non_exec ){
    var self = this;
    if(!self.Structures[pdb]) return;

    self.remove_multiple_selection();
    self.reset_chain_view();
    self.reset_selection_view();

    var model_flag = '';
    if(self.model>=0) model_flag = 'and /'+self.model.toString()+' '; 


    self.Structures[ pdb ]['representations']['chains'][chain]['trace'].setVisibility(false);
    self.Structures[ pdb ]['representations']['chains'][chain]['cartoon'].setVisibility(true);

    self.selected.pdb = pdb;
    self.selected.chain = chain;
    self.selected.residues = [];
  }

  reset_selection_view(){
    var self = this;
    for(var _p in self.Structures){
      for (var type in self.Structures[ _p ]['representations']['selection']){
        self.Structures[ _p ]['representations']['selection'][type].setVisibility(false);
      }
    }
  }

  reset_chain_view(){
    var self = this;
    var model_flag = '';
    if(self.model>=0) model_flag = 'and /'+self.model.toString()+' '; 

    for(var s in self.Structures){
      for(var ch in self.Structures[s]['representations']['chains']){
        var repr = self.Structures[s]['representations']['chains'][ch];
        repr['trace'].setSelection( "protein "+model_flag+"and :"+ch );
        repr['trace'].setVisibility(true);
        repr['cartoon'].setSelection( "protein "+model_flag+"and :"+ch );
        repr['cartoon'].setColor(self.default_color);
        repr['cartoon'].setVisibility(false);
      }
    }
  }

  reset_view( non_exec ){
    var self = this;
    self.remove_multiple_selection();
    var pdb = self.selected.pdb;
    var chain = self.selected.chain;
    self.highlight_chain(pdb,chain);
  }

  center_view( non_exec  ){
    var self = this;
    if(self.stage) self.stage.autoView();
  }

  clear_selected( non_exec ){
    var self = this;
    self.reset_view();
  }

  load_surface( emd, threshold, maxVolSize, non_exec){
    var self = this;
    self.Density['surface'].setParameters( {isolevel:threshold} );
  }

  open_url( pdb, append_flag, chain, non_exec ){
    var self = this;
    if(!pdb)return;
    self.stage.removeAllComponents();
    if(non_exec){
      self.message_manager.show_no_file();
      return;
    }
    self.p_chain = chain;
    var pdb_code = pdb;
    if(pdb_code.includes("interactome_pdb")){
      self.message_manager.show_message( "FILE" );
      self.stage.loadFile( pdb_code, {ext:"pdb", firstModelOnly:true} ).then( 
        function(i){
          self.loader_manager.initLocalStructure(self.loader_manager,i,true);
          self.highlight_chain(infoGlobal.activepdb,infoGlobal.activechain);
          trigger_interactome_active_data( append_flag );
      }).catch(function(e){
        console.error(e);
        var url_file = pdb_code;
        console.log("URL "+url_file+" ERROR");
      });     
    }else{
      self.message_manager.show_message( pdb_code.toUpperCase() );
      var url_file = "rcsb://"+pdb_code.toUpperCase()+".mmtf";
      self.stage.loadFile( url_file, {ext:"mmtf", firstModelOnly:true, sele:":"+chain} ).then( 
        function(i){
          self.loader_manager.initChain(self.loader_manager,i);
      }).catch(function(e){
        console.error(e);
        var url = url_file;
        console.log("URL "+url_file+" ERROR");
      });
    }
  }

  hide_hetero(non_exec){
    var self = this;
    self.show_hetero();
  }

  write_image(){
    var self = this;
    self.stage.makeImage({
      factor: 1,
      antialias: true,
      trim: false,
      transparent: true 
    }).then( function( blob ){
      NGL.download( blob, "screenshot.png" );
    });
  }

}

module.exports = viewer_class;

