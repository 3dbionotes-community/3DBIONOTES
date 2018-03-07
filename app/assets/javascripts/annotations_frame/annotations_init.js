//= require jquery
//= require jquery_ujs
//= require turbolinks

var $j = jQuery.noConflict();
var instance;

$j(document).ready(function(){

  window.addEventListener("HideInfo", function(evt){
    $j("#add_feature_button").remove();
    document.getElementById('loading').style.display = "block";
    if( document.getElementById('snippetDiv') ) document.getElementById('snippetDiv').style.display = "none";
    if( document.getElementById('molTitle') ) document.getElementById('molTitle').style.display = "none";

  });

  window.addEventListener("ShowInfo", function(evt){
    document.getElementById('loading').style.display = "none";
    if(document.getElementById('snippetDiv') ) document.getElementById('snippetDiv').style.display = "block";
    if(document.getElementById('molTitle') ) document.getElementById('molTitle').style.display = "block";
  });


  var yourDiv = document.getElementById('snippetDiv');
  if( !yourDiv ) return;

  get_all_external_soruces();

  window.addEventListener("modelChange", function(evt){
    var fake_click = new MouseEvent("click");
    if (instance.selectedFeature){
      var begin = instance.selectedFeature.begin;
      var end = instance.selectedFeature.end;
      if(imported_flag){
        var X = put_imported_range(begin,end);
        begin =  X[0];
        end = X[1];
      }
      var color = $j("[name="+instance.selectedFeature.internalId+"]").css("fill");

      update_interacting_residues( evt.detail[0] );
      update_asa_residues( evt.detail[0] );
      $j(".up_pftv_icon-reset").get(0).dispatchEvent(fake_click);

      var selection = {begin:begin, end:end, color:color, frame:"none" };
      trigger_aa_selection(selection);
    }else{
      update_interacting_residues( evt.detail[0] );
      update_asa_residues( evt.detail[0] );
      $j(".up_pftv_icon-reset").get(0).dispatchEvent(fake_click);
    }
  });

  add_top_window_listener();
});
