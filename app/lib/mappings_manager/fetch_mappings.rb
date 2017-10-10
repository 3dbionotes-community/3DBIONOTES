module MappingsManager
  module FetchMappings

    include SourceMappings::FetchPdbFromEmdb
    def  fetchPDBfromEMDB(emdbId)
      return queryPDBfromEMDB(emdbId)
    end

    include SourceMappings::FetchPdbFromUniprot
    def  fetchPDBfromUniprot(acc)
      return queryPDBfromUniprot(acc)
    end

    include SourceMappings::FetchUniprotFromPdb
    def  fetchUniprotfromPDB(pdbId)
      return queryUniprotfromPDB(pdbId)
    end

    include SourceMappings::FetchEnsemblTranscriptFromUniprot
    def  fetchENSEMBLtranscriptFromUniprot(pdbId)
      return queryENSEMBLtranscriptFromUniprot(pdbId)
    end

  end
end
