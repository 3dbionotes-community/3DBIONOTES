"use strict";

var max_zoom = require('./max_zoom');
var extend_categories = require('./extend_categories');
var __add_uploaded_data = require('./add_uploaded_data');
var add_uploaded_data = __add_uploaded_data.add_uploaded_data;
var uploaded_data = __add_uploaded_data.uploaded_data;
var add_uploaded_variants = __add_uploaded_data.add_uploaded_variants;
var get_all_external_soruces = require('./get_all_external_soruces');
var build_variant_menu = require('./build_variant_menu');
var variant_menu = build_variant_menu.variant_menu;
var update_diseases = build_variant_menu.update_diseases;
var add_disease_menu = build_variant_menu.add_disease_menu;
var add_evidences = require('./add_evidences');
var add_asa_residues = require('./add_asa_residues');
var add_em_res = require('./add_em_res');
var add_man_cur_ppifuncmap = require('./add_man_cur_ppifuncmap');
var add_man_cur_ligfuncmap = require('./add_man_cur_ligfuncmap');
var add_man_cur_ligands_diamond = require('./add_man_cur_ligands_diamond');

var add_binding_residues = require('./add_binding_residues');
var add_coverage = require('./add_coverage');
var add_sequence_coverage = require('./add_sequence_coverage');
var add_biomuta = require('./add_biomuta');
var rename_structural_features = require('./rename_structural_features');
var rebuild_ptm = require('./rebuild_ptm');
var add_iedb = require('./add_iedb');
var add_phosphosite = require('./add_phosphosite');
var add_dbptm = require('./add_dbptm');
var highlight = require('./highlight');
var add_highlight = highlight.add_highlight;
var setup_highlight = highlight.setup_highlight;
var check_coordinates = highlight.check_coordinates;

var upgrade_fv = function(fv){
	max_zoom(fv);
	setup_highlight(fv);
        feature_viewer = fv;
};

var extend_features =  function(features){
  features_extended = true;
  if(extend_features_flag){
	  add_evidences(features);
	  add_iedb(features);
	  add_coverage(features);
	  add_sequence_coverage(features);
	  add_phosphosite(features);
	  add_dbptm(features);
	  rebuild_ptm(features);
    add_uploaded_data(features);
    add_em_res(features);
    add_man_cur_ppifuncmap(features);
    add_man_cur_ligfuncmap(features);
    add_man_cur_ligands_diamond(features);
  }
	add_highlight(features);
};

var extend_variants = function(features){
	add_biomuta(features);
  add_uploaded_variants(features);
  add_disease_menu(features);
  // add_man_cur_variants(features);
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
  uploaded_data:uploaded_data,
  check_coordinates:check_coordinates,
  add_binding_residues:add_binding_residues,
  add_asa_residues:add_asa_residues
};

