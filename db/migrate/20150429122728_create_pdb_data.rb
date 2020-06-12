class CreatePdbData < ActiveRecord::Migration
  def change
    create_table :pdb_data do |t|
      t.string :pdbId
      t.string :digest
      t.text :data

      t.timestamps null: false
    end
  end
end
