class AddOutputsToJobStatuses < ActiveRecord::Migration
  def change
    add_column :job_statuses, :outputs, :text, limit: 4294967295
  end
end
