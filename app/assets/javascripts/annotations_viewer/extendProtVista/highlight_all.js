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
