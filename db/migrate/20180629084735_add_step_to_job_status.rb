class AddStepToJobStatus < ActiveRecord::Migration[7.1]
  def change
    add_column :job_statuses, :step, :integer
  end
end
