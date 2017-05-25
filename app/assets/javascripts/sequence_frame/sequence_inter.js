
function add_top_window_listener(){

  window.addEventListener("select_aa", function(evt){
    var selection = evt.detail;
    var begin = selection.begin-1;
    var end = selection.end-1;
    sequence_panel.setSelection(begin,end);
    var divSelected = "#0_"+begin;
    if( $j(divSelected).length > 0 ) $j(body).scrollTop( $j(divSelected).offset().top );
  });

  window.addEventListener("clear_aa", function(evt){
    if(sequence_panel!==undefined){
      sequence_panel.setSelection();
    }
    $j(body).scrollTop(0);
  });

}

function trigger_aa_selection(selection){
  var selection = selection;
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_selected",true,true,selection);
  top.window.dispatchEvent(evt);
}

function trigger_aa_cleared(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_cleared",true,true,"downRightBottomFrame");
  top.window.dispatchEvent(evt);
}

function check_global_selection(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("check_global_selection",true,true,"downRightBottomFrame");
  top.window.dispatchEvent(evt); 
}
