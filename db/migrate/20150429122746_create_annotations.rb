class CreateAnnotations < ActiveRecord::Migration[7.1]
  def change
    create_table :annotations do |t|
      t.string :proteinId
      t.string :source
      t.string :digest
      t.text :data

      t.timestamps null: false
    end
  end
end
