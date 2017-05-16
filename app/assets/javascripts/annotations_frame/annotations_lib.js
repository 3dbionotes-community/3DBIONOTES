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
    var begin = obj['feature']['begin'];
    var end = obj['feature']['end'];
    var color =  obj['color'];

    if(imported_flag){
      var X = put_imported_range(obj['feature']['begin'],obj['feature']['end']);
      begin = X[0];
      end = X[1];
    }
    
    if(obj.feature.internalId=="fake_0"){
      $j('.up_pftv_tooltip-container').css('visibility','hidden');
    }else{
      var selection = {begin:begin, end:end, color:color, frame:"upRightBottomFrame"};
      trigger_aa_selection(selection);
    }
  });
  
  instance.getDispatcher().on("featureDeselected", function(obj) {
    if(!instance.selectedFeature){
      trigger_aa_cleared();
    }
  });
}

function get_imported_range(x,y){
  var s = x-1;
  var e =  y-1;
  while( !(imported_alignment.mapping[ s ].importedIndex && imported_alignment.mapping[ e ].importedIndex) && s<=e ){
    if(!imported_alignment.mapping[ s ].importedIndex)s += 1;
    if(!imported_alignment.mapping[ e ].importedIndex)e -= 1;
  }
  if(s<=e){
    return [imported_alignment.mapping[ s ].importedIndex,imported_alignment.mapping[ e ].importedIndex];
  }else{
    return [null,null];
  }
}    

function put_imported_range(x,y){
  var s = parseInt(x);
  var e =   parseInt(y);
  while( !(imported_alignment.inverse[ s ] && imported_alignment.inverse[ e ]) && s<=e ){
    if(!imported_alignment.inverse[ s ])s += 1;
    if(!imported_alignment.inverse[ e ])e -= 1;
  }
  if(s<=e){
    return [imported_alignment.inverse[ s ],imported_alignment.inverse[ e ]];
  }else{
    return [null,null];
  }
} 
