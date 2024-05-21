class AddOutputsToJobStatuses < ActiveRecord::Migration[7.1]
  def change
    add_column :job_statuses, :outputs, :text, limit: 4294967295
  end
end
