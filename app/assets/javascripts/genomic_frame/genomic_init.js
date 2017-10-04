$j(window).load(function(){

  window.addEventListener("HideInfo", function(evt){
    document.getElementById('loading').style.display = "block";
    if( document.getElementById('genomic_div') ) document.getElementById('genomic_div').style.display = "none";
  });

  window.addEventListener("ShowInfo", function(evt){
    document.getElementById('loading').style.display = "none";
    if(document.getElementById('genomic_div') ) document.getElementById('genomic_div').style.display = "block";
  });

  build_genomic_display('#gfv');

  $j('.gfv_cb').change(function(){
    $j('#gfv').empty();
    build_genomic_display('#gfv');
  });

  $j('.show_gfv_display_variants').click(function(){
    $j('.gfv_display_variants').css('display','block');
  });

  $j('.gfv_display_variants_close').click(function(){
    $j('.gfv_display_variants').css('display','none');
  });

  add_top_window_listener();
});
