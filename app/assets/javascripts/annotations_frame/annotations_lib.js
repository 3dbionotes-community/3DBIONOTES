function triggerCoordinates(start,end,genomic_flag){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("AnnotsCoordinatesInfo",true,true,[start,end,genomic_flag]);
  body.dispatchEvent(evt);
}

var IRD = false;
var ASA = false;

function update_interacting_residues(n){
  n_model = n;
  var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
  var j = 1;
  if(!top.binding_residues) return;
  for(var i = 0;i<top.binding_residues[0];i++){
    IRD[i].begin=-100-1*i;
    IRD[i].end=-100-1*i;
  }
  var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
  var n  =  0;
  top.binding_residues[ n_model ][ chain ].forEach(function(i){
    IRD[n].begin=i.begin;
    IRD[n].end=i.end;
    n++;
  });
}

function update_asa_residues(n){
  n_model = n;
  var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
  var j = 1;
  if(!top.asa_residues) return;
  for(var i = 0;i<__alignment.uniprotLength+1;i++){
    ASA[i].variants = [];
  }
  var chain = JSON.parse(  getParameterByName('alignment') )['chain'];
  var n = 1;
  top.asa_residues[ n_model-1 ][ chain ].forEach(function(i){
    var r = 255/120*i[1];
    if(r>255)r=255;
    var b = 255-r;
    if(b<0)b = 0;
    var color = 'rgb('+r+',0,'+b+')';
    ASA[ parseInt(i[0]) ].variants = [{ color:color, alternativeSequence:'', type:'measure', begin: i[0], end: i[0], score:i[1], internalId:'asa_'+n, description:'<b style=\"color:grey;\">Accessible surface area</b><br/>Residue accesibility '+i[1]+'&#197<sup>2</sup>' }];;
    n++;
  });
}


function build_ProtVista(){
  var yourDiv = document.getElementById('snippetDiv');
  if( !yourDiv ) return;
  var app = require("ProtVista");
  try {
    instance = new app({el: yourDiv, text: 'biojs', uniprotacc : __accession });
  } catch (err) {
    console.log(err);
  }       
  instance.getDispatcher().on("featureSelected", function(obj) {
    if(obj.feature.internalId=="fake_0"){
      triggerCoordinates(obj['feature']['begin'],obj['feature']['end'],false);
    }else{
      triggerCoordinates(obj['feature']['begin'],obj['feature']['end'],true);
    }
    if(obj.feature.internalId=="fake_0")$j('.up_pftv_tooltip-container').css('visibility','hidden');
  });
  
  instance.getDispatcher().on("featureDeselected", function(obj) {
    if(!instance.selectedFeature){
      $j('.up_pftv_tooltip-container').css('visibility','hidden');
      var evt = document.createEvent("Event");
      evt.initEvent("ResetInfo",true,true);
      window.top.document.getElementById("downRightBottomFrame").contentWindow.dispatchEvent(evt);
  
      var evt = document.createEvent("Event");
      evt.initEvent("ClearSelected",true,true);
      window.top.document.getElementById("leftBottomFrame").contentWindow.dispatchEvent(evt);
    }
  });
}
