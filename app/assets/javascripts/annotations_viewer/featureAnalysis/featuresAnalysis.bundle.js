require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function add_highlight_all(){
  $j(".up_pftv_track-header").each(function(i){
    if( $j( $j(".up_pftv_track-header").get(i) ).children(".highlight_all").length == 0 && $j( $j(".up_pftv_track-header").get(i) ).children(".up_pftv_buttons").length == 0 ){
      var text =  $j( $j(".up_pftv_track-header").get(i) ).html();
      $j( $j(".up_pftv_track-header").get(i) ).html("<span style=\"cursor:pointer;\" class=\"highlight_all\">"+text+"</span>");

      $j( $j(".up_pftv_track-header").get(i) ).children(".highlight_all").mouseover(function(){
        $j(this).css('color','#1293B3');
        $j(this).append('<span class=\"nbsp\">&nbsp;</span><span class=\"fa fa-eye\"></span>');
      });

      $j( $j(".up_pftv_track-header").get(i) ).children(".highlight_all").mouseout(function(){
        $j(this).css('color','');
        $j(this).children('.fa-eye').remove();
        $j(this).children('.nbsp').remove();
      });

      $j( $j(".up_pftv_track-header").get(i) ).children(".highlight_all").click(function(){
        var track = $j( this ).parent().parent().parent().find(".up_pftv_category-name").attr("title");
        var features = $j.grep( feature_viewer.data, function( n, i){
          if(n[0]==track)return true;
          return false;
        })[0][1];
        var lane = $j( this ).parent().next().find(".up_pftv_feature");
        var display = []
        lane.each(function(i){
          var name = $j(lane.get(i)).attr("name");
          var color = $j(lane.get(i)).css("fill");
          var grep = $j.grep( features, function(n,i){
            if(n['internalId'] == name)return true;
            return false;
          })[0];
          grep['color'] = color;
          if(grep['type']=="DISULFID"){
            display.push({begin:grep['begin'],end:grep['begin'],color:grep['color']});
            display.push({begin:grep['end'],end:grep['end'],color:grep['color']});
          }else{
            display.push(grep);
          }
        });
        trigger_event(display);
      });
    }
  });

}

function trigger_event(selection){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("highlight_all",true,true,selection);
  top.window.dispatchEvent(evt);
}

module.exports = {add_highlight_all:add_highlight_all};

},{}],2:[function(require,module,exports){
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
      out.push({begin:i['begin'], end:i['end'], type:i['type'], internalId:'contingency_'+n});
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

},{"../extendProtVista/highlight_all":1}],3:[function(require,module,exports){
"use strict";

var format_analysis_view = function(){
  $j("#molTitle").css("visibility","visible");
  $j("#snippetDiv").css("visibility","visible");
  $j("#local_loading").remove();
  if(disease_menu.length == 0){
    $j(".body_div").html("<div class=\"no_relation\">NONE SIGNIFICANT RELATION BETWEEN VARIANTS AND OTHER FEATURES WAS FOUND</div>");
    return;
  }
  $j("up_pftv_category-container").css("border-top","");
  var N = $j(".up_pftv_category").length-1;
  $j(".up_pftv_category-container").css("border",0)
  var d_n = 0;
  $j(".up_pftv_category").each(function(k,v){
    if((k==0 || k%2==0) && k<N){
      var style="";
      if(k==0)style = "style=\"margin-top:0px;\"";
      var header = filter_header(disease_menu[d_n]['annotation']);
      $j(v).children("a").html( header );
      $j(v).parent().prepend("<div class=\"contingency_header\" "+style+"><div>VARIANTS FOUND IN "+header+"</div></div>");
      $j(v).css("border-top",".1em solid #b2f5ff");
    }else if(k<N){
      $j(v).children("a").html("VARIANTS");
      add_disease_menu(d_n,k);
      d_n++;
    }
    $j(v).css("border-right",".1em solid #b2f5ff");
  });
  $j('.disease_item').click(function(){show_coocur(this)});
  $j(".up_pftv_keepWithPrevious").parent().each(function(n,e){
    $j(e).children("h4").remove();
    $j(e).children("ul").remove();
  });
}

function filter_header(name){
  var out = name.toUpperCase();
  if(out.includes("NP_BIND")){
    out = "NUCLEOTIDE BINDING SITES";
  }else if(out.includes("DISULFID")){
    out = "DISUFIDE BONDS";
  }
  return out;
}

function add_disease_menu(d_n,k){
  var $div = $j( $j(".up_pftv_track-header").get(k) );
  $div.append("<div class=\"up_pftv_diseases\" style=\"display:block;top:0px;position:relative;\"><h4>Diseases</h4><div id=\"disease_menu_"+d_n+"\"></div></div>");
  for(var d in disease_menu[d_n]['variants']){
    $j( "#disease_menu_"+d_n ).append("<span class=\"disease_item unactive_disease\" title=\""+d+"\" index=\""+d_n+"\">&#9675; "+d+"</span>");
    $j( "#disease_menu_"+d_n ).append("<div style=\"font-size:9px;\">FISHER EXACT TEST</div>");
    $j( "#disease_menu_"+d_n ).append("<div class=\"disease_stats\">"+include_stats_table(disease_menu[d_n]['variants'][d]['stats'])+"</div>");
  }
}

function include_stats_table(test){
  var table = "<table>";
  var p_val = test['p_value'].toExponential(2);
  table += "<tr><td>p-value</td><td>"+p_val+"</td></tr>";
  table += "<tr><td>#variants</td><td>"+(test['m_ij']+test['m_j'])+"</td></tr>";
  table += "<tr><td>#interesct</td><td>"+test['m_ij']+"</td></tr>";
  table += "</table>";
  return table;
}

function show_coocur(d){
  if(d){
    var k = $j(d).attr("title");
    if( $j(d).hasClass("unactive_disease") ){
      $j(d).removeClass("unactive_disease");
      $j(d).addClass("active_disease");
      $j(d).html("&#9679; "+k);
    }else if( $j(d).hasClass("active_disease") ){
      $j(d).removeClass("active_disease");
      $j(d).addClass("unactive_disease");
      $j(d).html("&#9675; "+k);
    }
  }
  
  var D = [];
  $j('.active_disease').each(function(){
    D.push( [$j(this).attr('title'),$j(this).attr('index')] );
  });
  var $track = $j(d).parent().parent().parent().parent().children(".up_pftv_track");
  filter_by_disease_name( D, $track );

}

function filter_by_disease_name( D, $track ){
  update_diseases = function(){
    _filter_by_disease_name( D, $track );
  }
  my_variant_viewer.reset();
}

function _filter_by_disease_name( D, $track ){
  if( D.length == 0 ) return;
  var keep_variants = {}
  D.forEach( function(i){
    disease_menu[ i[1] ]['variants'][ i[0] ]["aa"].forEach(function(j){
      keep_variants[ j ] = true;
    });
  });
  $track.find('.up_pftv_variant').each(function(i,e){
    if(!keep_variants[ $j(e).attr("name") ])$j(e).remove();
  });
}

module.exports = format_analysis_view;

},{}],4:[function(require,module,exports){
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

},{"./add_analysis_data":2,"./format_analysis_view":3}],"featuresAnalysis":[function(require,module,exports){
"use strict";

var get_features_analysis = require("./get_features_analysis");

module.exports = get_features_analysis;


},{"./get_features_analysis":4}]},{},[]);
