class ChangeColumnPdbData < ActiveRecord::Migration
  def change
    change_column :pdb_data, :data, :text, :limit =>4294967295
  end
end
