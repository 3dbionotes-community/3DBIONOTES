class AddBeginEndCovToInteractome3dProteins < ActiveRecord::Migration[7.1]
  def change
    add_column :interactome3d_proteins, :begin, :integer
    add_column :interactome3d_proteins, :end, :integer
    add_column :interactome3d_proteins, :coverage, :float
  end
end
