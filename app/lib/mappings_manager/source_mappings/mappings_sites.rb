module MappingsManager
  module SourceMappings
    module MappingsSites

      include GlobalTools::GlobalSites

      Server = GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      EmdbFit = "emdb/entry/fitted/"
      SIFTSPDB = "mappings/best_structures/"
      SIFTSUniprot = "mappings/uniprot/"
      UniprotURL = GS_UniServer+"uniprot/"#"http://www.uniprot.org/uniprot/"

    end
  end
end
