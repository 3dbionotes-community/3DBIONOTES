class AddResidToBiomutaentries < ActiveRecord::Migration[7.1]
  def change
    add_column :biomutaentries, :resId, :integer
  end
end
