class CreateUniprotmappingentries < ActiveRecord::Migration
  def change
    create_table :uniprotmappingentries do |t|
      t.string :proteinId
      t.text :gene, limit: 4294967295
      t.text :transcript, limit: 4294967295

      t.timestamps null: false
    end
  end
end
