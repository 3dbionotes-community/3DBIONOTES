
function add_top_window_listener(){

  window.addEventListener("select_aa", function(evt){
    var selection = evt.detail;
    var begin = selection.begin;
    var end = selection.end;
    var color = selection.color;
    var pdbPosList = top.getRangesFromTranslation(begin,end,top.alignmentTranslation);
    miApplet.color_by_chain_simple(pdbPosList,infoGlobal.activepdb,infoGlobal.activechain,color);

    if(pdbPosList.length>0){
      $j('#res_start').html( pdbPosList[0] );
      $j('#res_end').html( pdbPosList[ pdbPosList.length-1 ] );
      $j('#selected_residues').css( 'visibility','visible' );
    }else{
      $j('#selected_residues').css( 'visibility','hidden' );
    }
  });

  window.addEventListener("clear_aa", function(evt){
    $j('#selected_residues').css( 'visibility','hidden' );
    ClearSelected();
  });

  window.addEventListener("highlight_all", function(evt){
    ClearSelected();
    var selection = evt.detail;
    miApplet.multiple_highlight( infoGlobal.activepdb, infoGlobal.activechain, selection );
  });

  window.addEventListener("global_highlight", function(evt){
    ClearSelected();
    var selection = evt.detail;
    miApplet.global_highlight( infoGlobal.activepdb, selection );
  });

}

function trigger_aa_selection(selection){
  var selection = selection;
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_selected",true,true,selection);
  top.window.dispatchEvent(evt);
}

