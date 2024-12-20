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
  create_table "annotations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.string "source"
    t.string "digest"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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

  create_table "mobientries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "molprobityentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "pdbId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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

  create_table "smartentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "swissvarentries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "proteinId"
    t.text "data", size: :long
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
