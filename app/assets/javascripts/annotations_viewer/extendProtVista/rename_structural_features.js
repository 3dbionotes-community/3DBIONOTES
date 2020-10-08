"use strict";

var rename_structural_features = function(d){
	if( "structural" in d){
		d['structural']['label'] = "UniProt Secondary Structure Data";
	}
};

module.exports = rename_structural_features;
