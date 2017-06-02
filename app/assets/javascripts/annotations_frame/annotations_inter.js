
function add_top_window_listener(){

  window.addEventListener("select_aa", function(evt){
    var selection = evt.detail;
    var begin = selection.begin;
    var end = selection.end;
    var color = selection.color;
    if(imported_flag){
      var X = get_imported_range(selection.begin,selection.end);
      begin = X[0];
      end = X[1];
    }
    instance.__highlight({begin:begin, end:end, color:color});
  });

  window.addEventListener("clear_aa", function(evt){
    $j('.up_pftv_tooltip-container').css('visibility','hidden');
    if (instance.selectedFeature){
      var fake_click = new MouseEvent("click");
      if( document.getElementsByName( instance.selectedFeature.internalId ).lentgh > 0){
        document.getElementsByName( instance.selectedFeature.internalId )[0].dispatchEvent(fake_click);
        $j(".up_pftv_tooltip-close").get(0).dispatchEvent(fake_click);
      }else if($j("[name="+instance.selectedFeature.internalId+"]").length > 0){
        $j("[name="+instance.selectedFeature.internalId+"]").get(0).dispatchEvent(fake_click);
        if( $j(".up_pftv_tooltip-close").get(0) )$j(".up_pftv_tooltip-close").get(0).dispatchEvent(fake_click);
      }
    }
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
  evt.initCustomEvent("aa_cleared",true,true,"upRightBottomFrame");
  top.window.dispatchEvent(evt);
}

function check_global_selection(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("check_global_selection",true,true,"upRightBottomFrame");
  top.window.dispatchEvent(evt);
}


