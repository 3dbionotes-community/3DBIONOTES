"use strict";

var continuous_data = require("./continuous_data");

var uploaded_data = null;
if(top.upload_flag && !imported_flag){
  uploaded_data = true;
}

var add_uploaded_data = function(d){
  if(uploaded_data){
    prepare_uploaded_data();
    $j.each(uploaded_data,function( track_name, data ) {
      d.push( [track_name,data] );
    });
  }
};

function prepare_uploaded_data(){
  var PDBchain = __alignment.pdb+":"+__alignment.chain;
  PDBchain = PDBchain.replace("_dot_",".");
  var uniprot = __alignment.uniprot;
  uploaded_data = {};

  var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];

  aux.forEach(function( i ){
    if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
      $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
        if(info.visualization_type=="continuous"){
          uploaded_data[ track_name ] = continuous_data(info.data);
        }else{
          if(!uploaded_data[track_name]){
            uploaded_data[track_name] = info.data;
          }else{
            uploaded_data[track_name] = uploaded_data[track_name].concat( info.data );
          }
        }
      });
    }
  });
} 

module.exports = { add_uploaded_data:add_uploaded_data, uploaded_data:uploaded_data };
