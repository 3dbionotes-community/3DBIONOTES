class CreateEnsemblvariantentries < ActiveRecord::Migration
  def change
    create_table :ensemblvariantentries do |t|
      t.string :geneId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
