"use strict";
var highlight_all = require('./highlight_all');
var add_highlight_all = highlight_all.add_highlight_all;


var add_molprobity = function(){

  var $LOG = { 'protein':{}, 'gene':{}, 'interaction:':{} };
  if(top.$LOG){
    $LOG = top.$LOG;
  }

  var alignment = JSON.parse(getParameterByName("alignment"));
  var pdb = alignment['pdb'];
  if(!pdb){
      console.log("%c /compute/molprobity/<PDB> PDB code is null", 'color:red;');
      $LOG.protein['molprobity'] = {
        'description':'Computing ASA and binding sites data',
        'command':'GET '+interface_url,
        'status':'error',
        'error': '/compute/molprobity/<PDB> PDB code is null',
        'cost':'NA'
      };
      if("n_sources" in $LOG.protein){
        $LOG.protein['n_sources']--;
        if($LOG.protein['n_sources']==0)remove_loading_icon();
      }
    return;
  }
  var path = null;
  if('path' in alignment){
    path = alignment['path'];
  }
  if( top.$COMPUTED_FEATURES[pdb] && top.$COMPUTED_FEATURES[pdb]['molprobity'] ){

      var n_model = top.n_model_main_frame-1;
      var chain = JSON.parse(  getParameterByName('alignment') )['chain'];

      if( top.$COMPUTED_FEATURES[pdb]['molprobity'] ){
        var data = [];
        var rama;
        if( 'rama' in top.$COMPUTED_FEATURES[pdb]['molprobity'] ){
          rama = top.$COMPUTED_FEATURES[pdb]['molprobity']['rama'][n_model][chain]
        }
        if(rama && rama.length >0) data =  data.concat(rama);
        var omega;
        if( 'omega' in top.$COMPUTED_FEATURES[pdb]['molprobity'] ){
          omega = top.$COMPUTED_FEATURES[pdb]['molprobity']['omega'][n_model][chain]
        }
        if(omega && omega.length >0) data =  data.concat(omega);
        var rota;
        if( 'rota' in top.$COMPUTED_FEATURES[pdb]['molprobity']){
          rota= top.$COMPUTED_FEATURES[pdb]['molprobity']['rota'][n_model][chain]
        }
        if(rota && rota.length >0) data =  data.concat(rota);

        if(data && data.length >0){
          var molprobity = ["MOLPROBITY",data];
          feature_viewer.drawCategories([molprobity],feature_viewer);
          feature_viewer.data.push(molprobity);
          add_highlight_all();       
        }
      }

      if("n_sources" in $LOG.protein){
        $LOG.protein['n_sources']--;
        if($LOG.protein['n_sources']==0)remove_loading_icon();
      }

  }else{
    var url = "/compute/molprobity/"+pdb;
    if(path){
      url = "/compute/molprobity/"+path;
    }
    $LOG.protein['molprobity'] = {
      'description':'Computing ASA and binding sites data',
      'command':'GET '+url,
      'status':'running'
    };
    url = encodeURI(url);
    console.log("%c Loading "+url, 'color:#c60;');
    var t1 = performance.now();
    var recursive_get = function(){
      $j.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
          if(data['status']=='complete'){
            if(!top.$COMPUTED_FEATURES[pdb]) top.$COMPUTED_FEATURES[pdb] = {};
            top.$COMPUTED_FEATURES[pdb]['molprobity'] = data;
            var n_model = top.n_model_main_frame-1;
            var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
            var data =[];
            var rama = top.$COMPUTED_FEATURES[pdb]['molprobity']['rama'][n_model][chain]
            if(rama && rama.length >0) data =  data.concat(rama);
            var omega = top.$COMPUTED_FEATURES[pdb]['molprobity']['omega'][n_model][chain]
            if(omega && omega.length >0) data =  data.concat(omega);
            var rota= top.$COMPUTED_FEATURES[pdb]['molprobity']['rota'][n_model][chain]
            if(rota && rota.length >0) data =  data.concat(rota);
            if(data && data.length >0){
              var molprobity = ["MOLPROBITY",data];
              try{
                feature_viewer.drawCategories([molprobity],feature_viewer);
                feature_viewer.data.push(molprobity);
                add_highlight_all();
                $LOG.protein['molprobity']['status'] = 'success';
              }catch(err){
                console.log(err);
                $LOG.protein['molprobity']['status'] = 'error';
              }
            }
            var t2 = performance.now();
            var time_ = (t2-t1)/1000;
            $LOG.protein['molprobity']['cost'] = time_.toString().substring(0,4);
            console.log("%c Finished "+url+" "+time_.toString().substring(0,4)+"s", 'color:green;');
            if("n_sources" in $LOG.protein){
              $LOG.protein['n_sources']--;
              if($LOG.protein['n_sources']==0)remove_loading_icon();
            }
          }else if(data['status']=='error'){
            $LOG.protein['molprobity']['status'] = 'error';
            var t2 = performance.now();
            var time_ = (t2-t1)/1000;
            $LOG.protein['molprobity']['cost'] = time_.toString().substring(0,4);
            console.log("%c Finished "+url+" "+time_.toString().substring(0,4)+"s", 'color:red;');
            if("n_sources" in $LOG.protein){
              $LOG.protein['n_sources']--;
              if($LOG.protein['n_sources']==0)remove_loading_icon();
            }
          }else{
            setTimeout(function(){ recursive_get(); }, 5000);
          }
        },
        error: function(){
          $LOG.protein['molprobity']['status'] = 'error';
          var t2 = performance.now();
          var time_ = (t2-t1)/1000;
          $LOG.protein['molprobity']['cost'] = time_.toString().substring(0,4);
          console.log("%c Finished "+url+" "+time_.toString().substring(0,4)+"s", 'color:red;');
          if("n_sources" in $LOG.protein){
            $LOG.protein['n_sources']--;
            if($LOG.protein['n_sources']==0)remove_loading_icon();
          }
        }
      });
    }
    recursive_get();
  }
};

function remove_loading_icon(){
  $j("#annotations_loading_icon").remove();
}

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = add_molprobity;

