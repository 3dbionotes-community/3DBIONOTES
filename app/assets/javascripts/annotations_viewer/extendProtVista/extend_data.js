var feature_viewer;
var my_variant_viewer;
var diseases_table = {'none':[]};
var features_extended = false;
var variants_extended = false;


var extendProtVista =  require('extendProtVista');
var upgrade_fv = extendProtVista.upgrade_fv;
var extend_features = extendProtVista.extend_features;
var extend_variants = extendProtVista.extend_variants;
var get_all_external_soruces = extendProtVista.get_all_external_soruces;
var variant_menu = extendProtVista.variant_menu;
var update_diseases = extendProtVista.update_diseases;
var extend_categories = extendProtVista.extend_categories;
var add_disease_menu = extendProtVista.add_disease_menu;
var uploaded_data = extendProtVista.uploaded_data;
var check_coordinates = extendProtVista.check_coordinates;
var add_binding_residues = extendProtVista.add_binding_residues;
var add_asa_residues = extendProtVista.add_asa_residues;
