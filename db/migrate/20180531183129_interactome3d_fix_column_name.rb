class Interactome3dFixColumnName < ActiveRecord::Migration[7.1]
  def change
    rename_column :interactome3d_interactions, :type, :model_type
    rename_column :interactome3d_proteins, :type, :model_type
  end
end
