# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2019_01_23_152406) do
  create_table "allele_finder_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "iedb_mhc_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_iedb_mhc_id", precision: 22
    t.string "child_obi_id", limit: 1000, collation: "utf8mb3_bin"
  end

  create_table "annotations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.string "source"
    t.string "digest"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "article", primary_key: "article_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22
    t.decimal "journal_id", precision: 22
    t.string "journal_volume", limit: 15, collation: "utf8mb3_bin"
    t.string "journal_issue", limit: 20, collation: "utf8mb3_bin"
    t.string "article_date", limit: 35, collation: "utf8mb3_bin"
    t.string "article_pages", limit: 24, collation: "utf8mb3_bin"
    t.string "article_title", limit: 1000, collation: "utf8mb3_bin"
    t.string "article_authors", limit: 4000, collation: "utf8mb3_bin"
    t.string "article_abstract", limit: 4000, collation: "utf8mb3_bin"
    t.string "article_affiliations", limit: 2000, collation: "utf8mb3_bin"
    t.string "article_chemical_list", limit: 4000, collation: "utf8mb3_bin"
    t.string "article_mesh_headings_list", limit: 4000, collation: "utf8mb3_bin"
    t.string "medline_date", limit: 10, collation: "utf8mb3_bin"
    t.string "comments", limit: 2000, collation: "utf8mb3_bin"
    t.string "pubmed_id", limit: 20, collation: "utf8mb3_bin"
    t.string "pmc_id", limit: 20, collation: "utf8mb3_bin"
    t.string "preprint_url", limit: 100, collation: "utf8mb3_bin"
    t.datetime "modified_date"
    t.datetime "created_date"
    t.index ["journal_id"], name: "journal_id"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "assay_finder_bcell_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "assay_type_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_assay_type_id", precision: 22
    t.string "child_obi_id", limit: 1000, collation: "utf8mb3_bin"
  end

  create_table "assay_finder_elution_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "assay_type_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_assay_type_id", precision: 22
    t.string "child_obi_id", limit: 1000, collation: "utf8mb3_bin"
  end

  create_table "assay_finder_tcell_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "assay_type_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_assay_type_id", precision: 22
    t.string "child_obi_id", limit: 1000, collation: "utf8mb3_bin"
  end

  create_table "assay_type", primary_key: "assay_type_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "category", limit: 50, collation: "utf8mb3_bin"
    t.string "assay_type", limit: 50, null: false, collation: "utf8mb3_bin"
    t.string "response", limit: 85, collation: "utf8mb3_bin"
    t.string "units", limit: 30, collation: "utf8mb3_bin"
    t.string "obi_id", limit: 100, collation: "utf8mb3_bin"
    t.string "class", limit: 35, collation: "utf8mb3_bin"
  end

  create_table "bcell", primary_key: "bcell_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "curated_epitope_id", precision: 22, null: false
    t.string "as_location", limit: 200, collation: "utf8mb3_bin"
    t.decimal "as_type_id", precision: 22
    t.string "as_char_value", limit: 50, collation: "utf8mb3_bin"
    t.float "as_num_value"
    t.string "as_inequality", limit: 5, collation: "utf8mb3_bin"
    t.decimal "as_num_subjects", precision: 22
    t.decimal "as_num_responded", precision: 22
    t.float "as_response_frequency"
    t.text "as_immunization_comments"
    t.text "as_comments"
    t.string "as_ant_conformation", limit: 20, collation: "utf8mb3_bin"
    t.decimal "h_organism_id", precision: 22
    t.string "h_gaz_id", collation: "utf8mb3_bin"
    t.string "h_sex", limit: 10, collation: "utf8mb3_bin"
    t.string "h_age", limit: 85, collation: "utf8mb3_bin"
    t.text "h_mhc_types_present"
    t.string "iv1_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "iv1_route", limit: 350, collation: "utf8mb3_bin"
    t.string "iv1_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_disease_id", precision: 22
    t.string "iv1_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "iv1_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_imm_object_id", precision: 22
    t.string "iv1_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "iv1_con_object_id", precision: 22
    t.string "iv2_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv2_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "iv2_route", limit: 35, collation: "utf8mb3_bin"
    t.string "iv2_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv2_disease_id", precision: 22
    t.string "iv2_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "iv2_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "iv2_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv2_imm_object_id", precision: 22
    t.string "iv2_imm_ev", limit: 3500, collation: "utf8mb3_bin"
    t.decimal "iv2_con_object_id", precision: 22
    t.string "ab_name", limit: 500, collation: "utf8mb3_bin"
    t.string "ab_type", limit: 35, collation: "utf8mb3_bin"
    t.string "ab_materials_assayed", limit: 600, collation: "utf8mb3_bin"
    t.string "ab_immunoglobulin_domain", limit: 85, collation: "utf8mb3_bin"
    t.string "ab_c1_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "ab_c2_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_iv_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_iv_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "adt_iv_route", limit: 35, collation: "utf8mb3_bin"
    t.string "adt_iv_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "adt_iv_disease_id", precision: 22
    t.string "adt_iv_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_iv_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "adt_iv_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "adt_iv_imm_object_id", precision: 22
    t.string "adt_iv_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "adt_iv_con_object_id", precision: 22
    t.string "adt_ab_name", limit: 500, collation: "utf8mb3_bin"
    t.string "adt_ab_type", limit: 35, collation: "utf8mb3_bin"
    t.string "adt_ab_materials_assayed", limit: 600, collation: "utf8mb3_bin"
    t.string "adt_ab_immunoglobulin_domain", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_ab_c1_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_ab_c2_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.decimal "adt_h_organism_id", precision: 22
    t.string "adt_h_gaz_id", collation: "utf8mb3_bin"
    t.string "adt_h_age", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_h_sex", limit: 10, collation: "utf8mb3_bin"
    t.text "adt_h_mhc_types_present"
    t.text "adt_comments"
    t.string "ant_type", limit: 50, collation: "utf8mb3_bin"
    t.string "ant_ref_name", limit: 500, collation: "utf8mb3_bin"
    t.decimal "ant_object_id", precision: 22
    t.string "ant_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "ant_con_object_id", precision: 22
    t.decimal "complex_id", precision: 22
    t.decimal "ab_object_id", precision: 22
    t.decimal "adt_ab_object_id", precision: 22
    t.index ["ab_object_id"], name: "ab_object_id"
    t.index ["adt_ab_object_id"], name: "adt_ab_object_id"
    t.index ["adt_h_gaz_id"], name: "adt_h_gaz_id"
    t.index ["adt_h_organism_id"], name: "adt_h_organism_id"
    t.index ["adt_iv_con_object_id"], name: "adt_iv_con_object_id"
    t.index ["adt_iv_disease_id"], name: "adt_iv_disease_id"
    t.index ["adt_iv_imm_object_id"], name: "adt_iv_imm_object_id"
    t.index ["ant_con_object_id"], name: "ant_con_object_id"
    t.index ["as_type_id"], name: "as_type_id"
    t.index ["complex_id"], name: "complex_id"
    t.index ["curated_epitope_id"], name: "curated_epitope_id"
    t.index ["h_organism_id"], name: "h_organism_id"
    t.index ["iv1_con_object_id"], name: "iv1_con_object_id"
    t.index ["iv1_disease_id"], name: "iv1_disease_id"
    t.index ["iv1_imm_object_id"], name: "iv1_imm_object_id"
    t.index ["iv2_con_object_id"], name: "iv2_con_object_id"
    t.index ["iv2_disease_id"], name: "iv2_disease_id"
    t.index ["iv2_imm_object_id"], name: "iv2_imm_object_id"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "bcell_receptor", primary_key: ["curated_receptor_id", "bcell_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "curated_receptor_id", precision: 22, null: false
    t.decimal "bcell_id", precision: 22, null: false
    t.index ["bcell_id"], name: "bcell_id"
  end

  create_table "biomutaentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "resId"
    t.index ["proteinId"], name: "index_biomutaentries_on_proteinId"
  end

  create_table "biopython_interactome3ds", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "asa", size: :long
    t.text "interface", size: :long
    t.text "rri", size: :long
    t.text "rri_raw", size: :long
    t.text "rri_n", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "biopython_interfaces", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "asa", size: :long
    t.text "interface", size: :long
    t.text "rri", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "rri_raw", size: :long
    t.text "rri_n", size: :long
  end

  create_table "chain", primary_key: "chain_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "species", precision: 22
    t.string "chain_type", limit: 50, collation: "utf8mb3_bin"
    t.string "v_dom_seq", limit: 200, collation: "utf8mb3_bin"
    t.string "v_gene", limit: 200, collation: "utf8mb3_bin"
    t.string "d_gene", limit: 200, collation: "utf8mb3_bin"
    t.string "j_gene", limit: 200, collation: "utf8mb3_bin"
    t.text "cdr1_seq", size: :long
    t.decimal "cdr1_start", precision: 22
    t.decimal "cdr1_end", precision: 22
    t.text "cdr2_seq", size: :long
    t.decimal "cdr2_start", precision: 22
    t.decimal "cdr2_end", precision: 22
    t.text "cdr3_seq", size: :long
    t.decimal "cdr3_start", precision: 22
    t.decimal "cdr3_end", precision: 22
  end

  create_table "complex", primary_key: "complex_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.text "atom_pairs", size: :long
    t.string "pdb_id", limit: 35, collation: "utf8mb3_bin"
    t.decimal "pdb_cell_contact_area", precision: 22
    t.decimal "e_contact_area", precision: 22
    t.string "e_viewer_status", limit: 25, collation: "utf8mb3_bin"
    t.string "ab_c1_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "ab_c2_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "mhc_c1_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "mhc_c2_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "tcr_c1_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "tcr_c2_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "ant_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "e_pdb_chain", limit: 10, collation: "utf8mb3_bin"
    t.string "e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "ab_ant_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "e_mhc_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "e_tcr_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "mhc_e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "mhc_tcr_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "tcr_e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "tcr_mhc_residues", limit: 1000, collation: "utf8mb3_bin"
    t.text "calc_atom_pairs", size: :long
    t.float "calc_e_contact_area"
    t.float "calc_cell_contact_area"
    t.string "calc_e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_ab_ant_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_e_mhc_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_e_tcr_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_mhc_e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_mhc_tcr_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_tcr_e_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "calc_tcr_mhc_residues", limit: 1000, collation: "utf8mb3_bin"
    t.string "comments", limit: 2000, collation: "utf8mb3_bin"
    t.string "complex_type", limit: 15, collation: "utf8mb3_bin"
    t.string "type_flag", limit: 10, collation: "utf8mb3_bin"
    t.string "c1_type", limit: 15, collation: "utf8mb3_bin"
    t.string "c2_type", limit: 15, collation: "utf8mb3_bin"
    t.string "mhc_chain1", limit: 15, collation: "utf8mb3_bin"
    t.string "mhc_chain2", limit: 15, collation: "utf8mb3_bin"
    t.datetime "modified_date"
    t.datetime "created_date"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "curated_epitope", primary_key: "curated_epitope_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.string "e_name", limit: 150, collation: "utf8mb3_bin"
    t.string "e_location", limit: 100, collation: "utf8mb3_bin"
    t.string "e_region_domain_flag", limit: 200, collation: "utf8mb3_bin"
    t.string "e_comments", limit: 2000, collation: "utf8mb3_bin"
    t.decimal "e_object_id", precision: 22
    t.decimal "related_object_id", precision: 22
    t.string "related_object_type", limit: 200, collation: "utf8mb3_bin"
    t.string "e_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "e_ref_start", precision: 22
    t.decimal "e_ref_end", precision: 22
    t.string "e_ref_region", limit: 2000, collation: "utf8mb3_bin"
    t.index ["e_object_id"], name: "e_object_id_idx"
    t.index ["related_object_id"], name: "related_object_id"
  end

  create_table "curated_receptor", primary_key: "curated_receptor_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "distinct_receptor_id", precision: 22
    t.string "ref_name", limit: 1000, collation: "utf8mb3_bin"
    t.string "ref_synonyms", limit: 200, collation: "utf8mb3_bin"
    t.decimal "rr_id", precision: 22
    t.string "comments", limit: 2000, collation: "utf8mb3_bin"
    t.string "receptor_type", limit: 10, collation: "utf8mb3_bin"
    t.decimal "chain1_id_cur", precision: 22
    t.decimal "chain1_id_calc", precision: 22
    t.string "chain1_nt_acc", limit: 200, collation: "utf8mb3_bin"
    t.text "chain1_nt_seq", size: :long
    t.string "chain1_pro_acc", limit: 200, collation: "utf8mb3_bin"
    t.text "chain1_pro_seq", size: :long
    t.decimal "chain2_id_cur", precision: 22
    t.decimal "chain2_id_calc", precision: 22
    t.string "chain2_nt_acc", limit: 200, collation: "utf8mb3_bin"
    t.text "chain2_nt_seq", size: :long
    t.string "chain2_pro_acc", limit: 200, collation: "utf8mb3_bin"
    t.text "chain2_pro_seq", size: :long
    t.index ["chain1_id_calc"], name: "chain1_id_calc"
    t.index ["chain1_id_cur"], name: "chain1_id_cur"
    t.index ["chain2_id_calc"], name: "chain2_id_calc"
    t.index ["chain2_id_cur"], name: "chain2_id_cur"
    t.index ["distinct_receptor_id"], name: "distinct_receptor_id"
  end

  create_table "dbptmentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "delayed_jobs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", size: :long, null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "disease", primary_key: "disease_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "disease_name", limit: 200, null: false, collation: "utf8mb3_bin"
    t.text "synonyms", size: :long
    t.string "accession", limit: 15, collation: "utf8mb3_bin"
    t.string "disease_source", limit: 15, collation: "utf8mb3_bin"
  end

  create_table "disease_finder_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.string "child_obi_id", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "distinct_chain", primary_key: "distinct_chain_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "species", precision: 22
    t.string "chain_type", limit: 50, collation: "utf8mb3_bin"
    t.string "v_dom_seq", limit: 200, collation: "utf8mb3_bin"
    t.string "v_gene", limit: 200, collation: "utf8mb3_bin"
    t.string "d_gene", limit: 200, collation: "utf8mb3_bin"
    t.string "j_gene", limit: 200, collation: "utf8mb3_bin"
    t.decimal "cdr1_start", precision: 22
    t.decimal "cdr1_end", precision: 22
    t.decimal "cdr2_start", precision: 22
    t.decimal "cdr2_end", precision: 22
    t.decimal "cdr3_start", precision: 22
    t.decimal "cdr3_end", precision: 22
    t.string "cdr1_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "cdr2_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "cdr3_seq", limit: 4000, collation: "utf8mb3_bin"
  end

  create_table "distinct_receptor", primary_key: "distinct_receptor_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "distinct_chain1_id", precision: 22
    t.decimal "distinct_chain2_id", precision: 22
    t.string "receptor_type", limit: 10, collation: "utf8mb3_bin"
    t.decimal "species", precision: 22
    t.index ["distinct_chain1_id"], name: "distinct_chain1_id"
    t.index ["distinct_chain2_id"], name: "distinct_chain2_id"
  end

  create_table "distinct_receptor_receptor_grp", primary_key: ["distinct_receptor_id", "receptor_group_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "receptor_group_id", precision: 22, null: false
    t.decimal "distinct_receptor_id", precision: 22, null: false
    t.string "match_code", limit: 22, collation: "utf8mb3_bin"
    t.index ["receptor_group_id"], name: "receptor_group_id"
  end

  create_table "dsysmapentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ebifeaturesentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "features_type"
  end

  create_table "elmdbentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensembl_data", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "geneId"
    t.string "transcriptId"
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensemblannotationentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "geneId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensemblvariantentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "geneId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "epitope", primary_key: "epitope_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "description", limit: 535, collation: "utf8mb3_bin"
    t.string "linear_peptide_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "linear_peptide_modified_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "linear_peptide_modification", limit: 85, collation: "utf8mb3_bin"
    t.decimal "non_aa_source_id", precision: 22
    t.decimal "disc_source_id", precision: 22
    t.string "disc_region", limit: 4000, collation: "utf8mb3_bin"
    t.string "disc_modification", limit: 85, collation: "utf8mb3_bin"
    t.string "mc_region", limit: 4000, collation: "utf8mb3_bin"
    t.decimal "mc_mol1_source_id", precision: 22
    t.string "mc_mol1_modification", limit: 85, collation: "utf8mb3_bin"
    t.decimal "mc_mol2_source_id", precision: 22
    t.string "mc_mol2_modification", limit: 85, collation: "utf8mb3_bin"
  end

  create_table "epitope_object", primary_key: ["epitope_id", "object_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "epitope_id", precision: 22, null: false
    t.decimal "object_id", precision: 22, null: false
    t.string "source_antigen_accession", limit: 50, collation: "utf8mb3_bin"
    t.decimal "source_organism_org_id", precision: 22
    t.index ["object_id"], name: "object_id_idx"
    t.index ["source_organism_org_id"], name: "source_organism_org_id"
  end

  create_table "geoloc_finder_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.string "obi_id", limit: 200, collation: "utf8mb3_bin"
    t.string "child_obi_id", limit: 200, collation: "utf8mb3_bin"
  end

  create_table "geolocation", primary_key: "gaz_id", id: { type: :string, limit: 200, collation: "utf8mb3_bin" }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "display_name", limit: 500, collation: "utf8mb3_bin"
    t.string "secondary_names", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "interactome3d_data", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pdbId"], name: "index_interactome3d_data_on_pdbId"
  end

  create_table "interactome3d_interactions", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "accA"
    t.string "accB"
    t.string "model_type"
    t.string "file"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["accA"], name: "index_interactome3d_interactions_on_accA"
    t.index ["accB"], name: "index_interactome3d_interactions_on_accB"
    t.index ["file"], name: "index_interactome3d_interactions_on_file"
  end

  create_table "interactome3d_proteins", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "acc"
    t.string "model_type"
    t.string "file"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "begin"
    t.integer "end"
    t.float "coverage"
    t.index ["acc"], name: "index_interactome3d_proteins_on_acc"
    t.index ["file"], name: "index_interactome3d_proteins_on_file"
  end

  create_table "interpro_data", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "interproentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "job_statuses", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "jobId"
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "inputs", size: :long
    t.text "outputs", size: :long
    t.integer "step"
    t.string "info"
  end

  create_table "journal", primary_key: "journal_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "journal_title", limit: 2000, collation: "utf8mb3_bin"
    t.string "journal_issn", limit: 15, collation: "utf8mb3_bin"
    t.string "medline_ta", limit: 200, collation: "utf8mb3_bin"
  end

  create_table "mhc_allele_restriction", primary_key: "displayed_restriction", id: { type: :string, limit: 85, collation: "utf8mb3_bin" }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "mhc_allele_restriction_id", precision: 22, null: false
    t.string "synonyms", limit: 200, collation: "utf8mb3_bin"
    t.string "includes", limit: 85, collation: "utf8mb3_bin"
    t.string "restriction_level", limit: 35, collation: "utf8mb3_bin"
    t.string "organism", limit: 150, collation: "utf8mb3_bin"
    t.decimal "organism_ncbi_tax_id", precision: 22
    t.string "class", limit: 35, collation: "utf8mb3_bin"
    t.string "haplotype", limit: 10, collation: "utf8mb3_bin"
    t.string "locus", limit: 10, collation: "utf8mb3_bin"
    t.string "serotype", limit: 10, collation: "utf8mb3_bin"
    t.string "molecule", limit: 50, collation: "utf8mb3_bin"
    t.string "chain_i_name", limit: 35, collation: "utf8mb3_bin"
    t.string "chain_ii_name", limit: 35, collation: "utf8mb3_bin"
    t.string "chain_i_locus", limit: 10, collation: "utf8mb3_bin"
    t.string "chain_i_mutation", limit: 35, collation: "utf8mb3_bin"
    t.string "chain_ii_locus", limit: 10, collation: "utf8mb3_bin"
    t.string "chain_ii_mutation", limit: 35, collation: "utf8mb3_bin"
    t.decimal "chain_i_source_id", precision: 22
    t.decimal "chain_ii_source_id", precision: 22
    t.string "iri", limit: 100, collation: "utf8mb3_bin"
    t.string "chain_i_accession", limit: 15, collation: "utf8mb3_bin"
    t.string "chain_ii_accession", limit: 15, collation: "utf8mb3_bin"
    t.string "chain_i_mro_id", limit: 15, collation: "utf8mb3_bin"
    t.string "chain_ii_mro_id", limit: 15, collation: "utf8mb3_bin"
  end

  create_table "mhc_bind", primary_key: "mhc_bind_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "curated_epitope_id", precision: 22
    t.string "as_location", limit: 200, collation: "utf8mb3_bin"
    t.decimal "as_type_id", precision: 22
    t.string "as_char_value", limit: 50, collation: "utf8mb3_bin"
    t.float "as_num_value"
    t.string "as_inequality", limit: 5, collation: "utf8mb3_bin"
    t.text "as_comments"
    t.decimal "mhc_allele_restriction_id", precision: 22
    t.string "mhc_allele_name", limit: 85, collation: "utf8mb3_bin"
    t.decimal "complex_id", precision: 22
    t.index ["as_num_value"], name: "as_num_value_idx"
    t.index ["as_type_id"], name: "as_type_id"
    t.index ["complex_id"], name: "complex_id"
    t.index ["curated_epitope_id"], name: "curated_epitope_id"
    t.index ["mhc_allele_name"], name: "mhc_allele_name"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "mhc_elution", primary_key: "mhc_elution_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "curated_epitope_id", precision: 22, null: false
    t.string "as_location", limit: 200, collation: "utf8mb3_bin"
    t.decimal "as_type_id", precision: 22
    t.string "as_char_value", limit: 50, collation: "utf8mb3_bin"
    t.float "as_num_value"
    t.string "as_inequality", limit: 5, collation: "utf8mb3_bin"
    t.decimal "as_num_subjects", precision: 22
    t.decimal "as_num_responded", precision: 22
    t.float "as_response_frequency"
    t.text "as_immunization_comments"
    t.text "as_comments"
    t.decimal "h_organism_id", precision: 22
    t.string "h_gaz_id", collation: "utf8mb3_bin"
    t.string "h_sex", limit: 10, collation: "utf8mb3_bin"
    t.string "h_age", limit: 85, collation: "utf8mb3_bin"
    t.text "h_mhc_types_present"
    t.string "iv1_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "iv1_route", limit: 35, collation: "utf8mb3_bin"
    t.string "iv1_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_disease_id", precision: 22
    t.string "iv1_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "iv1_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_imm_object_id", precision: 22
    t.string "iv1_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "iv1_con_object_id", precision: 22
    t.string "ivt_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "ivt_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "ivt_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "ivt_imm_object_id", precision: 22
    t.string "ivt_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "ivt_con_object_id", precision: 22
    t.decimal "mhc_allele_restriction_id", precision: 22
    t.string "mhc_allele_name", limit: 85, collation: "utf8mb3_bin"
    t.string "mhc_allele_ev", limit: 100, collation: "utf8mb3_bin"
    t.string "ant_type", limit: 50, collation: "utf8mb3_bin"
    t.string "ant_ref_name", limit: 500, collation: "utf8mb3_bin"
    t.decimal "ant_object_id", precision: 22
    t.string "apc_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "apc_tissue_type", limit: 85, collation: "utf8mb3_bin"
    t.string "apc_origin", limit: 85, collation: "utf8mb3_bin"
    t.index ["ant_object_id"], name: "ant_object_id"
    t.index ["as_type_id"], name: "as_type_id"
    t.index ["curated_epitope_id"], name: "curated_epitope_id"
    t.index ["h_gaz_id"], name: "h_gaz_id"
    t.index ["h_organism_id"], name: "h_organism_id"
    t.index ["iv1_con_object_id"], name: "iv1_con_object_id"
    t.index ["iv1_disease_id"], name: "iv1_disease_id"
    t.index ["iv1_imm_object_id"], name: "iv1_imm_object_id"
    t.index ["ivt_con_object_id"], name: "ivt_con_object_id"
    t.index ["ivt_imm_object_id"], name: "ivt_imm_object_id"
    t.index ["mhc_allele_name"], name: "mhc_allele_name"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "mobientries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "molecule_finder_nonp_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "source_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_source_id", precision: 22
    t.string "child_obi_id", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "molecule_finder_prot_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "source_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "child_source_id", precision: 22
    t.string "child_obi_id", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "molprobityentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "object", primary_key: "object_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.string "object_type", limit: 200, null: false, collation: "utf8mb3_bin"
    t.string "object_sub_type", limit: 200, collation: "utf8mb3_bin"
    t.string "object_description", limit: 535, collation: "utf8mb3_bin"
    t.string "derivative_type", limit: 500, collation: "utf8mb3_bin"
    t.decimal "organism_id", precision: 22
    t.decimal "organism2_id", precision: 22
    t.string "region", limit: 1000, collation: "utf8mb3_bin"
    t.decimal "starting_position", precision: 22
    t.decimal "ending_position", precision: 22
    t.string "cell_name", limit: 85, collation: "utf8mb3_bin"
    t.string "cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "tissue_type", limit: 85, collation: "utf8mb3_bin"
    t.string "origin", limit: 85, collation: "utf8mb3_bin"
    t.string "mol1_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "mol1_modified_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "mol1_modification", limit: 85, collation: "utf8mb3_bin"
    t.decimal "mol1_source_id", precision: 22
    t.string "mol2_modified_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "mol2_modification", limit: 85, collation: "utf8mb3_bin"
    t.decimal "mol2_source_id", precision: 22
    t.string "mult_chain_mol_name", limit: 85, collation: "utf8mb3_bin"
    t.index ["organism2_id"], name: "organism2_id"
    t.index ["organism_id"], name: "organism_id"
  end

  create_table "organism", primary_key: "organism_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "parent_tax_id", precision: 22
    t.decimal "active_node", precision: 22
    t.string "path", limit: 500, collation: "utf8mb3_bin"
    t.string "rank", limit: 50, collation: "utf8mb3_bin"
  end

  create_table "organism_finder_host_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "org_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.string "child_org_id", limit: 500, collation: "utf8mb3_bin"
    t.string "child_obi_id", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "organism_finder_src_ancestry", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "node_id", precision: 22
    t.decimal "org_id", precision: 22
    t.string "obi_id", limit: 1000, collation: "utf8mb3_bin"
    t.string "child_org_id", limit: 500, collation: "utf8mb3_bin"
    t.string "child_obi_id", limit: 500, collation: "utf8mb3_bin"
    t.string "child_obi_species_obi", limit: 500, collation: "utf8mb3_bin"
  end

  create_table "organism_names", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "organism_id", precision: 22
    t.string "name_txt", limit: 150, collation: "utf8mb3_bin"
    t.string "name_class", limit: 50, collation: "utf8mb3_bin"
    t.index ["organism_id"], name: "organism_id"
  end

  create_table "pdb_data", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.string "digest"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pdbredoentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pfamentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "phosphoentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "receptor_group", primary_key: "receptor_group_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "receptor_type", limit: 10, collation: "utf8mb3_bin"
    t.decimal "species", precision: 22
    t.string "chain1_cdr3_seq", limit: 4000, collation: "utf8mb3_bin"
    t.string "chain2_cdr3_seq", limit: 4000, collation: "utf8mb3_bin"
  end

  create_table "reference", primary_key: "reference_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "reference_type", limit: 15, null: false, collation: "utf8mb3_bin"
    t.string "curation_keywords", limit: 2000, collation: "utf8mb3_bin"
  end

  create_table "reference_category", primary_key: "ref_category_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "category_name", limit: 80, collation: "utf8mb3_bin"
    t.decimal "priority", precision: 22
    t.decimal "sort_order", precision: 22
  end

  create_table "reference_category_assoc", primary_key: ["reference_id", "ref_category_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "ref_category_id", precision: 22, null: false
    t.index ["ref_category_id"], name: "ref_category_id"
  end

  create_table "reference_linking", primary_key: ["reference_id", "ref_reference_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "ref_reference_id", precision: 22, null: false
    t.string "comments", limit: 2000, collation: "utf8mb3_bin"
    t.string "title", limit: 1000, collation: "utf8mb3_bin"
    t.index ["ref_reference_id"], name: "ref_reference_id"
  end

  create_table "smartentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "source", id: false, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "source_id", precision: 22
    t.string "accession", limit: 15, collation: "utf8mb3_bin"
    t.string "database", limit: 15, collation: "utf8mb3_bin"
    t.string "name", limit: 535, collation: "utf8mb3_bin"
    t.string "aliases", limit: 500, collation: "utf8mb3_bin"
    t.string "chemical_type", limit: 85, collation: "utf8mb3_bin"
    t.datetime "source_date"
    t.text "sequence", size: :long
    t.string "smiles_structure", limit: 3500, collation: "utf8mb3_bin"
    t.text "synonyms", size: :long
    t.decimal "organism_id", precision: 22
    t.string "organism_name", limit: 250, collation: "utf8mb3_bin"
    t.binary "smiles_image", size: :long
    t.index ["organism_id"], name: "organism_id"
  end

  create_table "submission", primary_key: "submission_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22
    t.string "submitter_name", limit: 85, collation: "utf8mb3_bin"
    t.datetime "submission_date"
    t.string "submission_authors", limit: 2000, collation: "utf8mb3_bin"
    t.string "submission_affiliations", limit: 2000, collation: "utf8mb3_bin"
    t.string "submission_title", limit: 400, collation: "utf8mb3_bin"
    t.string "submission_abstract", limit: 4000, collation: "utf8mb3_bin"
    t.index ["reference_id"], name: "reference_id"
  end

  create_table "swissvarentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tcell", primary_key: "tcell_id", id: { type: :decimal, precision: 22 }, charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "reference_id", precision: 22, null: false
    t.decimal "curated_epitope_id", precision: 22, null: false
    t.string "as_location", limit: 200, collation: "utf8mb3_bin"
    t.decimal "as_type_id", precision: 22
    t.string "as_char_value", limit: 50, collation: "utf8mb3_bin"
    t.float "as_num_value"
    t.string "as_inequality", limit: 5, collation: "utf8mb3_bin"
    t.decimal "as_num_subjects", precision: 22
    t.decimal "as_num_responded", precision: 22
    t.float "as_response_frequency"
    t.text "as_immunization_comments"
    t.text "as_comments"
    t.decimal "h_organism_id", precision: 22
    t.string "h_gaz_id", collation: "utf8mb3_bin"
    t.string "h_sex", limit: 10, collation: "utf8mb3_bin"
    t.string "h_age", limit: 85, collation: "utf8mb3_bin"
    t.text "h_mhc_types_present"
    t.string "tcr_name", limit: 2000, collation: "utf8mb3_bin"
    t.string "tcr_c1_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "tcr_c2_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "iv1_route", limit: 35, collation: "utf8mb3_bin"
    t.string "iv1_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_disease_id", precision: 22
    t.string "iv1_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "iv1_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "iv1_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv1_imm_object_id", precision: 22
    t.string "iv1_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "iv1_con_object_id", precision: 22
    t.string "iv2_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "iv2_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "iv2_route", limit: 35, collation: "utf8mb3_bin"
    t.string "iv2_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv2_disease_id", precision: 22
    t.string "iv2_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "iv2_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "iv2_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "iv2_imm_object_id", precision: 22
    t.string "iv2_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "iv2_con_object_id", precision: 22
    t.string "ivt_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "ivt_responder_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "ivt_stimulator_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "ivt_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "ivt_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "ivt_imm_object_id", precision: 22
    t.string "ivt_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "ivt_con_object_id", precision: 22
    t.string "adt_iv_process_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_iv_adjuvants", limit: 400, collation: "utf8mb3_bin"
    t.string "adt_iv_route", limit: 35, collation: "utf8mb3_bin"
    t.string "adt_iv_dose_schedule", limit: 250, collation: "utf8mb3_bin"
    t.decimal "adt_iv_disease_id", precision: 22
    t.string "adt_iv_disease_stage", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_iv_imm_type", limit: 50, collation: "utf8mb3_bin"
    t.string "adt_iv_imm_ref_name", limit: 250, collation: "utf8mb3_bin"
    t.decimal "adt_iv_imm_object_id", precision: 22
    t.string "adt_iv_imm_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "adt_iv_con_object_id", precision: 22
    t.string "adt_tcr_name", limit: 2000, collation: "utf8mb3_bin"
    t.decimal "adt_tcr_organism_id", precision: 22
    t.string "adt_tcr_c1_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_tcr_c2_mol_type", limit: 85, collation: "utf8mb3_bin"
    t.decimal "adt_h_organism_id", precision: 22
    t.string "adt_h_gaz_id", collation: "utf8mb3_bin"
    t.string "adt_h_age", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_h_sex", limit: 10, collation: "utf8mb3_bin"
    t.text "adt_h_mhc_types_present"
    t.string "adt_effector_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_effector_tissue_type", limit: 85, collation: "utf8mb3_bin"
    t.string "adt_effector_origin", limit: 85, collation: "utf8mb3_bin"
    t.text "adt_comments"
    t.string "effector_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "effector_tissue_type", limit: 85, collation: "utf8mb3_bin"
    t.string "effector_origin", limit: 85, collation: "utf8mb3_bin"
    t.decimal "mhc_allele_restriction_id", precision: 22
    t.string "mhc_allele_name", limit: 85, collation: "utf8mb3_bin"
    t.string "mhc_allele_ev", limit: 100, collation: "utf8mb3_bin"
    t.string "mhc_autologous", limit: 1, collation: "utf8mb3_bin"
    t.string "apc_cell_type", limit: 85, collation: "utf8mb3_bin"
    t.string "apc_tissue_type", limit: 85, collation: "utf8mb3_bin"
    t.string "apc_origin", limit: 85, collation: "utf8mb3_bin"
    t.decimal "apc_h_organism_id", precision: 22
    t.string "apc_h_age", limit: 85, collation: "utf8mb3_bin"
    t.string "apc_h_sex", limit: 10, collation: "utf8mb3_bin"
    t.string "apc_h_mhc_types_present", limit: 2000, collation: "utf8mb3_bin"
    t.string "ant_type", limit: 50, collation: "utf8mb3_bin"
    t.string "ant_ref_name", limit: 500, collation: "utf8mb3_bin"
    t.decimal "ant_object_id", precision: 22
    t.string "ant_ev", limit: 100, collation: "utf8mb3_bin"
    t.decimal "ant_con_object_id", precision: 22
    t.decimal "complex_id", precision: 22
    t.decimal "tcr_object_id", precision: 22
    t.decimal "adt_tcr_object_id", precision: 22
    t.index ["adt_h_gaz_id"], name: "adt_h_gaz_id"
    t.index ["adt_h_organism_id"], name: "adt_h_organism_id"
    t.index ["adt_iv_con_object_id"], name: "adt_iv_con_object_id"
    t.index ["adt_iv_disease_id"], name: "adt_iv_disease_id"
    t.index ["adt_iv_imm_object_id"], name: "adt_iv_imm_object_id"
    t.index ["adt_tcr_object_id"], name: "adt_tcr_object_id"
    t.index ["adt_tcr_organism_id"], name: "adt_tcr_organism_id"
    t.index ["ant_con_object_id"], name: "ant_con_object_id"
    t.index ["ant_object_id"], name: "ant_object_id"
    t.index ["as_type_id"], name: "as_type_id"
    t.index ["complex_id"], name: "complex_id"
    t.index ["curated_epitope_id"], name: "curated_epitope_id"
    t.index ["h_gaz_id"], name: "h_gaz_id"
    t.index ["h_organism_id"], name: "h_organism_id"
    t.index ["iv1_con_object_id"], name: "iv1_con_object_id"
    t.index ["iv1_disease_id"], name: "iv1_disease_id"
    t.index ["iv1_imm_object_id"], name: "iv1_imm_object_id"
    t.index ["iv2_con_object_id"], name: "iv2_con_object_id"
    t.index ["iv2_disease_id"], name: "iv2_disease_id"
    t.index ["iv2_imm_object_id"], name: "iv2_imm_object_id"
    t.index ["ivt_con_object_id"], name: "ivt_con_object_id"
    t.index ["ivt_imm_object_id"], name: "ivt_imm_object_id"
    t.index ["reference_id"], name: "reference_id"
    t.index ["tcr_object_id"], name: "tcr_object_id"
  end

  create_table "tcell_receptor", primary_key: ["curated_receptor_id", "tcell_id"], charset: "utf8mb3", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.decimal "curated_receptor_id", precision: 22, null: false
    t.decimal "tcell_id", precision: 22, null: false
    t.index ["tcell_id"], name: "tcell_id"
  end

  create_table "uniprot_to_ensembl_transcripts", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "uniprotmappingentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "gene", size: :long
    t.text "transcript", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
