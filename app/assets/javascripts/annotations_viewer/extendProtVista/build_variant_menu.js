"use strict";

var variant_menu = function (){
  $j('.up_pftv_icon-location').remove();
  $j('.up_pftv_inner-icon-container a').css('cursor','pointer');
  $j('.up_pftv_inner-icon-container a').click(function(i){
    $j('.active_disease').each(function(i){
      $j(this).removeClass("active_disease");
      $j(this).addClass("unactive_disease");
      var k = $j(this).attr("title");
      $j(this).html("&#9675; "+k);
      my_variant_viewer.reset();
    });
  });
  $j('.up_pftv_inner-icon-container a').before("<a class=\"up_pftv_icon-button up_pftv_icon-location variant_std_menu\" style=\"cursor:pointer;\" title=\"Change filter: disease/cosequence\"></a>");
  $j(".variant_std_menu").click(function(i){
    if( $j(this).hasClass("variant_std_menu") ){
      $j(this).removeClass("variant_std_menu");
      $j(this).addClass("variant_disease_menu");
      $j(".up_pftv_diseases").css("display","inline-block");
    }else if( $j(this).hasClass("variant_disease_menu") ){
      $j(this).removeClass("variant_disease_menu");
      $j(this).addClass("variant_std_menu");
      $j('.active_disease').each(function(i){
        $j(this).removeClass("active_disease");
        $j(this).addClass("unactive_disease");
        var k = $j(this).attr("title");
        $j(this).html("&#9675; "+k);
      });
      my_variant_viewer.reset();
      $j(".up_pftv_diseases").css("display","none");
    }
  });
  $j('.up_pftv_track-header').css('position','relative')
  $j('.up_pftv_track-header').append("<div class=\"up_pftv_diseases\"><h4>Diseases</h4><div></div></div>");
  Object.keys(diseases_table).sort().forEach(function(k){
    if(k!="none")$j('.up_pftv_diseases div').append("<span class=\"disease_item unactive_disease\" title=\""+k+"\">&#9675; "+k+"</span><br/>");
  });
  $j('.disease_item').click(function(){show_diseases(this)});
};

var update_diseases = function(){
  var D = [];
  $j('.active_disease').each(function(){
    D.push( $j(this).attr('title') );
  }); 
  if( D.length == 0 ) return;
  var keep_variants = {}
  D.forEach( function(i){
    diseases_table[i].forEach(function(j){
      keep_variants[ j.internalId ] = true;
    });
  });
  $j('.up_pftv_variant').each(function(i){
    if(!keep_variants[ $j(this).attr("name") ])$j(this).remove();
  });
};

function show_diseases(d){
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
    D.push( $j(this).attr('title') );
  });
  filter_by_disease( D );

}

var add_disease_menu = function(__d){
  var d = __d[0][1]; 
  d.forEach(function(i){
    i.variants.forEach(function(j){
      if(j.association){
        j.association.forEach(function(k){
          if(!diseases_table[k.name]) diseases_table[k.name]=[];
          diseases_table[k.name].push(j);
        });
      }else{
        diseases_table['none'].push(j);
      }
    });
  });
};

function filter_by_disease( D ){
  my_variant_viewer.reset();
  if( D.length == 0 ) return;
  var keep_variants = {}
  D.forEach( function(i){
    diseases_table[i].forEach(function(j){
      keep_variants[ j.internalId ] = true;
    });
  });
  $j('.up_pftv_variant').each(function(i){
    if(!keep_variants[ $j(this).attr("name") ])$j(this).remove();
  });
}

module.exports = { variant_menu:variant_menu, update_diseases:update_diseases, add_disease_menu:add_disease_menu };
