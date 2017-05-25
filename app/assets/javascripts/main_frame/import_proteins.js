
function import_similars(){
  $j('#upRightBottomFrame').css('visibility','hidden');
  $j('body').append("<div id=\"similar_targets\"><div class=\"close\">CLOSE</div><table></table><div style=\"margin-top:25px;\">IMPORTING SIMILAR PROTEINS<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div></div>");
  $j('div#similar_targets div.close').click(function(){
    clear_targets();
  });
  if( $IMPORTED_DATA[ 'sequence_similars' ][ global_infoAlignment.uniprot ] ){
    display_targets($IMPORTED_DATA[ 'sequence_similars' ][ global_infoAlignment.uniprot ]);
  }else{
    var starts = new Date().getTime();
    var  myUrl = "/compute/sequence_similars/"+global_infoAlignment.uniprot;
    $j.ajax({
      url: myUrl,
      dataType: 'json',
      data: {},
      success: function(data){
        $IMPORTED_DATA[ 'sequence_similars' ][ global_infoAlignment.uniprot ] = data;
        display_targets(data);
      },
      error: function(data){
        console.log("JQuery ajax error");
      },
    }).done(function(){
      var ends = new Date().getTime();
      var total_time = (ends-starts)/1000;
      console.log( myUrl+" - "+total_time+"s" );
    });
  }
} 

function clear_targets(){
  $j('#upRightBottomFrame').css('visibility','visible');
  $j("#similar_targets").remove();
}

function display_targets(data){
  $j("#similar_targets").html('');
  $j("#similar_targets").append("<div class=\"close\">CLOSE</div><div><table></table></div>");
  $j('div#similar_targets div.close').click(function(){
    clear_targets();
  });
  var th = "<th>SYMBOL</th>"+"<th>GENE NAME</th>"+"<th>ORGANISM NAME</th>"+"<th>UNIPROT ACC</th>"+"<th># ANNOTATIONS</th>"+"<th>SEQUENCE ID</th>";
  var tr = "<tr>"+th+"</tr>";
  $j("#similar_targets div table").append(tr);
  var acc_data  = {};
  data.forEach(function(d){
    acc_data[ d['acc'] ] = d;
    var row = "<td>"+d['title']['gene']+"</td>"+"<td title=\""+d['title']['name']['long']+"\">"+d['title']['name']['long']+"</td>"+"<td title=\""+d['title']['org']['long']+"\">"+d['title']['org']['long']+"</td>"+"<td><a target=\"_blank\" href=\"http://www.uniprot.org/uniprot/"+d['acc']+"\">"+d['acc']+"</a></td>"+"<td>"+d['N']+"</td>"+"<td>"+d['cov']+"</td>";
    var color = "";
    if( $IMPORTED_DATA['PDBchain'][global_infoAlignment['pdb']+":"+global_infoAlignment['chain']+":"+d['acc']] ) color="style=\"color:#BBBBBB;\"";
    var tr = "<tr "+color+" id=\""+d['acc']+"\" class=\"import_annotations\">"+row+"</tr>";

    $j("#similar_targets div table").append(tr);
  });

  $j(".import_annotations").click(function(){
    var acc = $j(this).attr("id");
    if(acc){
      import_annotations( acc_data[acc] );
    }else{
      clear_targets();
    }
  });
}

function display_targets_selector( t ){
  var selector_id = global_infoAlignment['pdb']+"_"+global_infoAlignment['chain']+"_select";
  selector_id = selector_id.replace(".","_");
  var div_id = global_infoAlignment['pdb']+"_"+global_infoAlignment['chain']+"_div";
  div_id = div_id.replace(".","_");
  if( $j( "#rightBottom div#"+div_id ).length == 0 ){
    $j("#rightBottom").append("<div id=\""+div_id+"\" class=\"imported_targets_div\">IMPORTED PROTEINS: <select id=\""+selector_id+"\"class=\"imported_targets_selector\"></select></div>");
    var text = global_infoAlignment['uniprot']+" - "+global_infoAlignment['gene_symbol']+" - "+global_infoAlignment['uniprotTitle']+" - "+global_infoAlignment['organism'];
    $j("#"+selector_id).append( "<option acc=\""+global_infoAlignment['uniprot']+"\" annot_iframe_url=\""+global_infoAlignment['annot_iframe_url']+"\" seq_iframe_url=\""+global_infoAlignment['seq_iframe_url']+"\" >"+text+"</option>" );
    $j("#"+selector_id).change(function(){
      imported_protein_change( $j("#"+selector_id+" option:selected") );
    });
  }
  $j("#"+selector_id).append( "<option acc=\""+t['acc']+"\" annot_iframe_url=\""+t['annot_iframe_url']+"\" seq_iframe_url=\""+t['seq_iframe_url']+"\">"+t['text']+"</option>" );
  $j("#"+selector_id+" option[acc=\""+t['acc']+"\"]").prop('selected', 'selected');
}

function imported_protein_change(o){
  if(o.attr('acc')!=global_imported_alignment["imported_acc"])change_imported_src(o.attr('annot_iframe_url'),o.attr('seq_iframe_url'));
}

function import_annotations(acc_data){
  var acc = acc_data['acc'];

  var annot_iframe_url = "/imported_annotationsIFrame/?imported_acc="+acc+"&alignment="+encodeURI( JSON.stringify(global_infoAlignment) );
  var seq_iframe_url = "/sequenceIFrame/?imported_flag=true&alignment="+encodeURI( JSON.stringify(global_infoAlignment) );

  var target_selector = {
    "annot_iframe_url":annot_iframe_url,
    "seq_iframe_url":seq_iframe_url,
    "text":acc_data['acc']+" - "+acc_data['title']['gene']+" - "+acc_data['title']['name']['long']+" - "+acc_data['title']['org']['long']
  };

  display_targets_selector( target_selector );
  change_imported_src( annot_iframe_url, seq_iframe_url );
}

function hide_imported_select(){
  $j("div.imported_targets_div").css("display","none");
}

function check_imported_select(){
  var div_id = global_infoAlignment['pdb']+"_"+global_infoAlignment['chain']+"_div";
  div_id = div_id.replace(".","_");
  var selector_id = global_infoAlignment['pdb']+"_"+global_infoAlignment['chain']+"_select";
  selector_id = selector_id.replace(".","_");

  $j("#"+div_id).css("display","block");
  $j("#"+selector_id+" option[acc=\""+global_infoAlignment['uniprot']+"\"]").prop('selected', 'selected');
}

function change_imported_src(annot_iframe_url,seq_iframe_url){
  var evtHide = document.createEvent("Event");
  evtHide.initEvent("HideInfo",true,true);
  document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);
  document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtHide);

  var annot_iframe = 'iframe#upRightBottomFrame';
  var seq_iframe = 'iframe#downRightBottomFrame';

  $j( annot_iframe ).unbind("load");
  $j( seq_iframe ).unbind("load");

  clear_targets();

  $j( annot_iframe ).attr('src', annot_iframe_url);

  $j( annot_iframe ).load(function(){
    $j( seq_iframe ).attr('src', seq_iframe_url);
    $j( annot_iframe ).unbind("load");
  });
}

