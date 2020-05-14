class AddStepToJobStatus < ActiveRecord::Migration
  def change
    add_column :job_statuses, :step, :integer
  end
end
