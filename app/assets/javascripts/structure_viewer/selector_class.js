"use strict";

class selector_class {
  constructor( viewer ){
    var self = this;
    self.viewer = viewer;
    self.keep_selected = [];
  }

  keep_selection(){
    var self = this;

    var pdb = self.viewer.selected.pdb;
    var chain =  self.viewer.selected.chain;
    var list = self.viewer.selected.residues;

    if(!pdb in self.viewer.Structures) return;
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
    var label_obj = { 
      id:id_,
      selection:selection,
      color:color, 
      label_selection:label_selection, 
      label_text:label_text, 
      label_visible:true, 
      text_visible:true 
    }
    var result = $j.grep( self.keep_selected, function(e){ return e.id == id_; });
    if( result.length == 0 ){
      self.keep_selected.push(label_obj);
      add_to_label_display(label_obj);
    }
    self.display_selection();
  }

  display_selection() {
    var self = this;
    var pdb = self.viewer.selected.pdb;        
    if( self.keep_selected.length==0 ) return;
    self.viewer.Structures[ pdb ]['representations']['keep_selection'].forEach(function(i){
      i.spacefill.setVisibility(false);
      i.label.setVisibility(false);
      self.viewer.Structures[ pdb ]['obj'].removeRepresentation(i.spacefill);
      self.viewer.Structures[ pdb ]['obj'].removeRepresentation(i.label);
    });
    self.viewer.Structures[ pdb ]['representations']['keep_selection']=[];
    self.keep_selected.forEach(function(i){
      var model_flag = '';
      if( self.viewer.model >=0 ) model_flag = 'and /'+self.viewer.model.toString()+' ';
      var selection = "protein "+model_flag+'and '+i.selection;
      var label_selection = "protein "+model_flag+'and '+i.label_selection;
      var color = i.color;
      var representation = self.viewer.Structures[ pdb ]['obj'].addRepresentation("spacefill",{visible:i.label_visible,sele:selection,color:color});

      var selectionObject = new NGL.Selection( label_selection );
      var labelText = {};
      var pdb_component = self.viewer.stage.getComponentsByName(pdb);
      if( pdb_component.list.length == 0 ) pdb_component = self.viewer.stage.getComponentsByName( pdb.toUpperCase() );
      if( pdb_component.list.length == 0 ) pdb_component = self.viewer.stage.getComponentsByName( pdb.toLowerCase()+"_final.pdb" );
      if( pdb_component.list.length == 0 ) {
        console.log("getComponentsByName failed -  args => "+pdb);
        return;
      }
      pdb_component.list[0].structure.eachAtom(function(atomProxy) {
        labelText[atomProxy.index] = i.label_text;
      }, selectionObject);

      var label = self.viewer.Structures[ pdb ]['obj'].addRepresentation("label",{
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
                                                                            sele:label_selection
      });
      self.viewer.Structures[ pdb ]['representations']['keep_selection'].push({spacefill:representation,label:label});
    });
  }
  remove_selection( index ){
    var self = this;
    var pdb = self.viewer.selected.pdb;        
    var i = self.viewer.Structures[ pdb ]['representations']['keep_selection'][index];
    i.spacefill.setVisibility(false);
    i.label.setVisibility(false);
    self.viewer.Structures[ pdb ]['obj'].removeRepresentation(i.spacefill);
    self.viewer.Structures[ pdb ]['obj'].removeRepresentation(i.label);
    self.viewer.Structures[ pdb ]['representations']['keep_selection'].splice(index,1);
    self.keep_selected.splice(index,1);
    self.display_selection();
  }
}

module.exports = selector_class;
