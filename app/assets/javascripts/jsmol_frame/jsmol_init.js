var $j = jQuery.noConflict();

$j(document).ready(function(){
 
  window.addEventListener("molInfo", function(evt){
    $j('#selected_residues').css( 'visibility','hidden' );
    infoGlobal = evt.detail;
    if (infoGlobal.origin=="Uniprot"){
      miApplet.open_url((infoGlobal.activepdb).toUpperCase(),false,infoGlobal.activechain);
      miApplet.reset_view();
      miApplet.highlight_chain(infoGlobal.activepdb,infoGlobal.activechain);
    }else{
      miApplet.highlight_chain(infoGlobal.activepdb,infoGlobal.activechain);
    }
  });

  window.addEventListener("nextModel", function(evt){
    nextModel();
  });
  window.addEventListener("prevModel", function(evt){
    prevModel();
  });
  window.addEventListener("zoomIN", function(evt){
    zoomIN();
  });
  window.addEventListener("zoomOUT", function(evt){
    zoomOUT();
  });
  window.addEventListener("sphere", function(evt){
    sphere();
  });
  window.addEventListener("screenshot", function(evt){
    screenshot();
  });
  window.addEventListener("play", function(evt){
    play();
  });
  window.addEventListener("keep_selection", function(evt){
    keep_selection();
  });
  window.addEventListener("label_display", function(evt){
    label_display(evt);
  });

  $j('.label_display_close').click(function(){
    $j(".label_display").css("visibility", "hidden");
    $j(".label_display").css("display", "none");
  });

  add_top_window_listener();

});


