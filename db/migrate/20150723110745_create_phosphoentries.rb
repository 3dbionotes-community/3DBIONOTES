class CreatePhosphoentries < ActiveRecord::Migration
  def change
    create_table :phosphoentries do |t|
      t.string :proteinId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
