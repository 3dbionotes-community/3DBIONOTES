class CreateEnsemblannotationentries < ActiveRecord::Migration[7.1]
  def change
    create_table :ensemblannotationentries do |t|
      t.string :geneId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
