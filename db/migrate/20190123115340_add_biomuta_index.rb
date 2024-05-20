class AddBiomutaIndex < ActiveRecord::Migration[7.1]
  def change
    add_index :biomutaentries, :proteinId
  end
end
