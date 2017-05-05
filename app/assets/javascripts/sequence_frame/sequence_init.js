var $j = jQuery.noConflict();

var sequence_panel;
$j(document).ready(function(){

  window.addEventListener("RangeInfo", function(evt){
    var start = evt.detail[0];
    var end = evt.detail[1];
    sequence_panel.setSelection(start-1,end-1);
    var miStart = start-1;
    var divSelected = "#0_"+miStart;
    $j(body).scrollTop($j(divSelected).offset().top);
  });

  window.addEventListener("SequenceCoordinates",function(evt){
    var start = evt.detail[0];
    var end = evt.detail[1];
    var evtOut = document.createEvent("CustomEvent");
    evtOut.initCustomEvent("RangeFamInfo",true,true,[start,end]);
    top.document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtOut);
    if(top.alignmentTranslation!=undefined){
      var evtOut2 = document.createEvent("CustomEvent");
      var pdbPosList = top.getRangesFromTranslation(start,end,top.alignmentTranslation);
      evtOut2.initCustomEvent("RangeMolInfo",true,true,pdbPosList);
      top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut2);
    }
  });

  window.addEventListener("HideInfo", function(evt){
    document.getElementById('loading').style.display = "block";
    document.getElementById('mainFrames').style.display = "none";
  });

  window.addEventListener("ShowInfo", function(evt){
    document.getElementById('loading').style.display = "none";
    document.getElementById('mainFrames').style.display = "block";
  });

  window.addEventListener("ResetInfo", function(evt){
    if(sequence_panel!==undefined){
      sequence_panel.setSelection();
    }
    $j(body).scrollTop(0); 
  });

});
