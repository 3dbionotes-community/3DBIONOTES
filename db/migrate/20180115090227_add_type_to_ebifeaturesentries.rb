class AddTypeToEbifeaturesentries < ActiveRecord::Migration
  def change
    add_column :ebifeaturesentries, :type, :string
  end
end
