class CreateInteractome3dProteins < ActiveRecord::Migration[7.1]
  def change
    create_table :interactome3d_proteins do |t|
      t.string :acc
      t.string :type
      t.string :file

      t.timestamps null: false
    end
  end
end
