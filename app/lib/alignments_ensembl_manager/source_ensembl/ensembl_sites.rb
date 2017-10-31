module AlignmentsEnsemblManager
  module SourceEnsembl
    module  EnsemblSites

      include GlobalTools::GlobalSites
      EnsemblServer = GS_EnsemblServer#'http://rest.ensembl.org'
      UniServer = GS_UniServer#'http://www.uniprot.org'

    end 
  end
end
