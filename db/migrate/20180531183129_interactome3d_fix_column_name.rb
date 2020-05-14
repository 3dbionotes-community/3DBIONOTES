class Interactome3dFixColumnName < ActiveRecord::Migration
  def change
    rename_column :interactome3d_interactions, :type, :model_type
    rename_column :interactome3d_proteins, :type, :model_type
  end
end
