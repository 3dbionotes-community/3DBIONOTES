
function add_top_window_listener(){

  window.addEventListener("select_aa", function(evt){
    var selection = evt.detail;
    var begin = selection.begin-1;
    var end = selection.end-1;
    sequence_panel.setSelection();
    sequence_panel.removeAllHighlights()
    if(begin>=0 && end>=0){
      sequence_panel.setSelection(begin,end);
      var divSelected = "#0_"+begin;
      if( $j(divSelected).length > 0 ){ 
        $j(".body_div").scrollTop( $j(divSelected).offset().top - $j(divSelected).parent().offset().top );
      }else{
        $j(".body_div").scrollTop(0);
      }
    }
  });

  window.addEventListener("clear_aa", function(evt){
    if(sequence_panel!==undefined){
      sequence_panel.setSelection();
      sequence_panel.removeAllHighlights()
    }
    $j(body).scrollTop(0);
  });

  window.addEventListener("highlight_all", function(evt){
    var selection = evt.detail;
    var features = [];
    selection.forEach(function(f){
      features.push({start:f.begin,end:f.end});
    });
    multipleHighlight(features);
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
