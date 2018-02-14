var $ALIGNMENTS = {};
var $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
var $GENOMIC_DATA = {'acc':{}};
var n_model_main_frame = 1;
var global_infoAlignment = null;

var $IMPORTED_DATA = { 'PDBchain':{},'acc':{}, 'sequence_similars':{} };
var global_imported_alignment = null;

var $UPLOADED_DATA = { 'PDBchain':{}, 'acc':{} };
var upload_flag = false;

var $CUSTOM_TRACKS = {};

var $COMPUTED_FEATURES = {};

var $LOG = { 'protein':{}, 'gene':{}, 'interaction:':{} };

var global_selection =  null;
var $j = jQuery.noConflict();

$j(document).ready(function(){
  $j('#chanceSlider').on('change', function(){
    var myVal = $j('#chanceSlider').val();
    $j('#chance').html(myVal);
    var evtSlider = document.createEvent("CustomEvent");
    evtSlider.initCustomEvent("ThresholdInfo",true,true,myVal);
    document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtSlider);
  });

  $j('#chanceSlider').on('input', function(){
    var myVal = $j('#chanceSlider').val();
    $j('#chance').html(myVal);
  });

  window.document.addEventListener("modelChange", function(evt){
    n_model_main_frame = evt.detail[0];
    $j('#current_model').text( evt.detail[0] );
  });
  
  $j('.icon-ccw').click(function(){
    resetEvent();
  });

  $j('.icon-light-up').click(function(){
    addAtomsEvent(this);
  });

  $j('.icon-eye-off').click(function(){
    toggleHeteroEvent(this);
  });

  $j('.icon-left-bold').click(function(){
    model(0);
  });

  $j('.icon-right-bold').click(function(){
    model(1);
  });

  $j('.icon-target').click(function(){
    keep_selection();
  });

  $j('.icon-th-list').click(function(){
    label_display();
  });

  $j('.icon-camera').click(function(){
    takeScreenshot();
  });

  $j('.icon-box').click(function(){
    toggleVolumeEvent(this);
  });

  $j('#import_similars').click(function(){
    import_similars();
    hide_tools();
  });

  $j('#upload_annotations').click(function(){
    display_upload_form();
    hide_tools();
  });

  $j('#delete_features').click(function(){
    display_remove_tree();
    hide_tools();
  });

  $j('#topnav2').mouseover(function(){
    remove_all_panel_menu();
    $j('#upRightBottomFrame').css('visibility','visible');
  });

  $j('#topnav3').mouseover(function(){
    remove_all_panel_menu();
    $j('#upRightBottomFrame').css('visibility','visible');
  });

  $j('#proteomic_view').click(function(){
    change_view("#proteomic_panel");    
  });

  $j('#genomic_view').click(function(){
     change_view("#genomic_panel");   
  });

  $j('#ppi_view').click(function(){
     change_view("#ppi_panel");   
     if(!top.ppiFrame_vissible){
       var evtOut = document.createEvent("CustomEvent");
       evtOut.initCustomEvent("ppiFrame_vissible",true,true,"ppi_panel:click");
       top.document.getElementById("ppiFrame").contentWindow.dispatchEvent(evtOut);
       top.ppiFrame_vissible = true;
     }
  });

  add_frames_listener();

});
