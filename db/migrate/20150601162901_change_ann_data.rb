class ChangeAnnData < ActiveRecord::Migration[7.1]
  def change
    change_column :annotations, :data, :text, :limit=>4294967295
  end
end
