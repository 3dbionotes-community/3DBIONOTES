"use strict";

var add_sequence_coverage = function(d){
	var n = 1;
	if( imported_flag ){
		var __coverage = ["SEQUENCE_COVERAGE",[]]
		imported_alignment.coverage.forEach(function(i){
			__coverage[1].push({begin:i['begin'],end:i['end'],description:'Segment covered by the original protein <a target="_blank" href="http://www.uniprot.org/uniprot/'+__alignment.original_uniprot+'">'+__alignment.original_uniprot+'</a>',internalId:'seq_coverage_'+n,type:'region'});
			n++;
		});
		d.push( __coverage );
	}
};

module.exports = add_sequence_coverage;
