class CreateInteractome3dData < ActiveRecord::Migration
  def change
    create_table :interactome3d_data do |t|
      t.string :pdbId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
