
function add_top_window_listener(){

  window.addEventListener("select_aa", function(evt){
    var selection = evt.detail;

    var start = selection.begin;
    var end = selection.end;
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

  window.addEventListener("clear_aa", function(evt){
    clear_selection();
  });

}

function trigger_aa_selection(selection){
  var selection = selection;
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_selected",true,true,selection);
  top.window.dispatchEvent(evt);
}

function trigger_aa_cleared(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_cleared",true,true,"genomicFrame");
  top.window.dispatchEvent(evt);
}

function check_global_selection(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("check_global_selection",true,true,"genomicFrame");
  top.window.dispatchEvent(evt);
}


