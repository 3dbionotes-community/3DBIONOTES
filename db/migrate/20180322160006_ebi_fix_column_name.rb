class EbiFixColumnName < ActiveRecord::Migration[7.1]
  def change
    rename_column :ebifeaturesentries, :type, :features_type
  end
end
