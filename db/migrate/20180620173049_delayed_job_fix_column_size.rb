class DelayedJobFixColumnSize < ActiveRecord::Migration[7.1]
  def change
    change_column :delayed_jobs, :handler, :text, :limit => 4294967295
  end
end
