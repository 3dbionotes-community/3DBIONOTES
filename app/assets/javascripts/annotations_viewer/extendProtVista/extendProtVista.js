"use strict";

var max_zoom = require('./max_zoom');
var extend_categories = require('./extend_categories');
var __add_uploaded_data = require('./add_uploaded_data');
var add_uploaded_data = __add_uploaded_data.add_uploaded_data;
var uploaded_data = __add_uploaded_data.uploaded_data;
var get_all_external_soruces = require('./get_all_external_soruces');
var build_variant_menu = require('./build_variant_menu');
var variant_menu = build_variant_menu.variant_menu;
var update_diseases = build_variant_menu.update_diseases;
var add_disease_menu = build_variant_menu.add_disease_menu;
var add_evidences = require('./add_evidences');
var add_asa_residues = require('./add_asa_residues');
var add_binding_residues = require('./add_binding_residues');
var add_interpro = require('./add_interpro');
var add_smart = require('./add_smart');
var add_pfam = require('./add_pfam');
var add_elmdb = require('./add_elmdb');
var add_coverage = require('./add_coverage');
var add_dsysmap = require('./add_dsysmap');
var add_biomuta = require('./add_biomuta');
var rename_structural_features = require('./rename_structural_features');
var rebuild_ptm = require('./rebuild_ptm');
var add_mobi = require('./add_mobi');
var add_iedb = require('./add_iedb');
var add_phosphosite = require('./add_phosphosite');
var add_dbptm = require('./add_dbptm');
var highlight = require('./highlight');
var add_highlight = highlight.add_highlight;
var setup_highlight = highlight.setup_highlight;

var upgrade_fv = function(fv){
	max_zoom(fv);
	setup_highlight(fv);
        feature_viewer = fv;
};

var extend_features =  function(features){
        features_extended = true;
	add_evidences(features);
	add_pfam(features);
	add_smart(features);
	add_interpro(features);
	add_iedb(features);
	add_mobi(features);
	add_elmdb(features);
	add_coverage(features);
	add_phosphosite(features);
	add_dbptm(features);
	rebuild_ptm(features);
        add_binding_residues(features);
        add_asa_residues(features);
        add_uploaded_data(features);
	add_highlight(features);
};

var extend_variants = function(features){
	add_biomuta(features);
	add_dsysmap(features);
        add_disease_menu(features);
};

module.exports = { 
                   upgrade_fv:upgrade_fv, 
                   extend_features:extend_features, 
                   extend_variants:extend_variants, 
                   get_all_external_soruces:get_all_external_soruces,
                   variant_menu:variant_menu,
                   update_diseases:update_diseases,
                   extend_categories:extend_categories,
                   add_disease_menu:add_disease_menu,
                   uploaded_data:uploaded_data
};
