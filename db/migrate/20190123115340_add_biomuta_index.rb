class AddBiomutaIndex < ActiveRecord::Migration
  def change
    add_index :biomutaentries, :proteinId
  end
end
