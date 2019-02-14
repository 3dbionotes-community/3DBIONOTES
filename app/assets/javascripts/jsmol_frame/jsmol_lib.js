function resetView(){
  $j('#selected_residues').css( 'visibility','hidden' );
  miApplet.reset_view();
}

function screenshot(){
  miApplet.write_image();
}

function zoomIN(){
  miApplet.zoom_in();
}

function zoomOUT(){
  miApplet.zoom_out();
}

function keep_selection(){
  miApplet.keep_selection();
}

function play(){
  miApplet.play();
}


function prevModel(){
  miApplet.change_model(-1);
}

function nextModel(){
  miApplet.change_model(1);
}

function sphere(){
  miApplet.change_sphere_visibility();
}

function ClearSelected(){
  miApplet.clear_selected();
  //miApplet.center_view();
}

function loadPDB(pdbList){
  var list = eval(pdbList);
  for(var i=0;i<list.length;i++){
    var pdb = list[i];
    miApplet.open_url(pdb,true);
  }
}

function loadEMDB(emd,threshold,maxSizeVol){
  miApplet.load_surface(emd,threshold,maxSizeVol);
}

function displayMessage(message){
  miApplet.display_message(message);
}

function label_display(e){
  var d = e.detail+18;
  if(d<0)d=10;  
  $j(".label_display").css("top",d);
  var visibility = $j(".label_display").css("visibility");
  if(visibility == "hidden"){
    $j(".label_display").css("visibility", "visible");
    $j(".label_display").css("display", "block");
  }else{
    $j(".label_display").css("visibility", "hidden");
    $j(".label_display").css("display", "none");
  }
}

function add_to_label_display(i){
  $j(".label_display").append( $j(
    "<div class=\"label_div\" id=\"label:"+i.id+"\">"+
    "<label><input title=\"Display/Hide text annotation\" type=\"checkbox\" id=\"label_text_visible:"+i.id+"\" class=\"label_class label_text_visible\" checked />"+
    "<input title=\"Display/Hide annotation\" type=\"checkbox\" id=\"label_visible:"+i.id+"\" class=\"label_class label_visible\" checked />"+
    "<span title=\"Remove annottaion\" class=\"remove_label\" id=\"remove:"+i.id+"\">&times;</span>"+
    "<span class=\"label_text\" style=\"color:"+i.color+";\" >"+i.label_text.toUpperCase()+"</span></label></div>" )
  );
  $j('#label_text_visible\\:'+i.id).change(function(){
    label_text_visible( $j(this) );
  });

  $j('#label_visible\\:'+i.id).change(function(){
    label_visible( $j(this) );
  });

  $j('#remove\\:'+i.id).click(function(){
    remove_label( $j(this) );
  });
}

function label_text_visible(i){
  var internalId = i.attr("id").split(":")[1];
  var index = miApplet.selector_manager.keep_selected.findIndex(function(i){
    return i.id == internalId;
  })
  var item = miApplet.selector_manager.keep_selected[ index ];
  if(item.text_visible){
    item.text_visible = false;
  }else{
    item.text_visible = true;
    if( !$j('#label_visible\\:'+internalId).prop( "checked" ) ){
      $j('#label_visible\\:'+internalId).prop( "checked",true );
      label_visible( $j('#label_visible\\:'+internalId) );
    }
  }
  miApplet.selector_manager.keep_selection();
}

function label_visible(i){
  var internalId = i.attr("id").split(":")[1];
  var index = miApplet.selector_manager.keep_selected.findIndex(function(i){
    return i.id == internalId;
  });
  var item = miApplet.selector_manager.keep_selected[ index ];
  if(item.label_visible){
    item.label_visible = false;
    if( $j('#label_text_visible\\:'+internalId).prop( "checked" ) ){
      $j('#label_text_visible\\:'+internalId).prop( "checked",false );
      label_text_visible( $j('#label_text_visible\\:'+internalId) );
    }
  }else{
    item.label_visible = true;
  }
  miApplet.selector_manager.keep_selection();
}

function remove_label(i){
  var internalId = i.attr("id").split(":")[1];
  var index = miApplet.selector_manager.keep_selected.findIndex(function(i){
    return i.id == internalId;
  });
  $j('#label\\:'+internalId).remove();
  miApplet.remove_selection( index );
}

