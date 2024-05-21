class EnsemblDatumFixColumnName < ActiveRecord::Migration[7.1]
  def change
    rename_column :ensembl_data, :transcriptIn, :transcriptId
  end
end
