class CreateJobStatuses < ActiveRecord::Migration[7.1]
  def change
    create_table :job_statuses do |t|
      t.string :jobId
      t.integer :status

      t.timestamps null: false
    end
  end
end
