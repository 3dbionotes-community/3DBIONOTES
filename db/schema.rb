# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190123152406) do

  create_table "annotations", force: :cascade do |t|
    t.string   "proteinId"
    t.string   "source"
    t.string   "digest"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "biomutaentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.integer  "resId"
  end

  add_index "biomutaentries", ["proteinId"], name: "index_biomutaentries_on_proteinId"

  create_table "biopython_interactome3ds", force: :cascade do |t|
    t.string   "pdbId"
    t.text     "asa",        limit: 4294967295
    t.text     "interface",  limit: 4294967295
    t.text     "rri",        limit: 4294967295
    t.text     "rri_raw",    limit: 4294967295
    t.text     "rri_n",      limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "biopython_interfaces", force: :cascade do |t|
    t.string   "pdbId"
    t.text     "asa",        limit: 4294967295
    t.text     "interface",  limit: 4294967295
    t.text     "rri",        limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.text     "rri_raw",    limit: 4294967295
    t.text     "rri_n",      limit: 4294967295
  end

  create_table "dbptmentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer  "priority",                      default: 0, null: false
    t.integer  "attempts",                      default: 0, null: false
    t.text     "handler",    limit: 4294967295,             null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "delayed_jobs", ["priority", "run_at"], name: "delayed_jobs_priority"

  create_table "dsysmapentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "ebifeaturesentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",          limit: 4294967295
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.string   "features_type"
  end

  create_table "elmdbentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "ensembl_data", force: :cascade do |t|
    t.string   "geneId"
    t.string   "transcriptId"
    t.string   "proteinId"
    t.text     "data",         limit: 4294967295
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
  end

  create_table "ensemblannotationentries", force: :cascade do |t|
    t.string   "geneId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "ensemblvariantentries", force: :cascade do |t|
    t.string   "geneId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "interactome3d_data", force: :cascade do |t|
    t.string   "pdbId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  add_index "interactome3d_data", ["pdbId"], name: "index_interactome3d_data_on_pdbId"

  create_table "interactome3d_interactions", force: :cascade do |t|
    t.string   "accA"
    t.string   "accB"
    t.string   "model_type"
    t.string   "file"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "interactome3d_interactions", ["accA"], name: "index_interactome3d_interactions_on_accA"
  add_index "interactome3d_interactions", ["accB"], name: "index_interactome3d_interactions_on_accB"
  add_index "interactome3d_interactions", ["file"], name: "index_interactome3d_interactions_on_file"

  create_table "interactome3d_proteins", force: :cascade do |t|
    t.string   "acc"
    t.string   "model_type"
    t.string   "file"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "begin"
    t.integer  "end"
    t.float    "coverage"
  end

  add_index "interactome3d_proteins", ["acc"], name: "index_interactome3d_proteins_on_acc"
  add_index "interactome3d_proteins", ["file"], name: "index_interactome3d_proteins_on_file"

  create_table "interpro_data", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "interproentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "job_statuses", force: :cascade do |t|
    t.string   "jobId"
    t.integer  "status"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.text     "inputs",     limit: 4294967295
    t.text     "outputs",    limit: 4294967295
    t.integer  "step"
    t.string   "info"
  end

  create_table "mobientries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "molprobityentries", force: :cascade do |t|
    t.string   "pdbId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "pdb_data", force: :cascade do |t|
    t.string   "pdbId"
    t.string   "digest"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "pdbredoentries", force: :cascade do |t|
    t.string   "pdbId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "pfamentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "phosphoentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "smartentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "swissvarentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "uniprot_to_ensembl_transcripts", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "data",       limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "uniprotmappingentries", force: :cascade do |t|
    t.string   "proteinId"
    t.text     "gene",       limit: 4294967295
    t.text     "transcript", limit: 4294967295
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

end
