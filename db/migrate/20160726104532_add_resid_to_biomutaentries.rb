class AddResidToBiomutaentries < ActiveRecord::Migration
  def change
    add_column :biomutaentries, :resId, :integer
  end
end
