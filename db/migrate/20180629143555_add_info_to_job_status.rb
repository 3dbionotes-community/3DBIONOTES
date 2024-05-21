class AddInfoToJobStatus < ActiveRecord::Migration[7.1]
  def change
    add_column :job_statuses, :info, :string
  end
end
