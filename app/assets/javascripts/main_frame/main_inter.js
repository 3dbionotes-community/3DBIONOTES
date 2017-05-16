
function add_frames_listener(){

  window.addEventListener("aa_selected",function(evt){
    var selection = evt.detail;
    global_selection = selection;
    var frames = ["upRightBottomFrame","leftBottomFrame","downRightBottomFrame"];
    var evtOut = document.createEvent("CustomEvent");
    evtOut.initCustomEvent("select_aa",true,true,selection);
    if(selection.to){
      if(selection.to.forEach){
        selection.to.forEach(function(frame_id){
          top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
        });
      }else{
        top.document.getElementById(selection.to).contentWindow.dispatchEvent(evtOut);
      }
    }else{
      frames.forEach(function(frame_id){
        if( selection.frame != frame_id ){
          top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
        }
      });
    }
  });

  window.addEventListener("check_global_selection",function(evt){
    if(global_selection){
      var frame_id = evt.detail;
      var selection = { begin:global_selection.begin, end:global_selection.end, color:global_selection.color };
      var evtOut = document.createEvent("CustomEvent");
      evtOut.initCustomEvent("select_aa",true,true,selection);
      top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
    }
  });

  window.addEventListener("aa_cleared",function(evt){
    global_selection =  null;
    var frames = ["upRightBottomFrame","leftBottomFrame","downRightBottomFrame"];
    var from = evt.detail;
    var evtOut = document.createEvent("Event");
    evtOut.initEvent("clear_aa",true,true);
    frames.forEach(function(frame_id){
      if( from != frame_id ){
        top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
      }
    });
  });

}
