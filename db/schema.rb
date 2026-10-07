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
  create_table "annotations", force: :cascade do |t|
    t.string "proteinId"
    t.string "source"
    t.string "digest"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "biomutaentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "resId"
    t.index ["proteinId"], name: "index_biomutaentries_on_proteinId"
  end

  create_table "biopython_interactome3ds", force: :cascade do |t|
    t.string "pdbId"
    t.text "asa", limit: 4294967295
    t.text "interface", limit: 4294967295
    t.text "rri", limit: 4294967295
    t.text "rri_raw", limit: 4294967295
    t.text "rri_n", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "biopython_interfaces", force: :cascade do |t|
    t.string "pdbId"
    t.text "asa", limit: 4294967295
    t.text "interface", limit: 4294967295
    t.text "rri", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "rri_raw", limit: 4294967295
    t.text "rri_n", limit: 4294967295
  end

  create_table "dbptmentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", limit: 4294967295
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

  create_table "dsysmapentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ebifeaturesentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "features_type"
  end

  create_table "elmdbentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensembl_data", force: :cascade do |t|
    t.string "geneId"
    t.string "transcriptId"
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensemblannotationentries", force: :cascade do |t|
    t.string "geneId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ensemblvariantentries", force: :cascade do |t|
    t.string "geneId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "interactome3d_data", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pdbId"], name: "index_interactome3d_data_on_pdbId"
  end

  create_table "interactome3d_interactions", force: :cascade do |t|
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

  create_table "interactome3d_proteins", force: :cascade do |t|
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

  create_table "interpro_data", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "interproentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "job_statuses", force: :cascade do |t|
    t.string "jobId"
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "inputs", limit: 4294967295
    t.text "outputs", limit: 4294967295
    t.integer "step"
    t.string "info"
  end

  create_table "mobientries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "molprobityentries", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pdb_data", force: :cascade do |t|
    t.string "pdbId"
    t.string "digest"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pdbredoentries", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "pfamentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "phosphoentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "smartentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "swissvarentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "uniprot_to_ensembl_transcripts", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "uniprotmappingentries", force: :cascade do |t|
    t.string "proteinId"
    t.text "gene", limit: 4294967295
    t.text "transcript", limit: 4294967295
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
