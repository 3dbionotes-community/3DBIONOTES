class CreateMolprobityentries < ActiveRecord::Migration[7.1]
  def change
    create_table :molprobityentries do |t|
      t.string :pdbId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
