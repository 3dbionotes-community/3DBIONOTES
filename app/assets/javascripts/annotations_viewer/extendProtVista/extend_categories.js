"use strict";

var extend_categories = function(categories){
  var PDBchain = __alignment.pdb+":"+__alignment.chain;
  PDBchain = PDBchain.replace("_dot_",".");
  var uniprot = __alignment.uniprot;
   if(uploaded_data){
     var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];
     aux.forEach(function( i ){
       if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
         $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
           if(info.visualization_type=="continuous") categories.unshift({name:track_name, label:track_name, visualizationType:"continuous"});
         });
       }
     });
  } 
};

module.exports = extend_categories;
