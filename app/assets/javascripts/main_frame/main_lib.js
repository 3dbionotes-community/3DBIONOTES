
function getQueryParams(){
  try{
    url = window.location.href;
    query_str = url.substr(url.indexOf('?')+1, url.length-1);
    r_params = query_str.split('&');
    params = {}
    for( i in r_params){
      param = r_params[i].split('=');
      params[ param[0] ] = param[1];
    }
    return params;
  }
  catch(e){
  return {};
  }
}

function toggleClass(obj){
  var el = document.getElementById(obj);
  if (el.className== 'show'){
    el.className = el.className.replace(/(?:^|\s)show(?!\S)/g , 'hide');
  }
  else if (el.className=='hide'){
    el.className = el.className.replace(/(?:^|\s)hide(?!\S)/g , 'show');
  }
}

function toggleVisibility(obj){
  var el = document.getElementById(obj);
  if ( el.className == 'hideContent' ) {
    el.className = el.className.replace(/(?:^|\s)hideContent(?!\S)/g , 'showContent');
    el.style.display = '';
  }
  else if(el.className == 'showContent') {
    el.className = el.className.replace(/(?:^|\s)showContent(?!\S)/g , 'hideContent');
    el.style.display = 'none';
  }
}


function getRangesFromTranslation(start,end,trans){
  var list = [];
  for (var i = start-1; i<=end-1;i++){
    if(trans[i] && trans[i].pdbIndex!=undefined){
      list.push(trans[i].pdbIndex);
    }
  }
  return list;
}

function processAlignment(data){
  return data;
}

function change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url ){

  global_infoAlignment["annot_iframe_url"] = annot_iframe_url;
  global_infoAlignment["seq_iframe_url"] = seq_iframe_url;

  var seq_iframe = 'iframe#downRightBottomFrame';
  var annot_iframe = 'iframe#upRightBottomFrame';
  var genomic_iframe = 'iframe#genomicFrame';

  wait_message("FETCHING SEQUENCE ALIGNMENT");
  $j(seq_iframe).attr('src', seq_iframe_url);

  $j( seq_iframe ).load(function(){
    wait_message("COLLECTING ANNOTATIONS");
    $j( annot_iframe ).attr('src', annot_iframe_url);
    $j( seq_iframe ).unbind("load");
  });
  $j( annot_iframe ).load(function(){
    clear_wm();
    check_imported_select();
    if(!genomic_iframe_url){
      $j( annot_iframe ).unbind("load");
    }
  }); 

  if(genomic_iframe_url){
    $j( annot_iframe ).load(function(){
      $j( genomic_iframe ).attr('src', genomic_iframe_url);
      $j( annot_iframe ).unbind("load");
    });
  }

}

var stop_wait_message  =  false;
function wait_message(message){
  if(stop_wait_message) return;
  if($j(".jsonp_info").length){
    $j('.jsonp_info').html("<div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div>");
  }else{
    $j('body').append("<div class=\"filter_screen\"></div><div class=\"jsonp_info\" ><div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div></div>");
  }
}

function clear_wm(){
  $j(".filter_screen").remove();
  $j(".jsonp_info").remove();
  stop_wait_message = true;
}

