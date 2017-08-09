module AnnotationManager
  module FetchGeneData

    include SourceGeneData::SourceEnsemblvariants
    def fetchENSEMBLvariants(ensembl_id)
      toReturn = sourceENSEMBLvariants(ensembl_id)
      return toReturn
    end

    include SourceGeneData::SourceEnsemblannotations
    def fetchENSEMBLannotations(ensembl_id)
      toReturn = sourceENSEMBLannotations(ensembl_id)
      return toReturn
    end

  end
end
