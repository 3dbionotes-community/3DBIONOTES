class AddInteractome3DIndex < ActiveRecord::Migration
  def change
    add_index :interactome3d_interactions, :accA
    add_index :interactome3d_interactions, :accB
    add_index :interactome3d_interactions, :file

    add_index :interactome3d_proteins, :acc
    add_index :interactome3d_proteins, :file

    add_index :interactome3d_data, :pdbId
  end
end
