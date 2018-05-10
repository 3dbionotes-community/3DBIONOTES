"use strict";

class message_class {

  constructor( args ){
    var self = this;
    self.args = args;
  }
  
  show_message(id){
    $j(".ngl_loading").css('display','block');
    $j(".ngl_loading").html("LOADING <b style=\"color:black;\">"+id+"</b>" );
  }

  clear_message(){
    $j(".ngl_loading").css('display','none');
    $j(".ngl_loading").empty();
  }

  show_em_message(id){
    $j(".ngl_em_loading").css('display','block');
    $j(".ngl_em_loading").html( "LOADING <b style=\"color:black;margin-right:10px;\">"+id+"</b><img src=\"/images/loading_em.gif\" />" );
  }

  clear_em_message(){
    $j(".ngl_em_loading").css('display','none');
    $j(".ngl_em_loading").empty();
  }

}

module.exports = message_class;
