var $j = jQuery.noConflict();

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
    if(trans[i].pdbIndex!=undefined){
      list.push(trans[i].pdbIndex);
    }
  }
  return list;
}

function processAlignment(data){
  return data;
}

function change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url ){

  var seq_iframe = 'iframe#downRightBottomFrame';
  var annot_iframe = 'iframe#upRightBottomFrame';
  var genomic_iframe = 'iframe#genomicFrame';

  $j(seq_iframe).attr('src', seq_iframe_url);

  $j( seq_iframe ).load(function(){
    $j( annot_iframe ).attr('src', annot_iframe_url);
  });

  $j( annot_iframe ).load(function(){
     $j( genomic_iframe ).attr('src', genomic_iframe_url);
  });

}

function getValueSelection(elem,myFirstTime){
  var infoAlignment = (elem.options[elem.selectedIndex].value);
  if (infoAlignment!=""){

    var evtHide = document.createEvent("Event");
    evtHide.initEvent("HideInfo",true,true);
    document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);
    document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtHide);
    document.getElementById("genomicFrame").contentWindow.dispatchEvent(evtHide);

    var infoAlignmentEval = eval("("+infoAlignment+")");
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
        var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
        var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

        change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url );

      }else if(uniprot==undefined){

        var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

        change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url );

      }else if(data[chain][uniprot]==undefined){
        $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
        $j('#upRightBottomFrame')[0].src = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
      }

    }else{
      $j.ajax({
        url: myUrl,
        dataType: 'jsonp',
        data: {},

        success: function(data){
          $ALIGNMENTS[  pdb ] = data;
          if(data[chain]!=undefined && data[chain][uniprot]!=undefined){

            alignmentTranslation = data[chain][uniprot].mapping;

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
            var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

            change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url );

          }else if(uniprot==undefined){

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

            change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url );

          }else if(data[chain][uniprot]==undefined){
            $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            $j('#upRightBottomFrame')[0].src = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
            $j('#genomicFrame')[0].src = "/genomicIFrame/?uniprot_acc="+uniprot;
          }
        },

        error: function(data){
          console.log("ERROR: jsonp ajax call failed");
          alignmentTranslation = null;
          if (uniprot!=undefined){

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
            var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

            change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url )
            
          }else{

            var seq_iframe_url = "/sequenceIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var annot_iframe_url = "/annotationsIFrame/?"+debug_mode+"alignment="+encodeURI(infoAlignment);
            var genomic_iframe_url = "/genomicIFrame/?uniprot_acc="+uniprot;

            change_iframe_src( seq_iframe_url, annot_iframe_url, genomic_iframe_url );

          }
        },
        jsonpCallback: 'processAlignment'
      });
    }
  }

  return myFirstTime;
}

function resetEvent(){
  var evt = document.createEvent("Event");
  evt.initEvent("ResetInfo",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
  document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evt);
  document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evt);

  var els = document.getElementsByClassName("showHetero");
  for(var i=0;i<els.length;i++){
    els[i].className="hideHetero";
  }
  var els = document.getElementsByClassName("showVolume");
  for(var i=0;i<els.length;i++){
    els[i].className="hideVolume";
  }
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
  }else{
    button.className = "hideHetero";
  }
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("heteroInfo",true,true,className);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}

function toggleVolumeEvent(button){
  var className = button.className;
  if(className=="hideVolume"){
    button.className = "showVolume";
  }else{
    button.className = "hideVolume";
  }
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("volumeInfo",true,true,className);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
}
