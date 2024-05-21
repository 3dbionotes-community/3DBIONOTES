class CreateEnsemblData < ActiveRecord::Migration[7.1]
  def change
    create_table :ensembl_data do |t|
      t.string :geneId
      t.string :transcriptIn
      t.string :proteinId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
