class EnsemblDatumFixColumnName < ActiveRecord::Migration
  def change
    rename_column :ensembl_data, :transcriptIn, :transcriptId
  end
end
