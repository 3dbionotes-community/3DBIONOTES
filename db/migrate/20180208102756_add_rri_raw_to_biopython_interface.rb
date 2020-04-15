class AddRriRawToBiopythonInterface < ActiveRecord::Migration
  def change
    add_column :biopython_interfaces, :rri_raw, :text, limit: 4294967295
  end
end
