function build_sequence_viewer( uniprotSeq, pdbSeq ){
  $j(document).ready(function(){
    var columns_format = { size: 70, spacedEach: 5 };
    var body_width = $j(body).width();
    if(body_width<900) columns_format.size = 60;
    if(body_width<750) columns_format.size = 50;
    sequence_panel = new Biojs.Sequence_alignment({
      sequence : uniprotSeq,
      seq_alig : pdbSeq,
      columns: columns_format,
      target : "seq_div"
    });
    sequence_panel.onSelectionChanged(function(elem){
      var evt = document.createEvent("CustomEvent");
      evt.initCustomEvent("SequenceCoordinates",true,true,[elem.start+1,elem.end+1]);
      body.dispatchEvent( evt );
      sequence_panel.setSelection( elem.start,elem.end );
      var divSelected = "#0_"+(elem.start-1);
      $j(body).scrollTop($j(divSelected).offset().top);
    });
  });
}
