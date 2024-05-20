class CreateBiopythonInteractome3ds < ActiveRecord::Migration[7.1]
  def change
    create_table :biopython_interactome3ds do |t|
      t.string :pdbId
      t.text :asa, limit: 4294967295
      t.text :interface, limit: 4294967295
      t.text :rri, limit: 4294967295
      t.text :rri_raw, limit: 4294967295
      t.text :rri_n, limit: 4294967295

      t.timestamps null: false
    end
  end
end
