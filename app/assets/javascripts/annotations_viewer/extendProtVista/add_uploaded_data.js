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
  PDBchain = PDBchain.replace(/_dot_/g,".");
  var uniprot = __alignment.uniprot;
  uploaded_data = {};

  var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];

  aux.forEach(function( i ){
    if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
      $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
        if(info.visualization_type=="continuous"){
          uploaded_data[ track_name ] = continuous_data(info.data);
        }else if(info.visualization_type != "variants"){
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

var add_uploaded_variants = function(d){
  var PDBchain = __alignment.pdb+":"+__alignment.chain;
  PDBchain = PDBchain.replace(/_dot_/g,".");
  var uniprot = __alignment.uniprot;
  if(uploaded_data){
    var aux = [ ["PDBchain",PDBchain], ["acc",uniprot]  ];
    aux.forEach(function( i ){
      if( top.$UPLOADED_DATA[ i[0] ][ i[1] ] ){
        $j.each( top.$UPLOADED_DATA[ i[0] ][ i[1] ], function( track_name, info ) {
          if(info.visualization_type=="variants"){
            process_variants(d,info);
          }
        });
      }
    });
  }

  function process_variants(__d,info){
                var d = __d[0][1];
                var n = 0;
		info.data.forEach(function(i){
			if( !d[ i['begin'] ] ) return;
			var __aux = jQuery.grep(d[ i['begin'] ]['variants'],function(j){ return(j['alternativeSequence']==i['variation']) });
			var __mut = __aux[0];
			if( __mut ){
                                __mut.externalFlag = true;
                                if(__mut.sourceType=="large_scale_study") __mut["color"] = "#FF0000";

				if(!__mut['association'])__mut['association']=[];
				var __src = __mut['association'];

				var __name = i['disease'];
				if(__name){
                                  __name = __name.charAt(0).toUpperCase() + __name.slice(1);
                                }else{
                                  __name = "NA";
                                }

				var __polyphen = "";
                                if(i['polyphen']) __polyphen = " - Polyphen: "+i['polyphen'];

				__src.push({
					disease:true,
					name:__name,
					xrefs:[{name:'External Variant '+__polyphen}]
				});
				if(__mut['association'].length == 0) __mut['association'] = null;
			}else{
                                variants_extended = true;
				var __new_mut = {
					internalId:"extm_"+n,
					type: "VARIANT",
					wildType: i['wildtype'],
					alternativeSequence:i['variation'],
					begin:i['begin'],
					end:i['begin'],
					association:[],
                                        externalFlag:true,
                                        color:"#FF0000"
				};
				if(i['original'])__new_mut['wildType']=i['original'];

				var __src = __new_mut['association'];
				var __name = i['disease'];
				if(__name){
                                  __name = __name.charAt(0).toUpperCase() + __name.slice(1);
                                }else{
                                  __name = "NA";
                                }

				var __polyphen = "";
                                if(i['polyphen']) __polyphen = " - Polyphen: "+i['polyphen'];

				__src.push({
					disease:true,
					name:__name,
					xrefs:[{name:'External Variant '+__polyphen}]
				});
                                d[ i['begin'] ]['variants'].push( __new_mut );
				n++;
			}
		});
  }
};

module.exports = { add_uploaded_data:add_uploaded_data, uploaded_data:uploaded_data, add_uploaded_variants:add_uploaded_variants };
