function update_interacting_residues(n){
  if(imported_flag || !top.binding_residues) return;
  var bs = add_binding_residues(n);
  $j.map(feature_viewer.data, function(n,i){
    if(n[0]==bs[0])feature_viewer.data[i]=bs;
  });
  var category = $j.grep(feature_viewer.categories, function(n,i){if(n.name=="INTERACTING_RESIDUES")return n})[0];
  category.categoryViewer.updateData( bs[1] );
}

function update_asa_residues(n){
  if(imported_flag || !top.asa_residues) return;
  var asa = add_asa_residues(n);
  $j.map(feature_viewer.data, function(n,i){
    if(n[0]==asa[0])feature_viewer.data[i]=asa;
  });
  var category = $j.grep(feature_viewer.categories, function(n,i){if(n.name=="RESIDUE_ASA")return n})[0];
  category.repaint(asa[1]);
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
      if( obj.feature.internalId !="fake_0" )add_feature_button();
    }
    
    if(obj.feature.internalId=="fake_0"){
      $j('.up_pftv_tooltip-container').css('visibility','hidden');
    }else{
      var selection = {begin:begin, end:end, color:color, frame:"upRightBottomFrame"};
      trigger_aa_selection(selection);
    }
  });
  
  instance.getDispatcher().on("featureDeselected", function(obj) {
    setTimeout(function(){
      if(!instance.selectedFeature){
        trigger_aa_cleared();
      }
    },10);
    clear_feature_button();
  });

  instance.getDispatcher().on("multipleFeatureDeselected", function(obj) {
    setTimeout(function(){
      if(!instance.selectedFeature){
        trigger_aa_cleared();
      }
    },10);
    clear_feature_button();
  });
}

function add_feature_button(){
  $j(".up_pftv_tooltip-container table tr th").append( "<button id=\"add_feature_button\" type=\"button\">TRANSFER</button>" );
  $j("#add_feature_button").click(function(){
    import_feature();
  });
}

function import_feature(){
  if(top.$UPLOADED_DATA){
    var PDBchain = __alignment.pdb+":"+__alignment.chain;
    if( !top.$UPLOADED_DATA["PDBchain"][ PDBchain ] ){
      top.$UPLOADED_DATA["PDBchain"][ PDBchain ] = {};
    }
    if( !top.$UPLOADED_DATA["PDBchain"][ PDBchain ]["IMPORTED_ANNOTATIONS"] ){
      top.$UPLOADED_DATA["PDBchain"][ PDBchain ]["IMPORTED_ANNOTATIONS"] = { data:[] };
    }
    var X = $j.extend({}, instance.selectedFeature);
    var Y = put_imported_range(X.begin,X.end);
    X.begin = Y[0];
    X.end = Y[1];
    if(  !X.begin || !X.end ){
      clear_feature_button();
      swal({
        title: "TRANSFER FAILED",
        text: "SEQUENCE ALIGNMENT OUT OF RANGE",
        timer: 5000,
        type: "error",
        showConfirmButton: true
      });     
      return;
    }
    if(X.type == "VARIANT"){
      X.type = "Single_aa";
      X = { begin:X.begin, end:X.end, type:X.type, color:X.color, description:"Gene Variant<br/>"+X.description }
    }
    X.description = "<b style=\"color:red;\">WARNING IMPORTED FEATURE FROM</b><br/><b>Organism</b>: "+__alignment.organism+"<br/><b>Protein</b>: "+__alignment.gene_symbol+", "+__alignment.uniprotTitle+" - <a target=\"_blank\" href=\"http://www.uniprot.org/uniprot/"+__alignment.uniprot+"\">"+__alignment.uniprot+"</a><hr/><br/>"+X.description;
    top.$UPLOADED_DATA["PDBchain"][ PDBchain ]["IMPORTED_ANNOTATIONS"]["data"].push(X);
    top.upload_flag = true;
    if(!top.$CUSTOM_TRACKS["IMPORTED_ANNOTATIONS"])top.$CUSTOM_TRACKS["IMPORTED_ANNOTATIONS"]={};
    top.$CUSTOM_TRACKS["IMPORTED_ANNOTATIONS"][X.type] = true;
  }
  clear_feature_button();
  swal({
    title: "TRANSFER SUCCESS",
    text: "ANNOTATION TRANSFERRED TO THE TARGET PROTEIN",
    timer: 2000,
    type: "success",
    showConfirmButton: true
  });
}

function clear_feature_button(){
  $j("#add_feature_button").remove();
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
  var e = parseInt(y);
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

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

