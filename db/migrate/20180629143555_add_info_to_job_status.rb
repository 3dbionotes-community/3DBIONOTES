class AddInfoToJobStatus < ActiveRecord::Migration
  def change
    add_column :job_statuses, :info, :string
  end
end
