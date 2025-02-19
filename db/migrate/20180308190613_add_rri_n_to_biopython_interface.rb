class AddRriNToBiopythonInterface < ActiveRecord::Migration[7.1]
  def change
    add_column :biopython_interfaces, :rri_n, :text, limit: 4294967295
  end
end
