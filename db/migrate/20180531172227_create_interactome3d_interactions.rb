class CreateInteractome3dInteractions < ActiveRecord::Migration[7.1]
  def change
    create_table :interactome3d_interactions do |t|
      t.string :accA
      t.string :accB
      t.string :type
      t.string :file

      t.timestamps null: false
    end
  end
end
