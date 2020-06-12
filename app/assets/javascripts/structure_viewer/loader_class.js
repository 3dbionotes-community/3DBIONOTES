"use strict";

class loader_class{

  constructor(viewer){
    var self = this;
    self.viewer = viewer;
    self.load_ready = false;
  }

  load(){
    var self = this;
    if(self.viewer.args.origin == "local" || self.viewer.args.origin == "interactome3d"){
      self.viewer.message_manager.show_message( "FILE" );
      var ext = "pdb";
      if( self.viewer.args.pdb_list[1] && self.viewer.args.pdb_list[1].includes("cif") ){
        ext = "cif";
      }
      var pdb_url = null;
      if(self.viewer.args.origin == "local"){
        pdb_url = "/upload/"+self.viewer.args.pdb_list[0]+"/"+self.viewer.args.pdb_list[1];
      }else if(self.viewer.args.origin == "interactome3d"){
        pdb_url = self.viewer.args.pdb_list[0];
      }
      self.viewer.stage.loadFile( pdb_url, {ext:ext} ).then( 
        function(i){
          self.initLocalStructure(self,i);
      }).catch( function(e){
        console.error(e);
        swal({
          title: "ERROR LOADING "+pdb_url+" FILE",
          text: "FILE FORMAT ERROR",
          timer: 5000,
          type: "error",
          showConfirmButton: true
        });
      });
    }else if (self.viewer.args.origin == "ISOLDE"){
      

      var n = 1;
      self.viewer.args.pdb_list.forEach(function(pdb_code){
        self.pdb_flag = true;
        if( n == self.viewer.args.pdb_list.length ) self.load_ready = true;
        self.viewer.message_manager.show_message( pdb_code.toUpperCase() );       

        console.log("->>> LOADING ISOLDE RE-MODEL for: " + pdb_code);
        // var url_file = "http://rinchen-dos.cnb.csic.es:8083/files/modifiedPdb/download/378289b4-b52a-436b-8c00-1835312ffbd4";
        // var url_file = "http://rinchen-dos.cnb.csic.es:8083/files/modifiedPdb/download/3c7ce463-becb-43c2-a00c-67997fc329e2";
        var url_file = "/ws/lrs/files/modifiedPdb/download/" + self.viewer.args.uuid;
                
        console.log( "LOADING "+url_file );
        self.viewer.stage.loadFile(  url_file, {ext:"pdb", firstModelOnly:true} ).then( 
          function(i){
            self.initStructure(self,i);
        }).catch( function(e){
          console.error(e);
          var url_file = "rcsb://"+pdb_code.toUpperCase()+".cif";
          console.log( "->>> LOADING "+url_file );
          self.viewer.stage.loadFile( url_file, {ext:"cif", firstModelOnly:true} ).then( 
            function(i){
              self.initStructure(self,i);
          });
        });
        n++;
      });


    }else if (self.viewer.args.origin == "PDB-REDO"){
      // https://pdb-redo.eu/db/6lxt/6lxt_final.pdb

      var n = 1;
      self.viewer.args.pdb_list.forEach(function(pdb_code){
        self.pdb_flag = true;
        if( n == self.viewer.args.pdb_list.length ) self.load_ready = true;
        self.viewer.message_manager.show_message( pdb_code.toUpperCase() );       

        console.log("->>> LOADING IPDB-REDO RE-MODEL for: " + pdb_code);
        // var url_file = "http://rinchen-dos.cnb.csic.es:8083/files/modifiedPdb/download/378289b4-b52a-436b-8c00-1835312ffbd4";
        // var url_file = "http://rinchen-dos.cnb.csic.es:8083/files/modifiedPdb/download/3c7ce463-becb-43c2-a00c-67997fc329e2";
        var url_file = "https://pdb-redo.eu/db/" + pdb_code.toLowerCase() +"/"+pdb_code.toLowerCase()+"_final.pdb";
                
        console.log( "LOADING "+url_file );
        self.viewer.stage.loadFile(  url_file, {ext:"pdb", firstModelOnly:true} ).then( 
          function(i){
            self.initStructure(self,i);
        }).catch( function(e){
          console.error(e);
          var url_file = "rcsb://"+pdb_code.toUpperCase()+".cif";
          console.log( "->>> LOADING "+url_file );
          self.viewer.stage.loadFile( url_file, {ext:"cif", firstModelOnly:true} ).then( 
            function(i){
              self.initStructure(self,i);
          });
        });
        n++;
      });

    }else{
      var n = 1;
      self.viewer.args.pdb_list.forEach(function(pdb_code){
        self.pdb_flag = true;
        if( n == self.viewer.args.pdb_list.length ) self.load_ready = true;
        self.viewer.message_manager.show_message( pdb_code.toUpperCase() );
        var url_file = location.protocol+"//mmtf.rcsb.org/v1.0/full/"+pdb_code.toUpperCase();
        console.log( "LOADING "+url_file );
        self.viewer.stage.loadFile(  url_file, {ext:"mmtf", firstModelOnly:true} ).then( 
          function(i){
            self.initStructure(self,i);
        }).catch( function(e){
          console.error(e);
          var url_file = "rcsb://"+pdb_code.toUpperCase()+".cif";
          console.log( "LOADING "+url_file );
          self.viewer.stage.loadFile( url_file, {ext:"cif", firstModelOnly:true} ).then( 
            function(i){
              self.initStructure(self,i);
          });
        });
        n++;
      });
    }
    if( self.viewer.args.emdb ){
      var __emdb = self.viewer.args.emdb.replace("EMD-", "emd_");
      self.viewer.message_manager.show_em_message( self.viewer.args.emdb );
      // var url_map = "https://www.ebi.ac.uk/pdbe/static/files/em/maps/"+__emdb+".map.gz"
      var url_map = "https://3dbionotes.cnb.csic.es/ws/pond/maps/"+self.viewer.args.emdb+"/file/"+__emdb+".map.gz"
      self.viewer.stage.loadFile( url_map, {useWorker: true} ).then( 
        function(i){
          self.init_map(self,i);
      }).catch(function(e){
        console.error(e);
        swal({
          title: "ERROR LOADING "+url_map+" FILE",
          text: "FILE FORMAT ERROR",
          timer: 5000,
          type: "error",
          showConfirmButton: true
        });
      });
    }
    if(self.viewer.args.pdb_list.length == 0) self.trigger_alignment();
  }

