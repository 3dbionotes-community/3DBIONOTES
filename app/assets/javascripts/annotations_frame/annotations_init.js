//= require jquery
//= require jquery_ujs
//= require turbolinks

var $j = jQuery.noConflict();
var instance;

$j(document).ready(function(){

  window.addEventListener("AnnotsCoordinatesInfo",function(evt){
    var start = evt.detail[0];
    var end = evt.detail[1];
    var flag = evt.detail[2];
    if(flag){
      var evtOut = document.createEvent("CustomEvent");
      evtOut.initCustomEvent("RangeInfo",true,true,[start,end]);
      top.document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtOut);
    }
    if(top.alignmentTranslation!=undefined && flag){
      var evtOut2 = document.createEvent("CustomEvent");
      var pdbPosList = top.getRangesFromTranslation(start,end,top.alignmentTranslation);
      evtOut2.initCustomEvent("RangeMolInfo",true,true,pdbPosList);
      top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut2);
    }
  });

  window.addEventListener("RangeFamInfo", function(evt){
    var start = evt.detail[0];
    var end = evt.detail[1];
    instance.__highlight({begin:start,end:end})
  });

  window.addEventListener("HideInfo", function(evt){
    document.getElementById('loading').style.display = "block";
    if( document.getElementById('snippetDiv') ) document.getElementById('snippetDiv').style.display = "none";
  });

  window.addEventListener("ShowInfo", function(evt){
    document.getElementById('loading').style.display = "none";
    if(document.getElementById('snippetDiv') ) document.getElementById('snippetDiv').style.display = "block";
  });


  var yourDiv = document.getElementById('snippetDiv');
  if( !yourDiv ) return;

  get_all_external_soruces();

  window.addEventListener("modelChange", function(evt){
    var fake_click = new MouseEvent("click");
    if (instance.selectedFeature){
      var start = instance.selectedFeature.begin;
      var end = instance.selectedFeature.end;
      var aux = {'begin':start,'end':end};
      update_interacting_residues( evt.detail[0] );
      update_asa_residues( evt.detail[0] );
      $j(".up_pftv_icon-reset").get(0).dispatchEvent(fake_click);
      instance.__highlight( aux );

      var evtOut = document.createEvent("CustomEvent");
      evtOut.initCustomEvent("RangeInfo",true,true,[start,end]);
      top.document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtOut);

      var evtOut2 = document.createEvent("CustomEvent");
      var pdbPosList = top.getRangesFromTranslation(start,end,top.alignmentTranslation);
      evtOut2.initCustomEvent("RangeMolInfo",true,true,pdbPosList);
      top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut2);

    }else{
      update_interacting_residues( evt.detail[0] );
      update_asa_residues( evt.detail[0] );
      $j(".up_pftv_icon-reset").get(0).dispatchEvent(fake_click);
    }
    
  });

  window.addEventListener("ResetInfo", function(evt){
    $j('.up_pftv_tooltip-container').css('visibility','hidden');
    if (instance.selectedFeature){
      var fake_click = new MouseEvent("click");
      if( document.getElementsByName( instance.selectedFeature.internalId ).lentgh>0){
        document.getElementsByName( instance.selectedFeature.internalId )[0].dispatchEvent(fake_click);
      }else{
        $j("[name="+instance.selectedFeature.internalId+"]").get(0).dispatchEvent(fake_click);
      }
      $j(".up_pftv_tooltip-close").get(0).dispatchEvent(fake_click);
    }
  });

});
