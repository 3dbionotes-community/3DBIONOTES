"use strict";
var handle_async_data = require('./handle_async_data');
var add_psa_interface = require('./add_psa_interface');
//var add_molprobity = require('./add_molprobity');

var listURL;
var $EXTERNAL_DATA = null;

if(top.$EXTERNAL_DATA && !imported_flag){
  $EXTERNAL_DATA = top.$EXTERNAL_DATA;
}else if(top.$IMPORTED_DATA && imported_flag){
  $EXTERNAL_DATA = top.$IMPORTED_DATA;
}else{
  $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
}

var $LOG = { 'protein':{}, 'gene':{}, 'interaction:':{} };
if(top.$LOG){
  $LOG = top.$LOG;
}


function get_async_data( URL, d ){
  var query = URL.shift();

  var url = query[1];
  var key = query[0];
  var save_flag = query[2];

  var acc = __alignment.uniprot;
  var external_data_key = 'acc';
  if(!save_flag){
    acc = key;
    key = __alignment.pdb+":"+__alignment.chain;
    external_data_key = 'PDBchain';
  }

  if( key in $EXTERNAL_DATA[external_data_key] && acc in $EXTERNAL_DATA[external_data_key][key] ){
    var async_data = $EXTERNAL_DATA[external_data_key][key][acc];
    if(key in handle_async_data)handle_async_data[key](async_data);
    if("n_sources" in $LOG.protein){
      $LOG.protein['n_sources']--;
      if($LOG.protein['n_sources']==0)remove_loading_icon();
    }
    if(URL.length > 0){
      get_async_data(URL);
      return;
    }
  }else{
    $LOG.protein[key] = {
      'description':'Loading '+key.toUpperCase(),
      'command':'GET '+url,
      'status':'running'
    };
    var t1 = performance.now();
    console.log("%c Loading "+url, 'color:#c60;');
    $j.ajax({
      url: url,
      dataType: 'json',
      timeout:30000,
      success: function(async_data){
        if( !(key in $EXTERNAL_DATA[external_data_key]) )$EXTERNAL_DATA[external_data_key][key] = {};
        if(save_flag){
          $EXTERNAL_DATA[external_data_key][key][acc] = async_data;
          if(key in handle_async_data) handle_async_data[key](async_data);
        }else{
          if(acc in handle_async_data) handle_async_data[acc](async_data,key,$EXTERNAL_DATA[external_data_key]);
        }
        $LOG.protein[key]['status'] = 'success';
      },
      error: function(e){
        console.log("ajax error");
        console.log(e);
        $LOG.protein[key]['status'] = 'error';
      }
    }).always(function(){
      if(URL.length > 0){
        get_async_data( URL, d );
      }
      var t2 = performance.now();
      var time_ = (t2-t1)/1000;
      $LOG.protein[key]['cost'] = time_.toString().substring(0,4);
      console.log("%c Finished "+url+" "+time_.toString().substring(0,4)+"s", 'color:green;');
      if("n_sources" in $LOG.protein){
        $LOG.protein['n_sources']--;
        if($LOG.protein['n_sources']==0)remove_loading_icon();
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


var get_all_async_soruces = function(){
  var acc = __accession;
  var key = __alignment.pdb+":"+__alignment.chain;

  add_loading_icon();
  $LOG.protein['n_sources'] = asyncURL.length;

  listURL = asyncURL;
  var __allURL = listURL.slice(0);
  if(!imported_flag){
    $LOG.protein['n_sources'] += 2;
    add_psa_interface();
    //add_molprobity();
  }
  get_async_data(__allURL, __external_data);
};

module.exports = get_all_async_soruces;
