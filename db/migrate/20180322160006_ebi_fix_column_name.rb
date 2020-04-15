class EbiFixColumnName < ActiveRecord::Migration
  def change
    rename_column :ebifeaturesentries, :type, :features_type
  end
end
