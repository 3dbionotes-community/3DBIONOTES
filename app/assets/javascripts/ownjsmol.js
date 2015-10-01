function resetView(){
  miApplet.reset_view();
}

function loadPDB(pdbList){
  var list = eval(pdbList);
  for(var i=0;i<list.length;i++){
    var pdb = list[i];
    miApplet.open_url(pdb,true);
  }
}

function loadEMDB(emd,threshold,maxSizeVol){
  miApplet.load_surface(emd,threshold,maxSizeVol);
}

function displayMessage(message){
  miApplet.display_message(message);
}

$j(window).load(function(){
  window.addEventListener("RangeMolInfo", function(evt){
    pdbPosList = evt.detail;
    miApplet.color_by_chain_simple(pdbPosList,infoGlobal.activepdb,infoGlobal.activechain);
  });
  window.addEventListener("molInfo", function(evt){
    infoGlobal = evt.detail;
    if (infoGlobal.origin=="Uniprot"){
      miApplet.open_url((infoGlobal.activepdb).toUpperCase(),false,infoGlobal.activechain);
      miApplet.reset_view();
      miApplet.highlight_chain(infoGlobal.activepdb,infoGlobal.activechain);
    }else{
      miApplet.highlight_chain(infoGlobal.activepdb,infoGlobal.activechain);
    }
  });
});
