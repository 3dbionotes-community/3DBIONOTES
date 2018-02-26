var global_frames = ["upRightBottomFrame","leftBottomFrame","downRightBottomFrame","genomicFrame"];

function add_frames_listener(){

  window.addEventListener("aa_selected",function(evt){
    var selection = evt.detail;
    global_selection = selection;
    var frames = global_frames;
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
    var frames = global_frames;
    var from = evt.detail;
    var evtOut = document.createEvent("Event");
    evtOut.initEvent("clear_aa",true,true);
    frames.forEach(function(frame_id){
      if( from != frame_id ){
        top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
      }
    });
  });

  window.addEventListener("highlight_all",function(evt){
    global_selection =  null;
    var frames = global_frames;
    var evtOut = document.createEvent("Event");
    evtOut.initEvent("clear_aa",true,true);
    frames.forEach(function(frame_id){
      if( frame_id != "leftBottomFrame"){
        top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
      }
    });
    
    setTimeout(function(){
      var selection = evt.detail;
      var evtOut = document.createEvent("CustomEvent");
      evtOut.initCustomEvent("highlight_all", true, true, selection);
      top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut);
    },  100);
  });

  window.addEventListener("global_highlight",function(evt){
    global_selection =  null;
    var frames = global_frames;
    var evtOut = document.createEvent("Event");
    evtOut.initEvent("clear_aa",true,true);
    frames.forEach(function(frame_id){
      if( frame_id != "leftBottomFrame"){
        top.document.getElementById(frame_id).contentWindow.dispatchEvent(evtOut);
      }
    });
    
    setTimeout(function(){
      var selection = evt.detail;
      var evtOut = document.createEvent("CustomEvent");
      evtOut.initCustomEvent("global_highlight", true, true, selection);
      top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut);
    },  100);
  });

}
