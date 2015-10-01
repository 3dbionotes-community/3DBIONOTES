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

function getValueSelection(elem,myFirstTime){
  var infoAlignment = (elem.options[elem.selectedIndex].value);
  if (infoAlignment!=""){
    var evtHide = document.createEvent("Event");
    evtHide.initEvent("HideInfo",true,true);
    //if(infoAlignment["uniprot"]!=null){
    document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);
    document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evtHide);
    //}
    var infoAlignmentEval = eval("("+infoAlignment+")");
    var baseUrl = "http://3dbionotes.cnb.csic.es/";
    var evtOut = document.createEvent("CustomEvent");
    var info = {};
    info.firstTime = myFirstTime;
    if (myFirstTime){
      myFirstTime = false;
    }
    info.origin = infoAlignmentEval.origin;
    info.pdbsToLoad = infoAlignmentEval.pdbList;
    info.activepdb = infoAlignmentEval.pdb;
    info.activechain = infoAlignmentEval.chain;
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
    $j.ajax({
      url: myUrl,
      dataType: 'jsonp',
      data: {},
      success: function(data){
        if(data[chain]!=undefined && data[chain][uniprot]!=undefined){
          alignmentTranslation = data[chain][uniprot].mapping;
          $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?alignment="+encodeURI(infoAlignment);
          $j('#upRightBottomFrame')[0].src = "/iframeAnnots/?alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
        }else if(uniprot==undefined){
          $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?alignment="+encodeURI(infoAlignment);
          $j('#upRightBottomFrame')[0].src = "/iframeAnnots/?alignment="+encodeURI(infoAlignment);
        }else if(data[chain][uniprot]==undefined){
          $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?alignment="+encodeURI(infoAlignment);
          $j('#upRightBottomFrame')[0].src = "/iframeAnnots/?alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
        }
      },
      error: function(data){
        alignmentTranslation = null;
        if (uniprot!=undefined){
          $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?alignment="+encodeURI(infoAlignment);
          $j('#upRightBottomFrame')[0].src = "/iframeAnnots/?alignment="+encodeURI(infoAlignment+"&length="+infoAlignmentEval.uniprotLength);
        }else{
          $j('#downRightBottomFrame')[0].src = "/sequenceIFrame/?alignment="+encodeURI(infoAlignment);
          $j('#upRightBottomFrame')[0].src = "/iframeAnnots/?alignment="+encodeURI(infoAlignment);
        }
      },
      jsonpCallback: 'processAlignment'
    });
  }

  return myFirstTime;
}

function resetEvent(){
  var evt = document.createEvent("Event");
  evt.initEvent("ResetInfo",true,true);
  document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
  document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evt);
  document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evt);
  //Esto es para cambiar la clase de show/hide button cuando se hace reset, que hace que se vean las bolas
  var els = document.getElementsByClassName("showHetero");
  for(var i=0;i<els.length;i++){
    els[i].className="hideHetero";
  }
  var els = document.getElementsByClassName("showVolume");
  for(var i=0;i<els.length;i++){
    els[i].className="hideVolume";
  }
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
