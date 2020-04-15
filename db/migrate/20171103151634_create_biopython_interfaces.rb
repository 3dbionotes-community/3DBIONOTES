class CreateBiopythonInterfaces < ActiveRecord::Migration
  def change
    create_table :biopython_interfaces do |t|
      t.string :pdbId
      t.text :asa, limit: 4294967295
      t.text :interface, limit: 4294967295
      t.text :rri, limit: 4294967295

      t.timestamps null: false
    end
  end
end
