
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

  window.addEventListener("load_interactome3d", function(evt){ 
    var data = evt.detail
    var file = data.file;

    var infoAlignmentEval = top.global_infoAlignment
    infoGlobal.origin = infoAlignmentEval.origin;
    infoGlobal.pdbsToLoad = infoAlignmentEval.pdbList;
    infoGlobal.activepdb = infoAlignmentEval.pdb;
    infoGlobal.activechain = infoAlignmentEval.chain;
    if(!file){
       miApplet.open_url(false,false,false,true);
    }else{
       miApplet.open_url("/interactome_pdb/"+file,data);
    }
  });

}

function trigger_aa_selection(selection){
  var selection = selection;
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_selected",true,true,selection);
  top.window.dispatchEvent(evt);
}

function trigger_interactome_active_data(data){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("ppiFrame_display_active_data",true,true,data);
  top.window.dispatchEvent(evt);
}


