class AddTypeToEbifeaturesentries < ActiveRecord::Migration[7.1]
  def change
    add_column :ebifeaturesentries, :type, :string
  end
end
