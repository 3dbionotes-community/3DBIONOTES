$j(window).load(function(){
  window.addEventListener("GeneRange", function(evt){
    var start = evt.detail[0];
    var end = evt.detail[1];
    var p_start = __genomic_alignment.transcript.alignment.u2p[start];
    var p_end = __genomic_alignment.transcript.alignment.u2p[end];
    var strand = __genomic_alignment.gene.strand;
    var g_start;
    var g_end;
    if(strand > 0){
      g_start = Math.min.apply( null, __genomic_alignment.transcript.alignment.p2g[p_start] );
      g_end = Math.max.apply( null, __genomic_alignment.transcript.alignment.p2g[p_end] );
    }else{
      g_start = Math.min.apply( null, __genomic_alignment.transcript.alignment.p2g[p_end] );
      g_end = Math.max.apply( null, __genomic_alignment.transcript.alignment.p2g[p_start] );
    }
    ft.__highlight(g_start,g_end)
  });

  window.addEventListener("HideInfo", function(evt){
    console.log("######");
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
});