  initLocalStructure(self,ngl,no_trigger_flag){
    self.init(ngl,true,false,true);
    if(!no_trigger_flag)self.trigger_alignment();
    self.viewer.message_manager.clear_message();
  }

  initStructure(self,ngl){
    self.init(ngl,false,true);
    if( self.load_ready ){
      self.trigger_alignment();
      self.viewer.message_manager.clear_message();
    }
  }

  initChain(self,ngl){
    self.init(ngl,true,false);
    self.viewer.message_manager.clear_message();
  }

  trigger_alignment(){
    var self = this;
    setTimeout(function(){
      var d = JSON.parse( window.top.$j('#alignment > option:nth-child(2)').val() );
      if( 'uniprot' in d ){
        window.top.$j('#alignment > option:nth-child(2)').prop('selected', true);
        window.top.$j('#alignment').trigger('change');
      }else{
        console.log("No SIFT alignment available");
      }
    },1000);
  }

  init(ngl, cartoon_visibility, trace_visibility, local_flag){
    var self = this;
    var name = ngl.name.substring(0, 4).toLowerCase();
    if(local_flag) name = ngl.name;
    self.model = 0;
    self.viewer.Structures[ name ] = { obj:ngl, representations:{'selection':{},'keep_selection':{}} };
    var model_flag = "";
    if(local_flag) model_flag = "/0 and ";

    if(top.no_aa_ch && Object.keys(top.no_aa_ch).length > 0){
      var no_aa = ":"+Object.keys(top.no_aa_ch).join(" or :");
      var repr = ngl.addRepresentation("ball+stick",{sele: model_flag+"( hetero or ("+no_aa+")  ) and not water and not (dna or rna) and ",visible:true});
      self.viewer.Structures[ name ]['representations']['hetero'] = repr;
    }else{
      var repr = ngl.addRepresentation("ball+stick",{sele: model_flag+"hetero and not water",visible:true});
      self.viewer.Structures[ name ]['representations']['hetero'] = repr;
    }
    
    var repr = ngl.addRepresentation("trace",{sele: model_flag+"dna or rna", visible:true, color:"orange"});
    self.viewer.Structures[ name ]['representations']['nucleic'] = repr;

    self.viewer.Structures[ name ]['representations']['chains'] = {}
    ngl.structure.eachChain(function(ch){
      if(!(ch.chainname in self.viewer.Structures[ name ]['representations']['chains'])){
        self.viewer.Structures[ name ]['representations']['chains'][ch.chainname] = {};

        var repr = ngl.addRepresentation("cartoon",{visible:cartoon_visibility, color:self.viewer.default_color, sele:model_flag+"protein and :"+ch.chainname});
        self.viewer.Structures[ name ]['representations']['chains'][ch.chainname]['cartoon'] = repr;

        var repr = ngl.addRepresentation("cartoon",{visible:trace_visibility, color:"#F3F3F3", sele:model_flag+"protein and :"+ch.chainname, opacity:0.2});
        self.viewer.Structures[ name ]['representations']['chains'][ch.chainname]['trace'] = repr;
      }
    });

    self.viewer.Structures[ name ]['representations']['selection']['cartoon'] = ngl.addRepresentation("cartoon",{visible:false,sele:model_flag+"protein",color:"#FFE999"});
    self.viewer.Structures[ name ]['representations']['selection']['spacefill'] = ngl.addRepresentation("spacefill",{visible:false,sele:model_flag+"protein",color:"#FFE999"});
    self.viewer.Structures[ name ]['representations']['selection']['ball+stick'] = ngl.addRepresentation("ball+stick",{visible:false,sele:model_flag+"protein",color:"#FFE999"});

    self.viewer.Structures[ name ]['representations']['keep_selection'] = [];
    self.viewer.Structures[ name ]['representations']['multiple_selection']=[];
    self.viewer.stage.autoView();
  }

  init_map(self,ngl){
    self.viewer.Density = { obj:ngl, surface:{} };
    if(self.pdb_flag){
      self.viewer.Density['surface'] = ngl.addRepresentation( "surface", {
        opacity: 0.1,
        color:"#33ABF9",
        flatShaded:false,
        background:false,
        opaqueBack:false,
        depthWrite:true,
        isolevel:5
      });
      self.viewer.message_manager.clear_em_message();       
    }else{
      self.viewer.Density['surface'] = ngl.addRepresentation( "surface", {
        color:"#33ABF9",
        depthWrite:true,
        isolevel:5
      });
      setTimeout(function(){
        self.viewer.stage.autoView();
        self.viewer.message_manager.clear_em_message();       
      },6000);
    }
  }

}

module.exports = loader_class;
