//= require jquery
var $j = jQuery.noConflict();

$j(document).ready(function(){
  $j( ".submit_form" ).submit(function( event ) {
    if( !$j("#structure_file").val() ){
      alert( "No file selected. Please select a coordinates file." );
      event.preventDefault();
    }else{
      $j( ".submit_form" ).css('display','none');
      $j( ".wait_div" ).css('display','block');
    }
  });

  $j( ".database_form" ).submit(function( event ) {
    if( !$j("#queryId").val() ){
      alert( "MISSING ID" );
      event.preventDefault();
    }else{
      $j( ".database_form" ).css('display','none');
      $j( ".wait_div" ).css('display','block');
    }
  });

});

