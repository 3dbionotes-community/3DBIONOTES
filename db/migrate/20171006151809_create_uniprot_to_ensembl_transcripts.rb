class CreateUniprotToEnsemblTranscripts < ActiveRecord::Migration
  def change
    create_table :uniprot_to_ensembl_transcripts do |t|
      t.string :proteinId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
