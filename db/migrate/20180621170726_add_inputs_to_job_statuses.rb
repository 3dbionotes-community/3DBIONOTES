class AddInputsToJobStatuses < ActiveRecord::Migration[7.1]
  def change
    add_column :job_statuses, :inputs, :text, limit: 4294967295
  end
end
