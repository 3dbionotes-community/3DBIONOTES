class CreatePdbredoentries < ActiveRecord::Migration
  def change
    create_table :pdbredoentries do |t|
      t.string :pdbId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