function getValueSelection(elem,myFirstTime){
  hide_imported_select();
  global_selection =  null;
  var infoAlignment="";
  if( elem.selectedIndex && elem.options && elem.options[elem.selectedIndex]){
    infoAlignment = (elem.options[elem.selectedIndex].value);
  }
  if (infoAlignment!=""){
    var evtHide = document.createEvent("Event");
    evtHide.initEvent("HideInfo",true,true);
    document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);
    document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtHide);

    var infoAlignmentEval = eval("("+infoAlignment+")");
    global_infoAlignment = infoAlignmentEval;
    var baseUrl = "http://3dbionotes.cnb.csic.es/";

    var info = {};
    info.firstTime = myFirstTime;
    if (myFirstTime){
      myFirstTime = false;
    }
    info.origin = infoAlignmentEval.origin;
    info.pdbsToLoad = infoAlignmentEval.pdbList;
    info.activepdb = infoAlignmentEval.pdb;
    info.activechain = infoAlignmentEval.chain;

    var evtOut = document.createEvent("CustomEvent");
    evtOut.initCustomEvent("molInfo",true,true,info);
    document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evtOut);

    var pdb = infoAlignmentEval.pdb;
    var chain = infoAlignmentEval.chain;
    var uniprot = infoAlignmentEval.uniprot;
    var myUrl =  baseUrl+"api/alignments/PDBjsonp/"+pdb;

    if(uniprot!=undefined){
      document.getElementById("uniprotLogo").innerHTML = "<a target=\"_blank\" href=\"http://www.uniprot.org/uniprot/"+uniprot+"\"><img src=\"assets/uniprot.png\" alt=\"Uniprot\" width=\"18\" height=\"18\"></a>";
    }else{
      document.getElementById("uniprotLogo").innerHTML = "<a target=\"_blank\" href=\"http://www.uniprot.org/\"><img src=\"assets/uniprot.png\" alt=\"Uniprot\" width=\"18\" height=\"18\"></a>";
    }

    if( pdb in $ALIGNMENTS ){
      data = $ALIGNMENTS[  pdb ];
      if(data[chain]!=undefined && data[chain][uniprot]!=undefined){
        alignmentTranslation = data[chain][uniprot].mapping;

        var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

        change_iframe_src( seq_iframe_url, annot_iframe_url );

      }else if(uniprot==undefined){

        var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

        change_iframe_src( seq_iframe_url, annot_iframe_url );

      }else if(data[chain][uniprot]==undefined){
        var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        change_iframe_src( seq_iframe_url, annot_iframe_url );
      }
    }else{
      wait_message("BUILDING SEQUENCE ALIGNMENT");
      var starts = new Date().getTime();
      $j.ajax({
        url: myUrl,
        dataType: 'jsonp',
        data: {},
        success: function(data){
          $ALIGNMENTS[  pdb ] = data;
          if(data[chain]!=undefined && data[chain][uniprot]!=undefined){
            alignmentTranslation = data[chain][uniprot].mapping;

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

            change_iframe_src( seq_iframe_url, annot_iframe_url );

          }else if(uniprot==undefined){

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

            change_iframe_src( seq_iframe_url, annot_iframe_url );

          }else if(data[chain][uniprot]==undefined){
            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            change_iframe_src( seq_iframe_url, annot_iframe_url );
          }
        },
        error: function(data){
          console.log("JQuery ajax error");
          alignmentTranslation = null;
          if (uniprot!=undefined){

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

            change_iframe_src( seq_iframe_url, annot_iframe_url );

          }else{
            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);

            change_iframe_src( seq_iframe_url, annot_iframe_url );          }
        },
        jsonpCallback: 'processAlignment'
      }).done(function(){
        var ends = new Date().getTime();
        var total_time = (ends-starts)/1000;
        console.log( myUrl+" - "+total_time+"s" );
      });
    }
  }
  return myFirstTime;
}

function resetEvent(){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("aa_cleared",true,true,"mainFrame");
  window.dispatchEvent(evt);
}

function label_display(){
  var a_off = $j("#leftBottomFrame").offset();
  var b_off = $j("#topFrame").offset();
  var diff = ( b_off.top + $j("#topFrame").height() ) - a_off.top;
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("label_display",true,true,diff);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function keep_selection(){
  var evt = document.createEvent("Event");
  evt.initEvent("keep_selection",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function play(){
  var evt = document.createEvent("Event");
  evt.initEvent("play",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function model(flag){
  var evt = document.createEvent("Event");
  if(flag){
    evt.initEvent("nextModel",true,true);
  }else{
    evt.initEvent("prevModel",true,true);
  }
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function zoom(flag){
  var evt = document.createEvent("Event");
  if(flag){
    evt.initEvent("zoomIN",true,true);
  }else{
    evt.initEvent("zoomOUT",true,true);
  }
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function toggleSphere(){
  var evt = document.createEvent("Event");
  evt.initEvent("sphere",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function takeScreenshot(){
  var evt = document.createEvent("Event");
  evt.initEvent("screenshot",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function highlightNeightboursEvent(){
  var evt = document.createEvent("Event");
  evt.initEvent("highlightNeight",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function addAtomsEvent(){
  var evt = document.createEvent("Event");
  evt.initEvent("addAtoms",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function toggleHeteroEvent(button){
  var className = button.className;
  if(className=="hideHetero"){
    button.className = "showHetero";
  }else if(className=="showHetero"){
    button.className = "hideHetero";

  }else if( $j(button).hasClass("hideHetero") ){
    className = "hideHetero";
    $j(button).removeClass("hideHetero");
    $j(button).addClass("showHetero");
  }else if( $j(button).hasClass("showHetero") ){
    className = "showHetero";
    $j(button).removeClass("showHetero");
    $j(button).addClass("hideHetero");
  }
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("heteroInfo",true,true,className);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function toggleVolumeEvent(button){
  var className;
  if( $j(button).hasClass("hideVolume") ){
    $j(button).removeClass("hideVolume");
    $j(button).addClass("showVolume");
    className = "hideVolume";
  }else if( $j(button).hasClass("showVolume") ){
    $j(button).removeClass("showVolume");
    $j(button).addClass("hideVolume");
    className = "showVolume";
  }

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("volumeInfo",true,true,className);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function import_similars(){
  $j('#upRightBottomFrame').css('visibility','hidden');
  $j('body').append("<div id=\"similar_targets\"><div>IMPORTING SIMILAR PROTEINS<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div></div>");
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
  $j("#similar_targets div").html('');
  $j("#similar_targets div").append("<table></table>");
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

