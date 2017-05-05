var $j = jQuery.noConflict();

$j(window).ready(function(){
  window.addEventListener("RangeMolInfo", function(evt){
    pdbPosList = evt.detail;
    miApplet.color_by_chain_simple(pdbPosList,infoGlobal.activepdb,infoGlobal.activechain);
    if(pdbPosList.length<4){
      miApplet.draw_sphere(pdbPosList.length);
    }
    if(pdbPosList.length>0){
      $j('#res_start').html( pdbPosList[0] );
      $j('#res_end').html( pdbPosList[ pdbPosList.length-1 ] );
      $j('#selected_residues').css( 'visibility','visible' );
    }else{
      $j('#selected_residues').css( 'visibility','hidden' );
    }
  });
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
  window.addEventListener("ClearSelected", function(evt){
    $j('#selected_residues').css( 'visibility','hidden' );
    ClearSelected();
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

});

$j(document).ready(function(){
  $j('.label_display_close').click(function(){
    $j(".label_display").css("visibility", "hidden");
    $j(".label_display").css("display", "none");
  });
});
