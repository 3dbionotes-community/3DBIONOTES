"use strict";

var add_coverage = function(d){
	var n = 1;
	if(__external_data['coverage'] && __external_data['coverage']['Structure coverage']){
		var __coverage = ["STRUCTURE_COVERAGE",[]]
		__external_data['coverage']['Structure coverage'].forEach(function(i){
			__coverage[1].push({begin:i['start'],end:i['end'],description:'Sequence segment covered by the structure',internalId:'coverage_'+n,type:'region'});
			n++;
		});
		d.push( __coverage );
	}
};

module.exports = add_coverage;
