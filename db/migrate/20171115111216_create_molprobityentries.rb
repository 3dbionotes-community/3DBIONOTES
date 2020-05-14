class CreateMolprobityentries < ActiveRecord::Migration
  def change
    create_table :molprobityentries do |t|
      t.string :pdbId
      t.text :data, limit: 4294967295

      t.timestamps null: false
    end
  end
end
