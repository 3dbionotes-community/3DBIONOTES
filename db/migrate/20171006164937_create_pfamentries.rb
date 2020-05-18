class CreatePfamentries < ActiveRecord::Migration
  def change
    create_table :pfamentries do |t|
      t.string :proteinId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
