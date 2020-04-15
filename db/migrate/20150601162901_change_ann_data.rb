class ChangeAnnData < ActiveRecord::Migration
  def change
    change_column :annotations, :data, :text, :limit=>4294967295
  end
end
