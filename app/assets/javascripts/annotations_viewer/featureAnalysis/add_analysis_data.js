"use strict";

var add_analysis_data = {};
var highlight_all = require('../extendProtVista/highlight_all');
var add_highlight_all = highlight_all.add_highlight_all;

add_analysis_data.contingency = function(data){
  if(__alignment.origin != "Uniprot"){
    add_analysis(data['features'][__alignment.chain], data['analysis'][__alignment.chain]);
  }else{
    add_analysis(data['features'], data['analysis']);
  }
}

var disease_menu = [];

function add_analysis(features,analysis){
  var n = 1;
  var m = 0;
  for(var h in analysis){
    var out = [];
    features[h].forEach(function(i){
      filter_type(i);
      var x = {begin:i['begin'], end:i['end'], type:i['type'], internalId:'contingency_'+n};
      if(i['color']){
        x['color'] = i['color'];
      }
      out.push(x);
      n++;
    });
    feature_viewer.drawCategories([[h,out]],feature_viewer);
    add_highlight_all();
    feature_viewer.data.push([h,out]);
    disease_menu[m] = {'variants':{}, 'annotation':h};

    var seq = [];
    for(var i = 0;i<__alignment.uniprotLength+1;i++){
      var __f = { type: "VARIANT", pos: i, variants: [] };
      seq.push(__f);
    }
    for (var v in analysis[h]){
      if( !(v in disease_menu[m]) )disease_menu[m]['variants'][v]={'aa':[], 'stats':{}};
      features[v].forEach(function(i){
        disease_menu[m]['variants'][v]['stats']=analysis[h][v]['fisher'];
        disease_menu[m]['variants'][v]['stats']['m_ij'] = analysis[h][v]['m_ij'];
        disease_menu[m]['variants'][v]['stats']['m_i'] = analysis[h][v]['m_i'];
        disease_menu[m]['variants'][v]['stats']['m_j'] = analysis[h][v]['m_j'];
        disease_menu[m]['variants'][v]['stats']['m_o'] = analysis[h][v]['m_o'];
        disease_menu[m]['variants'][v]['stats']['m_l'] = analysis[h][v]['m_l'];
        var color="#FF0000";
        if(analysis[h][v]['neg_aa'][i['begin'] ])color="#CCCCCC";
        var aux = jQuery.grep(seq[ i.begin ]['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
        if(seq[ i.begin ] && aux.length == 0){
          seq[ i.begin ].variants.push({
            type: "VARIANT",
            sourceType:"large_scale_study",
            wildType: i['original'],
            alternativeSequence:i['variation'],
            begin:i['begin'],
            end:i['begin'],
            association:[{disease:true,name:v,xref:[]}],
            color:color
          });
          disease_menu[m]['variants'][v]["aa"].push("var_"+i['original']+i.begin+i['variation'])
        }else{
          var flag = jQuery.grep( aux[0].association, function(j){return(j.name==v)} );
          if(flag.length==0) aux[0].association.push({disease:true,name:v,xref:[]});
          disease_menu[m]['variants'][v]["aa"].push( "var_"+aux[0]['wildType']+aux[0]['begin']+aux[0]['alternativeSequence'] );
        }
      });
    }
    
    feature_viewer.drawCategories([["Contingency "+h, seq, {visualizationType:"variant"}]],feature_viewer);
    feature_viewer.data.push(["Contingency "+h, seq]);
    m++;
  }
  return out;
}

function filter_type(i){
  var i_t = i['type'].toLowerCase();

  if( i_t.indexOf("methyl")>-1 ){
          i['type'] = 'MOD_RES_MET';
  }else if( i_t.indexOf("acetyl")>-1 ){
          i['type'] = 'MOD_RES_ACE';
  }else if( i_t.indexOf("crotonyl")>-1 ){
          i['type'] = 'MOD_RES_CRO';
  }else if( i_t.indexOf("citrul")>-1 ){
          i['type'] = 'MOD_RES_CIT';
  }else if( i_t.indexOf("phospho")>-1 ){
          i['type'] = 'MOD_RES_PHO';
  }else if( i_t.indexOf("ubiq")>-1 ){
          i['type'] = 'MOD_RES_UBI';
  }else if( i_t.indexOf("sumo")>-1 ){
          i['type'] = 'MOD_RES_SUM';
  }else if( i_t.indexOf("glcnac")>-1 ){
          i['type'] = 'CARBOHYD';
  }else if( i_t.indexOf("disulfid")>-1 ){
          i['type'] = 'DISULFID';
  }else if( i_t.indexOf("RIBOSYLA")>-1){
          i['type'] = 'RIBOSYLATION';
  }else if( i_t.indexOf("lip")>-1){
          i['type'] = 'linear_motif';
  }
}

module.exports = {add_analysis_data:add_analysis_data,disease_menu:disease_menu};
