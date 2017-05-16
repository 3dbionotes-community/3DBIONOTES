var $j = jQuery.noConflict();

var sequence_panel;
$j(document).ready(function(){

  window.addEventListener("HideInfo", function(evt){
    document.getElementById('loading').style.display = "block";
    document.getElementById('mainFrames').style.display = "none";
  });

  window.addEventListener("ShowInfo", function(evt){
    document.getElementById('loading').style.display = "none";
    document.getElementById('mainFrames').style.display = "block";
  });

  add_top_window_listener(); 
});
