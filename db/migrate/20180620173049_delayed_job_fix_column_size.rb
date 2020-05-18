class DelayedJobFixColumnSize < ActiveRecord::Migration
  def change
    change_column :delayed_jobs, :handler, :text, :limit => 4294967295
  end
end
