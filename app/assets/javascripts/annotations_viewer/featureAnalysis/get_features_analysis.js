"use strict";

var analyser = require("./add_analysis_data");
var add_analysis_data = analyser.add_analysis_data;
var disease_menu = analyser.disease_menu; 
var format_analysis_view = require("./format_analysis_view");

var $EXTERNAL_DATA = null;

if(top.$EXTERNAL_DATA && !imported_flag){
  $EXTERNAL_DATA = top.$EXTERNAL_DATA;
}else if(top.$IMPORTED_DATA && imported_flag){
  $EXTERNAL_DATA = top.$IMPORTED_DATA;
}else{
  $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
}

var $LOG = { 'protein':{}, 'gene':{}, 'interaction:':{}, 'analysis':{} };
if(top.$LOG){
  $LOG = top.$LOG;
}


function get_analysis_data( URL ){
  var query = URL.shift();

  var id = query[0];
  var url = query[1];
  var key = query[2]
  var acc_or_pdb_flag = query[3];

  var external_data_key;
  var acc;

  if( acc_or_pdb_flag == "pdb" ){
    acc = __alignment.pdb+":"+__alignment.chain;
    external_data_key = 'PDBchain';
  }else if(acc_or_pdb_flag == "acc" ){
    acc = __alignment.uniprot
    external_data_key = "acc";
  }

  if( key in $EXTERNAL_DATA[external_data_key] && acc in $EXTERNAL_DATA[external_data_key][key] ){
    var async_data = $EXTERNAL_DATA[external_data_key][key][acc];

    if("n_sources" in $LOG.analysis){
      $LOG.analysis['n_sources']--;
      if($LOG.analysis['n_sources']==0)remove_loading_icon();
    }
    if(URL.length > 0){
      get_analysis_data(URL);
      return;
    }else{
      format_analysis_view();
    }
  }else{
    $LOG.analysis[key] = {
      'description':'Loading '+key.toUpperCase(),
      'command':'GET '+url,
      'status':'running'
    };
    var t1 = performance.now();
    console.log("%c Loading "+url, 'color:#c60;');
    var data = {};
    if(top.upload_flag){
      data = {'annotations':top.uploaded_annotations.result};
    }
    $j.ajax({
      data:data,
      type: "POST",
      url: url,
      dataType: 'json',
      timeout:30000,
      success: function(async_data){
        if( !(key in $EXTERNAL_DATA[external_data_key]) )$EXTERNAL_DATA[external_data_key][key] = {};
        $EXTERNAL_DATA[external_data_key][key][acc] = async_data;
        add_analysis_data[key](async_data);
        $LOG.analysis[key]['status'] = 'success';
      },
      error: function(e){
        console.log("ajax error");
        console.log(e);
        $LOG.analysis[key]['status'] = 'error';
      }
    }).always(function(){
      if(URL.length > 0){
        get_async_data( URL, d );
      }else{
        format_analysis_view();
      }
      var t2 = performance.now();
      var time_ = (t2-t1)/1000;
      $LOG.analysis[key]['cost'] = time_.toString().substring(0,4);
      console.log("%c Finished "+url+" "+time_.toString().substring(0,4)+"s", 'color:green;');
      if("n_sources" in $LOG.analysis){
        $LOG.analysis['n_sources']--;
        if($LOG.analysis['n_sources']==0)remove_loading_icon();
      }
    });
  }
}

function add_loading_icon(){
  $j($j(".up_pftv_buttons").get(0)).prepend("<img title=\"LOADING DATA\" id=\"annotations_loading_icon\"src=\"/images/loading_em.gif\" style=\"cursor:help;position:absolute;left:10px;top:10px;\"/>");
}

function remove_loading_icon(){
  $j("#annotations_loading_icon").remove();
}


var get_features_analysis = function(){
  if(!'analysis' in $LOG)$LOG['analysis']={};
  var _allURL = feature_analysis_url.slice(0);
  add_loading_icon();
  $LOG.analysis['n_sources'] = _allURL.length;
  get_analysis_data( _allURL );
};

module.exports = {get_features_analysis:get_features_analysis,disease_menu:disease_menu};
