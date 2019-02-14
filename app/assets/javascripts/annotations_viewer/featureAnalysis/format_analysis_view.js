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
  var $reset = $div.children(".up_pftv_buttons").children(".up_pftv_inner-icon-container").children(".up_pftv_icon-reset");
  $reset.click(function(i){
    var $active = $div.find(".active_disease");
    $active.each(function(i,e){
      $j(e).removeClass("active_disease");
      $j(e).addClass("unactive_disease");
      var disease = $j(e).html();
      disease = "&#9675;"+disease.substr(1);
      $j(e).html(disease);
    });
    var $track = $div.parent().children(".up_pftv_track");
    filter_by_disease_name( [], $track );
  });
  $div.append("<div class=\"up_pftv_diseases\" style=\"display:block;top:0px;position:relative;\"><h4>Diseases</h4><div id=\"disease_menu_"+d_n+"\"></div></div>");
  var keys = Object.keys(disease_menu[d_n]['variants']);
  keys.sort();
  //for(var d in disease_menu[d_n]['variants']){
  keys.forEach(function(d){
    $j( "#disease_menu_"+d_n ).append("<span class=\"disease_item unactive_disease\" title=\""+d+"\" index=\""+d_n+"\">&#9675; "+d+"</span>");
    $j( "#disease_menu_"+d_n ).append("<div style=\"font-size:9px;\">FISHER EXACT TEST</div>");
    $j( "#disease_menu_"+d_n ).append("<div class=\"disease_stats\">"+include_stats_table(disease_menu[d_n]['variants'][d]['stats'])+"</div>");
  });
}

function include_stats_table(test){
  var table = "<table>";
  var p_val = test['p_value'].toExponential(2);
  table += "<tr><td>p-value</td><td>"+p_val+"</td></tr>";
  table += "<tr><td>#features</td><td>"+(test['m_l'])+"</td></tr>";
  table += "<tr><td>#variants</td><td>"+(test['m_ij']+test['m_j'])+"</td></tr>";
  table += "<tr><td>#co-occur</td><td>"+test['m_ij']+"</td></tr>";
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
  if( D.length == 0 ){ 
    $track.find('.up_pftv_variant').each(function(i,e){
      $j(e).css('opacity',1);
    });   
    return;
  }
  var keep_variants = {}
  D.forEach( function(i){
    disease_menu[ i[1] ]['variants'][ i[0] ]["aa"].forEach(function(j){
      keep_variants[ j ] = true;
    });
  });
  $track.find('.up_pftv_variant').each(function(i,e){
    if(!keep_variants[ $j(e).attr("name") ]){
      $j(e).css('opacity',0);
    }else{
      $j(e).css('opacity',1);
    }
  });
}

module.exports = format_analysis_view;
